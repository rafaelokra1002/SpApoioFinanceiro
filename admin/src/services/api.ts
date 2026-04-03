const API_BASE = 'https://spapoiofinanceiro.onrender.com/api';

export async function fetchLeads(status?: string) {
  const url = status
    ? `${API_BASE}/admin/leads?status=${status}`
    : `${API_BASE}/admin/leads`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchLeadById(id: string) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}`);
  return res.json();
}

export async function updateLeadStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteLead(id: string) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  return res.json();
}

// Categories API
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/admin/categories`);
  return res.json();
}

export async function createCategory(data: { value: string; label: string; icon?: string; order?: number; documents?: any[] }) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCategory(id: string, data: { label?: string; icon?: string; order?: number; active?: boolean }) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function addCategoryDocument(categoryId: string, data: { key: string; label: string; description?: string; icon?: string; order?: number }) {
  const res = await fetch(`${API_BASE}/admin/categories/${categoryId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCategoryDocument(docId: string, data: { key?: string; label?: string; description?: string; icon?: string; order?: number }) {
  const res = await fetch(`${API_BASE}/admin/categories/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategoryDocument(docId: string) {
  const res = await fetch(`${API_BASE}/admin/categories/documents/${docId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function seedCategories() {
  const res = await fetch(`${API_BASE}/admin/categories/seed`, {
    method: 'POST',
  });
  return res.json();
}

// WhatsApp API
export async function getWhatsAppStatus() {
  const res = await fetch(`${API_BASE}/admin/whatsapp/status`);
  return res.json();
}

export async function getWhatsAppQRCode() {
  const res = await fetch(`${API_BASE}/admin/whatsapp/qrcode`);
  return res.json();
}

export async function disconnectWhatsApp() {
  const res = await fetch(`${API_BASE}/admin/whatsapp/disconnect`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const res = await fetch(`${API_BASE}/admin/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message }),
  });
  return res.json();
}
