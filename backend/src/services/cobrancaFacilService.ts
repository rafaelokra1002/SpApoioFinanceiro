/**
 * Integração com o sistema SP Cobrança Fácil.
 *
 * A página pública de registro (`/registro/<token>`) envia um POST para
 * `<base>/api/registro` com o corpo `{ token, ...campos, photos: [{name,type,dataUrl}] }`.
 * Aqui reproduzimos essa chamada server-to-server para cadastrar o cliente
 * automaticamente, já com os dados e a documentação que temos.
 *
 * Configuração por env (com padrão apontando para o link atual):
 *   COBRANCA_FACIL_URL   → base do sistema (ex.: http://host)
 *   COBRANCA_FACIL_TOKEN → token do link de registro (trecho final da URL)
 */

const DEFAULT_URL = 'http://xidzirhh90qqa6tbgbsdnjmq.82.25.75.212.sslip.io';
const DEFAULT_TOKEN = 'Y21yODNvMnI2MDAxcnphYTl4Ymx4YzF0Mw';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

function baseUrl(): string {
  return (process.env.COBRANCA_FACIL_URL || DEFAULT_URL).replace(/\/+$/, '');
}

function registroToken(): string {
  return process.env.COBRANCA_FACIL_TOKEN || DEFAULT_TOKEN;
}

interface LeadLike {
  nome: string;
  telefone: string;
  cpf: string | null;
  instagram: string | null;
  renda: string | null;
  cep: string | null;
  endereco: string | null;
  bairroTrabalho: string | null;
  cidade: string;
  perfil: string;
  documentos?: { url: string; filename: string }[];
}

interface Photo {
  name: string;
  type: string;
  dataUrl: string;
}

/** Baixa um documento e devolve como data URL base64 (ou null se falhar). */
async function toPhoto(url: string, filename: string): Promise<Photo | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    return { name: filename, type, dataUrl: `data:${type};base64,${buffer.toString('base64')}` };
  } catch {
    return null;
  }
}

export async function enviarCadastro(lead: LeadLike): Promise<{ success: boolean; error?: string }> {
  // Só imagens vão como "photos"; outros arquivos (PDF) são ignorados.
  const imagens = (lead.documentos ?? []).filter(
    (d) => IMAGE_EXT.test(d.filename) || IMAGE_EXT.test(d.url),
  );
  const photos: Photo[] = [];
  for (const doc of imagens) {
    const photo = await toPhoto(doc.url, doc.filename);
    if (photo) photos.push(photo);
  }

  const payload = {
    token: registroToken(),
    name: lead.nome || '',
    phone: lead.telefone || '',
    document: lead.cpf || '',
    instagram: lead.instagram || '',
    income: lead.renda || '',
    zipCode: lead.cep || '',
    address: lead.endereco || '',
    number: '',
    neighborhood: lead.bairroTrabalho || '',
    complement: '',
    city: lead.cidade || '',
    state: '',
    profession: lead.perfil || '',
    housingType: '',
    photos,
  };

  try {
    const res = await fetch(`${baseUrl()}/api/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return { success: false, error: data.error || `Cobrança Fácil respondeu ${res.status}` };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao conectar ao Cobrança Fácil',
    };
  }
}
