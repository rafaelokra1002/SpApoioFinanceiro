import { City, LeadData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || (
  import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://api.spapoiofinanceiro.com/api'
);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Cidades atendidas, definidas no painel. Lança em caso de erro (o hook usa a lista fixa como reserva). */
export async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_BASE}/cities`);
  const result: ApiResponse<City[]> = await res.json();
  if (!res.ok || !result.success || !result.data) throw new Error(result.error || 'Erro ao carregar cidades');
  return result.data;
}

/**
 * Forma de pagamento oferecida (à vista ou parcelado): decidida pelo admin, o
 * cliente não escolhe. Lança em caso de erro (o hook usa 'VISTA' como reserva).
 */
export async function fetchModalidadePagamento(): Promise<'VISTA' | 'PARCELADO'> {
  const res = await fetch(`${API_BASE}/settings/modalidade-pagamento`);
  const result: ApiResponse<{ modalidade: 'VISTA' | 'PARCELADO' }> = await res.json();
  if (!res.ok || !result.success || !result.data) throw new Error(result.error || 'Erro ao carregar configuração');
  return result.data.modalidade;
}

type DocRef = { tipo: string; url: string; filename: string };

/** Arquivos já enviados nesta sessão: se o cliente tentar de novo, não reenvia o que já subiu. */
const enviados = new WeakMap<File, DocRef>();

const MSG_SEM_CONEXAO = 'Não conseguimos concluir o envio. Verifique sua internet e tente de novo.';

/** Lê a resposta (pode não ser JSON, ex.: página de erro do proxy) e monta o erro amigável. */
async function lerResposta(res: Response): Promise<ApiResponse> {
  let result: ApiResponse | null = null;
  try { result = await res.json(); } catch { /* não-JSON */ }
  if (!res.ok) {
    return {
      success: false,
      error: result?.error
        || (res.status === 413
          ? 'Arquivo muito grande. Envie uma foto menor ou um PDF mais leve.'
          : `O servidor não conseguiu processar o envio (código ${res.status}). Tente novamente em instantes.`),
    };
  }
  return result ?? { success: false, error: 'Resposta inesperada do servidor. Tente novamente.' };
}

/**
 * Envia UM documento. Cada arquivo vai numa requisição curta (o proxy da hospedagem
 * corta envios que passam de 60s); se a conexão cair, tenta de novo até 3 vezes.
 */
async function enviarDocumento(tipo: string, file: File): Promise<{ ok: true; ref: DocRef } | { ok: false; error: string }> {
  const ja = enviados.get(file);
  if (ja) return { ok: true, ref: ja };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const fd = new FormData();
    fd.append('documento', file, `${tipo}.${ext}`);
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/lead/upload`, { method: 'POST', body: fd });
    } catch {
      // Conexão caiu: espera um pouco e tenta de novo.
      if (tentativa < 3) { await new Promise((r) => setTimeout(r, 1500 * tentativa)); continue; }
      return { ok: false, error: `${MSG_SEM_CONEXAO} (${tipo})` };
    }
    const result = await lerResposta(res);
    if (!result.success || !result.data) return { ok: false, error: result.error || `Falha ao enviar "${tipo}".` };
    enviados.set(file, result.data as DocRef);
    return { ok: true, ref: result.data as DocRef };
  }
  return { ok: false, error: MSG_SEM_CONEXAO };
}

export async function submitLeadWithDocuments(
  data: LeadData,
  documents: { tipo: string; file: File }[],
  onProgress?: (enviados: number, total: number) => void,
): Promise<ApiResponse> {
  try {
    // 1) Documentos, um por vez.
    const refs: DocRef[] = [];
    for (let i = 0; i < documents.length; i++) {
      onProgress?.(i, documents.length);
      const r = await enviarDocumento(documents[i].tipo, documents[i].file);
      if (!r.ok) return { success: false, error: r.error };
      refs.push(r.ref);
    }
    onProgress?.(documents.length, documents.length);

    // 2) Solicitação com os dados + referências (requisição pequena e rápida).
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    formData.append('documentosEnviados', JSON.stringify(refs));

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/lead/complete`, { method: 'POST', body: formData });
    } catch {
      return { success: false, error: MSG_SEM_CONEXAO };
    }
    return await lerResposta(res);
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao enviar solicitação' };
  }
}
