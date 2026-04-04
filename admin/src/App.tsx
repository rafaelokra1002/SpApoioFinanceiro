import { useState, useEffect, useCallback } from 'react';
import { Lead, Stats, Category } from './types';
import {
  fetchLeads, fetchStats, updateLeadStatus, deleteLead,
  fetchCategories, sendWhatsAppByLead, getWhatsAppStatus, fetchMessageTemplates,
} from './services/api';
import Sidebar from './components/Sidebar';
import HeaderCards from './components/HeaderCards';
import TableLeads from './components/TableLeads';
import LeadDetail from './components/LeadDetail';
import CategoryManager from './components/CategoryManager';
import WhatsAppManager from './components/WhatsAppManager';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function App() {
  const [page, setPage] = useState<'leads' | 'categories' | 'whatsapp'>('leads');
  const [waConnected, setWaConnected] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string>>({});

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetchCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setCatLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads(filter || undefined),
        fetchStats(),
      ]);
      if (leadsRes.success) setLeads(leadsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    getWhatsAppStatus().then(res => {
      if (res.success) setWaConnected(res.data.connected);
    }).catch(() => {});
    fetchMessageTemplates().then(res => {
      if (res.success && res.data) {
        const map: Record<string, string> = {};
        for (const t of res.data) map[t.status] = t.content;
        setTemplates(map);
      }
    }).catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const currentLead = selectedLead?.id === id
      ? selectedLead
      : leads.find((lead) => lead.id === id) || null;

    const res = await updateLeadStatus(id, status);
    if (res.success) {
      const updatedLead = currentLead ? { ...currentLead, status } : null;

      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }

      if (updatedLead) {
        await sendWhatsApp(updatedLead);
      }

      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    const res = await deleteLead(id);
    if (res.success) {
      setSelectedLead(null);
      loadData();
    }
  };

  const sendWhatsApp = async (lead: Lead) => {
    const statusRes = await getWhatsAppStatus().catch(() => null);
    const connected = Boolean(statusRes?.success && statusRes.data?.connected);
    setWaConnected(connected);

    if (!connected) {
      alert('WhatsApp não está conectado no painel. Conecte o WhatsApp antes de enviar mensagens.');
      return;
    }

    const res = await sendWhatsAppByLead(lead.id);
    if (res.success) {
      alert(`✅ Mensagem enviada para ${lead.nome}`);
      return;
    }

    alert(`❌ Erro ao enviar mensagem para ${lead.nome}: ${res.error || 'Falha ao enviar'}`);
  };

  const handleNavigate = (p: 'leads' | 'categories' | 'whatsapp', f?: string) => {
    setPage(p);
    if (p === 'leads') {
      setFilter(f || '');
      setSelectedLead(null);
    } else if (p === 'categories') {
      loadCategories();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar
        page={page}
        filter={filter}
        onNavigate={handleNavigate}
        onRefresh={loadData}
      />

      {/* Main Content */}
      <main className="lg:ml-[240px] min-h-screen p-6 pt-16 lg:pt-6">
        {page === 'leads' && (
          <>
            <HeaderCards stats={stats} />
            <div className="flex gap-5">
              <TableLeads
                leads={leads}
                loading={loading}
                filter={filter}
                selectedLeadId={selectedLead?.id || null}
                onSelectLead={setSelectedLead}
                onStatusChange={handleStatusChange}
                onWhatsApp={sendWhatsApp}
              />
              {selectedLead && (
                <LeadDetail
                  lead={selectedLead}
                  onClose={() => setSelectedLead(null)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onWhatsApp={sendWhatsApp}
                />
              )}
            </div>
          </>
        )}

        {page === 'categories' && (
          <CategoryManager
            categories={categories}
            loading={catLoading}
            onReload={loadCategories}
          />
        )}

        {page === 'whatsapp' && <WhatsAppManager />}
      </main>
    </div>
  );
}
