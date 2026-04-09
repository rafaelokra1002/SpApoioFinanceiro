import { LeadData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || (
  import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://spapoiofinanceiro.onrender.com/api'
);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

    const res = await fetch(`${API_BASE}/lead/complete`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao enviar dados');
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao enviar solicitação' };
  }
}
