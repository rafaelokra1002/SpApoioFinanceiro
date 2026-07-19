import { useCallback, useEffect, useMemo, useState } from 'react';
import { Category, Lead } from './types';
import {
  deleteLead, fetchCategories, fetchLeads, getWhatsAppStatus,
  sendWhatsAppByLead, sendWhatsAppMessage, updateLeadGroups, updateLeadStatus,
} from './services/api';
import Sidebar, { PageKey } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/dashboard/Dashboard';
import RankingCard from './components/dashboard/RankingCard';
import LeadListing from './components/leads/LeadListing';
import PendentesView from './components/leads/PendentesView';
import RecusadosView from './components/leads/RecusadosView';
import AprovadosView from './components/leads/AprovadosView';
import LeadDetail from './components/LeadDetail';
import CategoryManager from './components/CategoryManager';
import MessageTemplates from './components/MessageTemplates';
import PhotosGallery from './components/PhotosGallery';
import BackupPanel from './components/BackupPanel';
import Placeholder from './components/Placeholder';
import { notify, NoticeHost } from './components/Notice';
import { ClipboardList } from 'lucide-react';
import { MetricKey, StatusKey, isInternalStatus, statusLabel } from './constants/status';
import { countMetrics, origemOf, rank } from './utils/analytics';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Profile from './components/Profile';

/** Páginas que são apenas a listagem recortada por um status. */
const STATUS_PAGES: Partial<Record<PageKey, StatusKey>> = {
  pendentes: 'PENDENTE',
  aprovados: 'APROVADO',
  recusados: 'RECUSADO',
  'nao-contrataram': 'NAO_CONTRATOU',
  colaborador: 'PASSEI_COLABORADOR',
};

const PAGE_TITLES: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Acompanhe o desempenho das suas solicitações' },
  solicitacoes: { title: 'Solicitações', subtitle: 'Todas as solicitações recebidas' },
  pendentes: { title: 'Pendentes', subtitle: 'Solicitações aguardando análise' },
  aprovados: { title: 'Aprovados', subtitle: 'Solicitações aprovadas' },
  recusados: { title: 'Recusados', subtitle: 'Solicitações recusadas' },
  'nao-contrataram': { title: 'Não contrataram', subtitle: 'Aprovados que não fecharam contrato' },
  colaborador: { title: 'Passei para colaborador', subtitle: 'Solicitações encaminhadas a um colaborador' },
  origem: { title: 'Origem dos clientes', subtitle: 'De onde vêm as suas solicitações' },
  cidades: { title: 'Cidades', subtitle: 'Distribuição das solicitações por cidade' },
  relatorio: { title: 'Relatório Diário', subtitle: 'Resumo das solicitações do dia' },
  perfil: { title: 'Meu Perfil', subtitle: 'Seus dados de acesso' },
  mensagens: { title: 'Edição de Mensagem', subtitle: 'Modelos de mensagem enviados via WhatsApp' },
  backup: { title: 'Backup', subtitle: 'Exportação e cópia de segurança dos dados' },
  fotos: { title: 'Fotos', subtitle: 'Imagens e documentos enviados pelos clientes' },
  categorias: { title: 'Categorias', subtitle: 'Perfis e documentos exigidos' },
  configuracoes: { title: 'Configurações', subtitle: 'Ajustes gerais do painel' },
};

interface CardLabels {
  countLabel: string;
  countCaption: string;
  valueLabel: string;
  valueCaption: string;
}

/** Textos dos dois cards de resumo de cada listagem em grid. */
const CARD_LABELS: Partial<Record<PageKey, CardLabels>> = {
  solicitacoes: {
    countLabel: 'Total de Solicitações', countCaption: 'solicitações recebidas',
    valueLabel: 'Valor total solicitado', valueCaption: 'soma dos valores solicitados',
  },
  pendentes: {
    countLabel: 'Total de Pendentes', countCaption: 'aguardando análise',
    valueLabel: 'Valor total pendente', valueCaption: 'soma dos valores solicitados',
  },
  aprovados: {
    countLabel: 'Total de Aprovados', countCaption: 'clientes aprovados',
    valueLabel: 'Valor total aprovado', valueCaption: 'valor total de crédito aprovado',
  },
  recusados: {
    countLabel: 'Total de Recusados', countCaption: 'solicitações recusadas',
    valueLabel: 'Valor total recusado', valueCaption: 'soma dos valores solicitados',
  },
  'nao-contrataram': {
    countLabel: 'Total', countCaption: 'não contrataram',
    valueLabel: 'Valor total', valueCaption: 'soma dos valores solicitados',
  },
  colaborador: {
    countLabel: 'Total', countCaption: 'passados para colaborador',
    valueLabel: 'Valor total', valueCaption: 'soma dos valores solicitados',
  },
};

/** Card do dashboard → página de listagem correspondente. */
const METRIC_TO_PAGE: Record<MetricKey, PageKey> = {
  total: 'solicitacoes',
  PENDENTE: 'pendentes',
  APROVADO: 'aprovados',
  RECUSADO: 'recusados',
  NAO_CONTRATOU: 'nao-contrataram',
  PASSEI_COLABORADOR: 'colaborador',
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { authed, signIn, signOut } = useAuth();

  const [page, setPage] = useState<PageKey>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  /**
   * Uma única carga com todos os leads alimenta o dashboard e as listagens —
   * os recortes por status e período são feitos no cliente.
   */
  const loadData = useCallback(async () => {
    try {
      const res = await fetchLeads();
      if (res.success) setLeads(res.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => { loadData(); }, [loadData]);

  const handleNavigate = (next: PageKey) => {
    setPage(next);
    setSelectedLead(null);
    if (next === 'categorias') loadCategories();
  };

  const sendWhatsApp = async (lead: Lead) => {
    // Status internos não têm mensagem para o cliente — o backend recusa o envio.
    if (isInternalStatus(lead.status)) {
      notify(`"${statusLabel(lead.status)}" é um status interno e não envia mensagem ao cliente.`);
      return;
    }

    const statusRes = await getWhatsAppStatus().catch(() => null);
    if (!statusRes?.success || !statusRes.data?.connected) {
      notify('WhatsApp não está conectado no painel. Conecte o WhatsApp antes de enviar mensagens.');
      return;
    }

    const res = await sendWhatsAppByLead(lead.id);
    if (res.success) notify(`Mensagem enviada para ${lead.nome}`, 'success');
    else notify(`Erro ao enviar mensagem para ${lead.nome}: ${res.error || 'Falha ao enviar'}`, 'error');
  };

  const handleStatusChange = async (id: string, status: string) => {
    const lead = leads.find((l) => l.id === id);
    // Atualização otimista: reflete na tela na hora (e funciona no preview sem backend).
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelectedLead((prev) => (prev?.id === id ? { ...prev, status } : prev));

    try {
      const res = await updateLeadStatus(id, status);
      if (!res.success) {
        notify(res.error || 'Não foi possível atualizar o status.', 'error');
        loadData();
        return;
      }
      if (lead && !isInternalStatus(status)) await sendWhatsApp({ ...lead, status });
      loadData();
    } catch {
      if (import.meta.env.DEV) return; // preview offline: mantém a mudança local
      notify('Não foi possível conectar ao servidor.', 'error');
      loadData();
    }
  };

  const handleUpdateGroups = async (id: string, data: { evitarGolpes?: boolean; analiseCliente?: boolean }) => {
    // Otimista, igual ao status.
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    setSelectedLead((prev) => (prev?.id === id ? { ...prev, ...data } : prev));

    try {
      const res = await updateLeadGroups(id, data);
      if (!res.success) {
        notify(res.error || 'Não foi possível atualizar os grupos.', 'error');
        loadData();
      }
    } catch {
      if (import.meta.env.DEV) return;
      notify('Não foi possível conectar ao servidor.', 'error');
      loadData();
    }
  };

  /**
   * Recusa com motivo + grupo e envia a mensagem personalizada ao cliente
   * (fluxo do modal de recusa). Diferente de handleStatusChange, que dispararia
   * o template padrão do servidor — aqui a mensagem é a escrita no modal.
   */
  const handleRecusar = async (lead: Lead, data: { grupo: number; motivoRecusa: string; mensagem: string }) => {
    // Otimista: reflete na hora e fecha o detalhe.
    setLeads((prev) => prev.map((l) => (
      l.id === lead.id ? { ...l, status: 'RECUSADO', grupo: data.grupo, motivoRecusa: data.motivoRecusa } : l
    )));
    setSelectedLead(null);

    try {
      const [statusRes] = await Promise.all([
        updateLeadStatus(lead.id, 'RECUSADO'),
        updateLeadGroups(lead.id, { grupo: data.grupo, motivoRecusa: data.motivoRecusa }),
      ]);
      if (!statusRes.success) {
        notify(statusRes.error || 'Não foi possível recusar a solicitação.', 'error');
        loadData();
        return;
      }

      const wa = await getWhatsAppStatus().catch(() => null);
      if (!wa?.success || !wa.data?.connected) {
        notify('Solicitação recusada. WhatsApp desconectado — a mensagem não foi enviada.', 'error');
      } else {
        const msg = await sendWhatsAppMessage(lead.telefone, data.mensagem);
        if (msg.success) notify(`${lead.nome} recusado e mensagem enviada.`, 'success');
        else notify(`Recusado, mas falha ao enviar a mensagem: ${msg.error || 'erro'}`, 'error');
      }
      loadData();
    } catch {
      if (import.meta.env.DEV) { notify(`${lead.nome} recusado (preview, sem envio).`, 'success'); return; }
      notify('Não foi possível conectar ao servidor.', 'error');
      loadData();
    }
  };

  /**
   * Aprova com valor e modalidade definidos no modal, recalcula o total e
   * dispara o template de aprovação ao cliente (via sendWhatsApp).
   */
  const handleAprovar = async (lead: Lead, data: { valorAprovado: number; valorTotal: number; modalidadeAprovada: 'PARCELADO' | 'AVISTA' }) => {
    // Otimista.
    setLeads((prev) => prev.map((l) => (
      l.id === lead.id
        ? { ...l, status: 'APROVADO', valorAprovado: data.valorAprovado, valorTotal: data.valorTotal, modalidadeAprovada: data.modalidadeAprovada }
        : l
    )));
    setSelectedLead(null);

    try {
      const [statusRes] = await Promise.all([
        updateLeadStatus(lead.id, 'APROVADO'),
        updateLeadGroups(lead.id, {
          valorAprovado: data.valorAprovado,
          valorTotal: data.valorTotal,
          modalidadeAprovada: data.modalidadeAprovada,
        }),
      ]);
      if (!statusRes.success) {
        notify(statusRes.error || 'Não foi possível aprovar a solicitação.', 'error');
        loadData();
        return;
      }
      await sendWhatsApp({ ...lead, status: 'APROVADO' });
      loadData();
    } catch {
      if (import.meta.env.DEV) { notify(`${lead.nome} aprovado (preview, sem envio).`, 'success'); return; }
      notify('Não foi possível conectar ao servidor.', 'error');
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

  const statusFilter = STATUS_PAGES[page];

  const tableLeads = useMemo(() => {
    if (!statusFilter) return leads;
    return leads.filter((l) => l.status === statusFilter);
  }, [leads, statusFilter]);

  // Contagens por status: alimentam os badges da sidebar.
  const counts = useMemo(() => countMetrics(leads), [leads]);

  const origemRank = useMemo(() => rank(leads, origemOf, 20), [leads]);
  const cidadeRank = useMemo(() => rank(leads, (l) => l.cidade, 20), [leads]);

  const { title, subtitle } = PAGE_TITLES[page];
  // Pendentes tem visão própria (cards detalhados + solicitações anteriores);
  // as demais listagens usam o grid padrão.
  const isPendentes = page === 'pendentes';
  // Recusados e Aprovados têm visões próprias (modelos dedicados).
  const isRecusados = page === 'recusados';
  const isAprovados = page === 'aprovados';
  const cardLabels = CARD_LABELS[page];
  const isCardPage = Boolean(cardLabels) && !isPendentes && !isRecusados && !isAprovados;

  if (!authed) return <Login onSuccess={signIn} />;

  return (
    <div className="flex min-h-screen bg-canvas">
      <NoticeHost />
      <Sidebar page={page} counts={counts} onNavigate={handleNavigate} />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => handleNavigate('configuracoes')}
          onSignOut={signOut}
        />

        <div className="flex-1 p-5 lg:p-6">
        <div className="mb-5">
          <h1 className="text-[24px] font-bold leading-tight text-ink">{title}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        </div>

        {page === 'dashboard' && (
          <Dashboard
            leads={leads}
            loading={loading}
            onDrillDown={(metric) => handleNavigate(METRIC_TO_PAGE[metric])}
          />
        )}

        {isPendentes && (
          <PendentesView
            leads={leads}
            loading={loading}
            onView={setSelectedLead}
            onWhatsApp={sendWhatsApp}
          />
        )}

        {isAprovados && (
          <AprovadosView
            leads={tableLeads}
            loading={loading}
            onView={setSelectedLead}
            onWhatsApp={sendWhatsApp}
          />
        )}

        {isRecusados && (
          <RecusadosView
            leads={tableLeads}
            loading={loading}
            onView={setSelectedLead}
            onWhatsApp={sendWhatsApp}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}

        {isCardPage && cardLabels && (
          <LeadListing
            leads={tableLeads}
            loading={loading}
            countLabel={cardLabels.countLabel}
            countCaption={cardLabels.countCaption}
            valueLabel={cardLabels.valueLabel}
            valueCaption={cardLabels.valueCaption}
            onView={setSelectedLead}
            onWhatsApp={sendWhatsApp}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Detalhe do lead: modal centralizado, compartilhado entre as listagens. */}
        {selectedLead && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedLead(null)} />
            <div className="relative z-10 max-h-[90vh] overflow-y-auto">
              <LeadDetail
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onWhatsApp={sendWhatsApp}
                onUpdateGroups={handleUpdateGroups}
                onRecusar={handleRecusar}
                onAprovar={handleAprovar}
              />
            </div>
          </div>
        )}

        {page === 'origem' && (
          <div className="max-w-3xl">
            <RankingCard
              title="Origem dos clientes"
              hint="Derivada do campo “Quem indicou você?”"
              labelHeader="Origem"
              valueHeader="Clientes"
              rows={origemRank.rows}
              total={origemRank.total}
            />
          </div>
        )}

        {page === 'cidades' && (
          <div className="max-w-3xl">
            <RankingCard
              title="Solicitações por cidade"
              labelHeader="Cidade"
              valueHeader="Clientes"
              rows={cidadeRank.rows}
              total={cidadeRank.total}
              numbered
            />
          </div>
        )}

        {page === 'categorias' && (
          <CategoryManager categories={categories} loading={catLoading} onReload={loadCategories} />
        )}

        {page === 'mensagens' && <MessageTemplates />}

        {page === 'relatorio' && (
          <Placeholder
            icon={ClipboardList}
            title="Relatório Diário"
            description="Aqui vai o resumo diário das solicitações. Em construção — me diga o que o relatório deve mostrar e como é enviado."
          />
        )}

        {page === 'perfil' && <Profile />}

        {page === 'backup' && <BackupPanel leads={leads} loading={loading} />}

        {page === 'fotos' && <PhotosGallery leads={leads} loading={loading} />}

        {page === 'configuracoes' && (
          <Placeholder
            title="Configurações"
            description="Ajustes gerais do painel. Em construção — me diga o que deve ficar aqui."
          />
        )}
        </div>
      </main>
    </div>
  );
}
