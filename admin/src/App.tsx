import { useCallback, useEffect, useMemo, useState } from 'react';
import { Category, Lead } from './types';
import {
  deleteLead, fetchCategories, fetchLeads, getWhatsAppStatus,
  sendWhatsAppByLead, updateLeadStatus,
} from './services/api';
import Sidebar, { PageKey } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/dashboard/Dashboard';
import RankingCard from './components/dashboard/RankingCard';
import LeadListing from './components/leads/LeadListing';
import LeadDetail from './components/LeadDetail';
import CategoryManager from './components/CategoryManager';
import WhatsAppManager from './components/WhatsAppManager';
import PhotosGallery from './components/PhotosGallery';
import BackupPanel from './components/BackupPanel';
import Placeholder from './components/Placeholder';
import { ClipboardList, UserCircle } from 'lucide-react';
import { MetricKey, StatusKey, isInternalStatus, statusLabel } from './constants/status';
import { countMetrics, origemOf, rank } from './utils/analytics';
import { useTheme } from './hooks/useTheme';

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
      alert(`"${statusLabel(lead.status)}" é um status interno e não envia mensagem ao cliente.`);
      return;
    }

    const statusRes = await getWhatsAppStatus().catch(() => null);
    if (!statusRes?.success || !statusRes.data?.connected) {
      alert('WhatsApp não está conectado no painel. Conecte o WhatsApp antes de enviar mensagens.');
      return;
    }

    const res = await sendWhatsAppByLead(lead.id);
    alert(res.success
      ? `✅ Mensagem enviada para ${lead.nome}`
      : `❌ Erro ao enviar mensagem para ${lead.nome}: ${res.error || 'Falha ao enviar'}`);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateLeadStatus(id, status);
    if (!res.success) {
      alert(res.error || 'Não foi possível atualizar o status.');
      return;
    }

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelectedLead((prev) => (prev?.id === id ? { ...prev, status } : prev));

    const lead = leads.find((l) => l.id === id);
    if (lead && !isInternalStatus(status)) {
      await sendWhatsApp({ ...lead, status });
    }

    loadData();
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
  // Todas as listagens de leads usam o grid de cards.
  const cardLabels = CARD_LABELS[page];
  const isCardPage = Boolean(cardLabels);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar page={page} counts={counts} onNavigate={handleNavigate} />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => handleNavigate('configuracoes')}
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

        {isCardPage && cardLabels && (
          <>
            <LeadListing
              leads={tableLeads}
              loading={loading}
              countLabel={cardLabels.countLabel}
              countCaption={cardLabels.countCaption}
              valueLabel={cardLabels.valueLabel}
              valueCaption={cardLabels.valueCaption}
              onView={setSelectedLead}
              onWhatsApp={sendWhatsApp}
            />

            {/* O detalhe abre como modal centralizado, sobrepondo a tela. */}
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
                  />
                </div>
              </div>
            )}
          </>
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

        {page === 'mensagens' && <WhatsAppManager />}

        {page === 'relatorio' && (
          <Placeholder
            icon={ClipboardList}
            title="Relatório Diário"
            description="Aqui vai o resumo diário das solicitações. Em construção — me diga o que o relatório deve mostrar e como é enviado."
          />
        )}

        {page === 'perfil' && (
          <Placeholder
            icon={UserCircle}
            title="Meu Perfil"
            description="Gerenciamento de perfil e acesso. Em construção — hoje o painel não tem login/usuários."
          />
        )}

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
