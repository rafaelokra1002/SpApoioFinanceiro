import { Lead } from '../types';
import { MetricKey, StatusKey, STATUS_ORDER } from '../constants/status';

/**
 * Todas as métricas do dashboard são derivadas no cliente, a partir da lista
 * completa de leads (`GET /admin/leads`). Não há endpoint de agregação no
 * backend — se o volume crescer muito, é aqui que a conta muda de lugar.
 */

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** `2025-05` → `Maio/2025`. */
export function fullMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${MONTHS_PT[Number(m) - 1]}/${y}`;
}

/** Chave de mês no formato `YYYY-MM`. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Mês corrente — âncora das séries do dashboard. */
export function currentMonth(): string {
  return monthKey(new Date());
}

/** `2025-05` → `Mai/25` (eixo do gráfico). */
export function shortMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${MONTHS_SHORT[Number(m) - 1]}/${y.slice(2)}`;
}

/** Soma `delta` meses a uma chave `YYYY-MM`. */
export function addMonths(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

/**
 * Data de corte do dashboard (formato `YYYY-MM-DD`). As métricas, gráficos e
 * rankings do painel só consideram solicitações criadas a partir deste dia
 * (00:00, horário local). Serve para "zerar" o dashboard sem apagar nada: os
 * leads anteriores continuam no banco e na lista de clientes — apenas não
 * entram nas contas do dashboard.
 *
 * Deixe a string vazia ('') para voltar a exibir todo o histórico.
 */
export const DASHBOARD_START_DATE = '2026-08-03';

/** `true` se o lead deve entrar no dashboard, conforme a data de corte acima. */
export function afterDashboardStart(lead: Lead): boolean {
  if (!DASHBOARD_START_DATE) return true;
  return new Date(lead.createdAt).getTime() >= new Date(`${DASHBOARD_START_DATE}T00:00:00`).getTime();
}

/** Rótulos das origens reais escolhidas no app (campo `origem`). */
const ORIGEM_LABELS: Record<string, string> = {
  INDICACAO: 'Indicação de Amigos',
  INSTAGRAM: 'Instagram e Blogueiros',
  PANFLETO: 'Panfleto',
};

/**
 * Origem do cliente. Leads novos trazem o campo real `origem` (escolhido no envio);
 * para os antigos, sem esse campo, derivamos por palavra-chave sobre o texto livre
 * `indicacao` — caindo em "Indicação de Amigos" quando há um nome preenchido.
 */
export function origemOf(lead: Lead): string {
  const origem = (lead.origem || '').trim().toUpperCase();
  if (origem && ORIGEM_LABELS[origem]) return ORIGEM_LABELS[origem];

  const raw = (lead.indicacao || '').trim();
  // Sem indicação preenchida, consideramos origem "Panfleto".
  if (!raw) return 'Panfleto';

  const t = raw.toLowerCase();
  if (t.includes('instagram') || t.includes('blogueir') || t.includes('@')) return 'Instagram e Blogueiros';
  if (t.includes('panfleto')) return 'Panfleto';
  if (t.includes('facebook')) return 'Facebook';
  if (t.includes('google')) return 'Google';
  return 'Indicação de Amigos';
}

/* ---------------------------------------------------------------- métricas */

export type Counts = Record<MetricKey, number>;

export function countMetrics(leads: Lead[]): Counts {
  const counts = {
    total: leads.length,
    PENDENTE: 0, APROVADO: 0, RECUSADO: 0, NAO_CONTRATOU: 0, PASSEI_COLABORADOR: 0,
  } as Counts;

  for (const lead of leads) {
    if (STATUS_ORDER.includes(lead.status as StatusKey)) {
      counts[lead.status as StatusKey] += 1;
    }
  }
  return counts;
}

/** Modalidade derivada do prazo (não é campo real): até 30 dias = À vista. */
export function modalidade(prazoDias: number): string {
  return prazoDias <= 30 ? 'À vista' : 'Parcelado';
}

/** Telefone só com dígitos, para casar o mesmo cliente entre solicitações. */
function phoneKey(lead: Lead): string {
  return (lead.telefone || '').replace(/\D/g, '');
}

/**
 * Solicitações anteriores do mesmo cliente (mesmo telefone), mais recentes primeiro.
 * Usado para sinalizar quem "já solicitou antes".
 */
export function priorRequestsOf(lead: Lead, all: Lead[]): Lead[] {
  const key = phoneKey(lead);
  if (!key) return [];
  return all
    .filter((o) => o.id !== lead.id && phoneKey(o) === key && new Date(o.createdAt) < new Date(lead.createdAt))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/**
 * Busca por nome ou telefone. O trecho de telefone só entra quando a busca tem
 * dígitos — comparar `telefone.includes('')` casaria com todo mundo.
 */
export function matchesSearch(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (lead.nome.toLowerCase().includes(q)) return true;
  const digits = q.replace(/\D/g, '');
  return digits !== '' && lead.telefone.replace(/\D/g, '').includes(digits);
}

/** Contagens apenas dos leads criados nos últimos `days` dias. */
export function countLastDays(leads: Lead[], days: number): Counts {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return countMetrics(leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff));
}

/* ------------------------------------------------------------------ séries */

export interface MonthPoint {
  key: string;
  label: string;
  counts: Counts;
}

/** Série mensal terminando em `endKey` (inclusive), com `n` meses. */
export function monthSeries(leads: Lead[], endKey: string, n: number): MonthPoint[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) keys.push(addMonths(endKey, -i));

  const buckets = new Map<string, Lead[]>(keys.map((k) => [k, []]));
  for (const lead of leads) {
    buckets.get(monthKey(new Date(lead.createdAt)))?.push(lead);
  }

  return keys.map((key) => ({
    key,
    label: shortMonthLabel(key),
    counts: countMetrics(buckets.get(key) ?? []),
  }));
}

/* ---------------------------------------------------------------- rankings */

export interface RankRow {
  label: string;
  count: number;
  pct: number;
}

export function rank(leads: Lead[], keyOf: (lead: Lead) => string, limit = 5): {
  rows: RankRow[];
  total: number;
} {
  const map = new Map<string, number>();
  for (const lead of leads) {
    const k = keyOf(lead) || '—';
    map.set(k, (map.get(k) ?? 0) + 1);
  }

  const total = leads.length;
  const rows = [...map.entries()]
    .map(([label, count]) => ({ label, count, pct: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { rows, total };
}

/* ----------------------------------------------------------------- resumo */

export interface Summary {
  taxaAprovacao: number;
  aprovados: number;
  totalClientes: number;
  taxaContratacao: number;
  contratados: number;
  decididos: number;
  topCidade: RankRow | null;
  topOrigem: RankRow | null;
}

export function buildSummary(leads: Lead[]): Summary {
  const c = countMetrics(leads);

  // Contratação = quem foi aprovado e efetivamente fechou, sobre o universo de
  // aprovados que já têm desfecho (fechou ou não contratou).
  const decididos = c.APROVADO + c.NAO_CONTRATOU;

  const cidades = rank(leads.filter((l) => l.status === 'APROVADO'), (l) => l.cidade, 1);
  const origens = rank(leads, origemOf, 1);

  return {
    taxaAprovacao: c.total ? (c.APROVADO / c.total) * 100 : 0,
    aprovados: c.APROVADO,
    totalClientes: c.total,
    taxaContratacao: decididos ? (c.APROVADO / decididos) * 100 : 0,
    contratados: c.APROVADO,
    decididos,
    topCidade: cidades.rows[0] ?? null,
    topOrigem: origens.rows[0] ?? null,
  };
}

/* ---------------------------------------------------------------- formatos */

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
