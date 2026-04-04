import { useState, useEffect, useCallback } from 'react';
import { Lead, Stats, Category } from './types';
import {
  fetchLeads, fetchStats, updateLeadStatus, deleteLead,
  fetchCategories, fetchMessageTemplates,
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

function parseTemplate(template: string, data: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}

export default function App() {
  const [page, setPage] = useState<'leads' | 'categories' | 'whatsapp'>('leads');
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
    fetchMessageTemplates().then(res => {
      if (res.success && res.data) {
        const map: Record<string, string> = {};
        for (const t of res.data) map[t.status] = t.content;
        setTemplates(map);
      }
    }).catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateLeadStatus(id, status);
    if (res.success) {
      loadData();
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
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
    const phone = lead.telefone.replace(/\D/g, '');
    const phoneFormatted = phone.startsWith('55') ? phone : `55${phone}`;
    const nome = lead.nome.split(' ')[0];
    const valor = formatCurrency(lead.valorSolicitado);

    const defaultMessages: Record<string, string> = {
      PENDENTE: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *${valor}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nFique tranquilo(a), assim que tivermos uma atualização, entraremos em contato por aqui mesmo.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      EM_ANALISE: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nPassando para informar que sua solicitação de crédito no valor de *${valor}* já está *em análise* pela nossa equipe.\n\nEstamos avaliando toda a documentação enviada e em breve teremos uma resposta para você.\n\nAgradecemos a confiança e a paciência!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      APROVADO: `Olá *${nome}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *${valor}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para agendar a assinatura do contrato e finalizar todo o processo.\n\nAgradecemos por escolher a *SP Apoio Financeiro*. Estamos felizes em poder ajudar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      RECUSADO: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nApós análise criteriosa, infelizmente não foi possível aprovar sua solicitação de crédito no valor de *${valor}* neste momento.\n\nIsso não significa que não poderemos ajudá-lo(a) no futuro. Você pode realizar uma nova solicitação após 30 dias ou entrar em contato para avaliarmos outras opções.\n\nAgradecemos seu interesse e confiança.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
    };

    const rawTemplate = templates[lead.status];
    let msg: string;
    if (rawTemplate) {
      const vars: Record<string, string> = {
        nome, valor, telefone: lead.telefone, cidade: lead.cidade,
        status: lead.status, cpf: lead.cpf || '', email: lead.email || '',
      };
      msg = parseTemplate(rawTemplate, vars);
    } else {
      msg = defaultMessages[lead.status] || defaultMessages['PENDENTE'];
    }

    const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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
