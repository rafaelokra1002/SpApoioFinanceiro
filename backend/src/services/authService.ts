import { PrismaClient } from '@prisma/client';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Autenticação simples do painel: uma única senha compartilhada, guardada como
 * hash numa tabela chave-valor (`app_settings`). A tabela é criada com
 * CREATE TABLE IF NOT EXISTS no boot, então não depende de migração manual.
 */

const prisma = new PrismaClient();

const HASH_KEY = 'admin_password_hash';
const EMAIL_KEY = 'admin_email';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'sp123456';
const DEFAULT_EMAIL = (process.env.ADMIN_EMAIL || 'santanavv33@gmail.com').toLowerCase();
const TOKEN_PEPPER = process.env.ADMIN_TOKEN_SECRET || 'sp-apoio-token-pepper';

let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)'
  );
  tableReady = true;
}

async function getSetting(key: string): Promise<string | null> {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
    'SELECT value FROM app_settings WHERE key = $1',
    key
  );
  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await ensureTable();
  await prisma.$executeRawUnsafe(
    'INSERT INTO app_settings (key, value) VALUES ($1, $2) ' +
      'ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    key,
    value
  );
}

/* --------------------------------------------------------------- senha */

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Hash atual; na primeira vez cria com a senha padrão. */
async function getOrInitHash(): Promise<string> {
  const existing = await getSetting(HASH_KEY);
  if (existing) return existing;
  const hash = hashPassword(DEFAULT_PASSWORD);
  await setSetting(HASH_KEY, hash);
  return hash;
}

/** E-mail do administrador; na primeira vez grava o padrão. */
async function getOrInitEmail(): Promise<string> {
  const existing = await getSetting(EMAIL_KEY);
  if (existing) return existing;
  await setSetting(EMAIL_KEY, DEFAULT_EMAIL);
  return DEFAULT_EMAIL;
}

export async function getEmail(): Promise<string> {
  return getOrInitEmail();
}

/** Chamado no boot para garantir tabela + credenciais padrão. */
export async function ensureAuthReady(): Promise<void> {
  await getOrInitHash();
  await getOrInitEmail();
}

export async function checkPassword(password: string): Promise<boolean> {
  const hash = await getOrInitHash();
  return verifyPassword(password, hash);
}

/** Login exige e-mail (fixo) + senha corretos. */
export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const storedEmail = await getOrInitEmail();
  if (email.trim().toLowerCase() !== storedEmail.toLowerCase()) return false;
  return checkPassword(password);
}

export async function changePassword(current: string, next: string): Promise<
  { ok: true; token: string } | { ok: false; error: string }
> {
  if (!next || next.length < 6) {
    return { ok: false, error: 'A nova senha deve ter pelo menos 6 caracteres' };
  }
  const hash = await getOrInitHash();
  if (!verifyPassword(current, hash)) {
    return { ok: false, error: 'Senha atual incorreta' };
  }
  const newHash = hashPassword(next);
  await setSetting(HASH_KEY, newHash);
  return { ok: true, token: signToken(newHash) };
}

/* --------------------------------------------------------------- token */

// Token stateless assinado com segredo derivado do hash atual: trocar a senha
// invalida todas as sessões, e sobrevive a reinícios do servidor.
function tokenSecret(hash: string): string {
  return `${hash}:${TOKEN_PEPPER}`;
}

function signToken(hash: string): string {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  const sig = createHmac('sha256', tokenSecret(hash)).update(exp).digest('hex');
  return `${exp}.${sig}`;
}

export async function issueToken(): Promise<string> {
  return signToken(await getOrInitHash());
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;

  const hash = await getOrInitHash();
  const expected = createHmac('sha256', tokenSecret(hash)).update(exp).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
