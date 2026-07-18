import { useMemo, useState } from 'react';
import { ReactNode } from 'react';
import {
  ChevronDown, ChevronLeft, ChevronRight, Clock, Eye, LayoutGrid, List, Loader2,
  MessageCircle, Search, Shield, Users, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { priorRequestsOf, formatCurrency } from '../../utils/analytics';
import { statusBadge, statusLabel, isInternalStatus } from '../../constants/status';
import { avatarColor, initials } from '../../utils/avatar';
import LeadCardDetailed from './LeadCardDetailed';

type ViewMode = 'grade' | 'lista';
const VIEW_KEY = 'sp-admin-pendentes-view';
const PER_PAGE = 6;

interface PendentesViewProps {
  leads: Lead[];
  loading: boolean;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function PendentesView({ leads, loading, onView, onWhatsApp }: PendentesViewProps) {
  const [query, setQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [view, setViewState] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) === 'lista' ? 'lista' : 'grade'),
  );
  const setView = (v: ViewMode) => { setViewState(v); localStorage.setItem(VIEW_KEY, v); };

  const pending = useMemo(() => leads.filter((l) => l.status === 'PENDENTE'), [leads]);

  // Pendentes cujo cliente já solicitou antes (mesmo telefone).
  const repeats = useMemo(
    () => pending
      .map((lead) => ({ lead, priors: priorRequestsOf(lead, leads) }))
      .filter((r) => r.priors.length > 0),
    [pending, leads],
  );

  const evitarGolpes = useMemo(() => pending.filter((l) => l.evitarGolpes), [pending]);
  const analise = useMemo(() => pending.filter((l) => l.analiseCliente), [pending]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(
      (l) => l.nome.toLowerCase().includes(q) || l.telefone.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
    );
  }, [pending, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(pageNum, pageCount);
  const start = (current - 1) * PER_PAGE;
  const shown = filtered.slice(start, start + PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-subtle">
        <Loader2 size={22} className="animate-spin text-brand" /><span className="ml-3 text-sm">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cards do topo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Clock size={20} className="text-brand-deep" />}
          iconBg="bg-brand/10"
          title="Pendentes"
          value={pending.length}
          caption="Solicitações aguardando análise"
        />

        {/* Solicitações anteriores */}
        <HoverCard
          icon={<Users size={20} className="text-info" />}
          iconBg="bg-info/10"
          title="Solicitações anteriores"
          value={repeats.length}
          caption="Clientes que já solicitaram antes"
          footer="Ver todas as solicitações anteriores"
        >
          {repeats.map(({ lead, priors }) => (
            <PersonRow key={lead.id} lead={lead} onView={onView}>
              <p className="text-[11.5px] text-muted">
                Solicitação anterior:{' '}
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${statusBadge(priors[0].status)}`}>
                  {statusLabel(priors[0].status)}
                </span>
              </p>
              <p className="text-[11px] text-subtle">Data: {formatDate(priors[0].createdAt)}</p>
            </PersonRow>
          ))}
        </HoverCard>

        {/* Evitar golpes */}
        <HoverCard
          icon={<Shield size={20} className="text-purple-600" />}
          iconBg="bg-purple-500/10"
          title="Evitar golpes"
          value={evitarGolpes.length}
          caption={evitarGolpes.length === 1 ? 'Cliente encontrado' : 'Clientes encontrados'}
          footer="Ver todos do grupo"
        >
          {evitarGolpes.map((lead) => (
            <PersonRow key={lead.id} lead={lead} onView={onView}>
              <span className="inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold text-purple-600">
                Encontrado no grupo
              </span>
            </PersonRow>
          ))}
        </HoverCard>

        {/* Análise de clientes */}
        <HoverCard
          icon={<Users size={20} className="text-orange" />}
          iconBg="bg-orange/10"
          title="Análise de clientes"
          value={analise.length}
          caption={analise.length === 1 ? 'Cliente encontrado' : 'Clientes encontrados'}
          footer="Ver todos do grupo"
        >
          {analise.map((lead) => (
            <PersonRow key={lead.id} lead={lead} onView={onView}>
              <span className="inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold text-orange">
                Encontrado no grupo
              </span>
            </PersonRow>
          ))}
        </HoverCard>
      </div>

      {/* Busca + alternância */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPageNum(1); }}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
          >
            <X size={15} /> Limpar filtro
          </button>
        )}
        <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1">
          <ViewTab active={view === 'grade'} onClick={() => setView('grade')} icon={LayoutGrid} label="Grade" />
          <ViewTab active={view === 'lista'} onClick={() => setView('lista')} icon={List} label="Lista" />
        </div>
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query ? 'Nenhum resultado para a busca' : 'Nenhuma solicitação pendente'}
        </p>
      ) : view === 'grade' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((lead) => (
            <LeadCardDetailed key={lead.id} lead={lead} onView={onView} onWhatsApp={onWhatsApp} />
          ))}
        </div>
      ) : (
        <PendentesTable leads={shown} onView={onView} onWhatsApp={onWhatsApp} />
      )}

      {/* Paginação */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-muted">Mostrando {start + 1} a {start + shown.length} de {filtered.length}</p>
          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <PageBtn disabled={current === 1} onClick={() => setPageNum(current - 1)}><ChevronLeft size={16} /></PageBtn>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <PageBtn key={n} active={n === current} onClick={() => setPageNum(n)}>{n}</PageBtn>
              ))}
              <PageBtn disabled={current === pageCount} onClick={() => setPageNum(current + 1)}><ChevronRight size={16} /></PageBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- subcomponentes */

function SummaryCard({ icon, iconBg, title, value, caption, chevron }: {
  icon: ReactNode; iconBg: string; title: string; value: number; caption: string; chevron?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
          <div>
            <p className="text-[13px] font-semibold text-ink-2">{title}</p>
            <p className="text-[26px] font-bold leading-tight text-ink">{value}</p>
          </div>
        </div>
        {chevron && <ChevronDown size={18} className="text-subtle transition-transform group-hover:rotate-180" />}
      </div>
      <p className="mt-2 text-[12px] text-subtle">{caption}</p>
    </div>
  );
}

/** Card com painel suspenso ao passar o mouse (lista de clientes). */
function HoverCard({ icon, iconBg, title, value, caption, footer, children }: {
  icon: ReactNode; iconBg: string; title: string; value: number; caption: string;
  footer: string; children: ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="group relative">
      <SummaryCard icon={icon} iconBg={iconBg} title={title} value={value} caption={caption} chevron={value > 0} />
      {value > 0 && hasItems && (
        <div className="absolute inset-x-0 top-[calc(100%-6px)] z-30 hidden pt-2 group-hover:block">
          <div className="rounded-2xl border border-line bg-surface p-3 shadow-xl">
            <div className="max-h-72 space-y-2 overflow-y-auto">{children}</div>
            <p className="mt-2 pt-1 text-center text-[12px] font-semibold text-brand-deep">{footer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonRow({ lead, onView, children }: {
  lead: Lead; onView: (l: Lead) => void; children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line p-2.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${avatarColor(lead.nome)}`}>
        {initials(lead.nome)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{lead.nome}</p>
        {children}
      </div>
      <button
        onClick={() => onView(lead)}
        className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
      >
        Ver cliente
      </button>
    </div>
  );
}

function ViewTab({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: typeof List; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer
        ${active ? 'bg-brand text-white' : 'text-muted hover:text-ink-2'}`}
    >
      <Icon size={15} strokeWidth={2.2} /> {label}
    </button>
  );
}

function PageBtn({ children, active, disabled, onClick }: {
  children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-[13px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40
        ${active ? 'bg-brand text-white' : 'border border-line bg-surface text-ink-2 hover:bg-canvas'}`}
    >
      {children}
    </button>
  );
}

const HEADERS = ['Nome', 'Telefone', 'Cidade', 'Valor solicitado', 'A pagar', 'Ações'];

function PendentesTable({ leads, onView, onWhatsApp }: {
  leads: Lead[]; onView: (l: Lead) => void; onWhatsApp: (l: Lead) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const internal = isInternalStatus(lead.status);
              return (
                <tr key={lead.id} onClick={() => onView(lead)} className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-canvas/80">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColor(lead.nome)}`}>{initials(lead.nome)}</span>
                      <span className="font-semibold text-ink">{lead.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{lead.telefone}</td>
                  <td className="px-4 py-3.5 text-ink-2">{lead.cidade}</td>
                  <td className="px-4 py-3.5 font-medium text-ink">{formatCurrency(lead.valorSolicitado)}</td>
                  <td className="px-4 py-3.5 text-ink-2">{formatCurrency(lead.valorTotal)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button title="Ver detalhes" onClick={() => onView(lead)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 transition-all hover:bg-brand/20 cursor-pointer">
                        <Eye size={14} className="text-brand-deep" />
                      </button>
                      <button title={internal ? 'Status interno' : 'WhatsApp'} disabled={internal} onClick={() => onWhatsApp(lead)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:bg-line">
                        <MessageCircle size={14} className={internal ? 'text-subtle' : 'text-white'} fill={internal ? 'transparent' : '#fff'} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
