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

export async function submitLeadWithDocuments(
  data: LeadData,
  documents: { tipo: string; file: File }[]
): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    documents.forEach((doc) => {
      const ext = doc.file.name.split('.').pop()?.toLowerCase() || 'jpg';
      formData.append('documentos', doc.file, `${doc.tipo}.${ext}`);
    });

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/lead/complete`, { method: 'POST', body: formData });
    } catch {
      // "Failed to fetch": a conexão caiu ou foi cortada antes de haver resposta.
      return {
        success: false,
        error: 'Não conseguimos concluir o envio. Verifique sua internet e tente de novo. '
          + 'Se as fotos são da galeria, tente pelo botão "Foto" ou envie em PDF.',
      };
    }

    // A resposta pode não ser JSON (ex.: página de erro do servidor/proxy).
    let result: ApiResponse | null = null;
    try { result = await res.json(); } catch { /* não-JSON */ }

    if (!res.ok) {
      return {
        success: false,
        error: result?.error
          || (res.status === 413
            ? 'Os arquivos são muito grandes. Envie fotos menores ou PDFs mais leves.'
            : `O servidor não conseguiu processar o envio (código ${res.status}). Tente novamente em instantes.`),
      };
    }
    return result ?? { success: false, error: 'Resposta inesperada do servidor. Tente novamente.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao enviar solicitação' };
  }
}
