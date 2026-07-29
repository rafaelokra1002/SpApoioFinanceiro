const API_BASE = import.meta.env.VITE_API_BASE || (
  import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://api.spapoiofinanceiro.com/api'
);

/* ----------------------------------------------------------------- token */

const TOKEN_KEY = 'sp-admin-token';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Disparado quando o backend recusa o token (sessão expirada/inválida). */
export const UNAUTHORIZED_EVENT = 'sp-admin-unauthorized';

interface ReqOpts {
  /** Não redirecionar para login em 401 (ex.: a própria tela de login). */
  skipAuthRedirect?: boolean;
}

async function req(path: string, init: RequestInit = {}, opts: ReqOpts = {}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
    ...(init.headers as Record<string, string>),
  };
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !opts.skipAuthRedirect) {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return res.json();
}

/* ------------------------------------------------------------------ auth */

/** E-mail da conta de admin (exibido no login/topbar/perfil). */
export const ADMIN_EMAIL = 'santanavv33@gmail.com';

export async function login(email: string, password: string) {
  return req('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, { skipAuthRedirect: true });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return req('/admin/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/* ----------------------------------------------------------------- leads */

export async function fetchLeads(status?: string) {
  const path = status ? `/admin/leads?status=${status}` : '/admin/leads';
  try {
    return await req(path);
  } catch (err) {
    // Só em desenvolvimento: sem backend local, devolve dados de exemplo.
    if (import.meta.env.DEV) {
      const { DEV_SAMPLE_LEADS } = await import('./devMocks');
      const data = status ? DEV_SAMPLE_LEADS.filter((l) => l.status === status) : DEV_SAMPLE_LEADS;
      console.warn('[dev] backend offline — usando dados de exemplo (devMocks.ts)');
      return { success: true, data };
    }
    throw err;
  }
}

export async function fetchLeadById(id: string) {
  return req(`/admin/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: string) {
  return req(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function updateLeadGroups(id: string, data: { evitarGolpes?: boolean; analiseCliente?: boolean; grupo?: number | null; motivoRecusa?: string | null; valorAprovado?: number | null; valorTotal?: number; modalidadeAprovada?: string | null; deveAlguem?: string | null }) {
  return req(`/admin/leads/${id}/grupos`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteLead(id: string) {
  return req(`/admin/leads/${id}`, { method: 'DELETE' });
}

/** Envia os dados + documentos do cliente para o sistema Cobrança Fácil. */
export async function enviarCobrancaFacil(id: string) {
  return req(`/admin/leads/${id}/cobranca-facil`, { method: 'POST' });
}

export async function fetchStats() {
  return req('/admin/stats');
}

/* ------------------------------------------------------------- categories */

export async function fetchCategories() {
  return req('/admin/categories');
}

export async function createCategory(data: { value: string; label: string; icon?: string; order?: number; documents?: any[] }) {
  return req('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCategory(id: string, data: { label?: string; icon?: string; order?: number; active?: boolean }) {
  return req(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategory(id: string) {
  return req(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function addCategoryDocument(categoryId: string, data: { key: string; label: string; description?: string; icon?: string; order?: number }) {
  return req(`/admin/categories/${categoryId}/documents`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCategoryDocument(docId: string, data: { key?: string; label?: string; description?: string; icon?: string; order?: number }) {
  return req(`/admin/categories/documents/${docId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategoryDocument(docId: string) {
  return req(`/admin/categories/documents/${docId}`, { method: 'DELETE' });
}

export async function seedCategories() {
  return req('/admin/categories/seed', { method: 'POST' });
}

/* ----------------------------------------------------------------- cities */

export async function fetchCities() {
  return req('/admin/cities');
}

export async function createCity(data: { nome: string; uf?: string; order?: number; active?: boolean }) {
  return req('/admin/cities', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCity(id: string, data: { nome?: string; uf?: string; order?: number; active?: boolean }) {
  return req(`/admin/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCity(id: string) {
  return req(`/admin/cities/${id}`, { method: 'DELETE' });
}

export async function seedCities() {
  return req('/admin/cities/seed', { method: 'POST' });
}

/* -------------------------------------------------------------- whatsapp */

export async function getWhatsAppStatus() {
  return req('/admin/whatsapp/status');
}

export async function getWhatsAppQRCode() {
  return req('/admin/whatsapp/qrcode', { cache: 'no-store' });
}

export async function disconnectWhatsApp() {
  return req('/admin/whatsapp/disconnect', { method: 'DELETE' });
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  return req('/admin/whatsapp/send', { method: 'POST', body: JSON.stringify({ phone, message }) });
}

export async function sendWhatsAppByLead(leadId: string) {
  return req('/admin/whatsapp/send-lead', { method: 'POST', body: JSON.stringify({ leadId }) });
}

export async function fetchMessageLogs(leadId: string) {
  return req(`/admin/whatsapp/logs/${leadId}`);
}

export async function fetchMessageTemplates() {
  return req('/admin/whatsapp/templates');
}

export async function seedMessageTemplates() {
  return req('/admin/whatsapp/templates/seed', { method: 'POST' });
}

export async function upsertMessageTemplate(status: string, content: string) {
  return req(`/admin/whatsapp/templates/${status}`, { method: 'PUT', body: JSON.stringify({ content }) });
}
