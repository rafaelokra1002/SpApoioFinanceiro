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
