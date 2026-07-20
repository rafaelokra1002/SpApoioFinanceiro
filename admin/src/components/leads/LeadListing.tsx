import { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Eye, LayoutGrid, List, Loader2, MessageCircle, Search,
  UserRoundCheck, Users, UserX, Wallet,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import { isInternalStatus, statusBadge, statusLabel } from '../../constants/status';
import { LimparFiltros } from './Filters';
import LeadCardDetailed from './LeadCardDetailed';
import Avatar from '../Avatar';

type ViewMode = 'cards' | 'lista';
const VIEW_KEY = 'sp-admin-leads-view';

interface LeadListingProps {
  leads: Lead[];
  loading: boolean;
  countLabel: string;
  countCaption: string;
  valueLabel: string;
  valueCaption: string;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const PER_PAGE = 8;

function initialView(): ViewMode {
  return localStorage.getItem(VIEW_KEY) === 'lista' ? 'lista' : 'cards';
}

export default function LeadListing({
  leads, loading, countLabel, countCaption, valueLabel, valueCaption, onView, onWhatsApp, onStatusChange,
}: LeadListingProps) {
  const [query, setQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [view, setViewState] = useState<ViewMode>(initialView);

  const setView = (v: ViewMode) => { setViewState(v); localStorage.setItem(VIEW_KEY, v); };

  const totalValue = useMemo(
    () => leads.reduce((sum, l) => sum + l.valorSolicitado, 0),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) => l.nome.toLowerCase().includes(q) || l.telefone.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
    );
  }, [leads, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(pageNum, pageCount);
  const start = (current - 1) * PER_PAGE;
  const shown = filtered.slice(start, start + PER_PAGE);

  const setSearch = (v: string) => { setQuery(v); setPageNum(1); };

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Users size={24} className="text-brand-deep" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">{countLabel}</p>
            <p className="text-[30px] font-bold leading-tight text-ink">{leads.length}</p>
            <p className="text-[12px] text-subtle">{countCaption}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Wallet size={24} className="text-brand-deep" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">{valueLabel}</p>
            <p className="truncate text-[26px] font-bold leading-tight text-ink" title={formatCurrency(totalValue)}>
              {formatCurrency(totalValue)}
            </p>
            <p className="text-[12px] text-subtle">{valueCaption}</p>
          </div>
        </div>
      </div>

      {/* Busca + alternância de visualização */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <LimparFiltros show={query !== ''} onClick={() => setSearch('')} />

        <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1">
          <ViewTab active={view === 'cards'} onClick={() => setView('cards')} icon={LayoutGrid} label="Cards" />
          <ViewTab active={view === 'lista'} onClick={() => setView('lista')} icon={List} label="Lista" />
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-subtle">
          <Loader2 size={22} className="animate-spin text-brand" />
          <span className="ml-3 text-sm">Carregando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query ? 'Nenhum resultado para a busca' : 'Nenhuma solicitação encontrada'}
        </p>
      ) : (
        <>
          {view === 'cards' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((lead) => (
                <LeadCardDetailed
                  key={lead.id}
                  lead={lead}
                  onView={onView}
                  onWhatsApp={onWhatsApp}
                  actions={lead.status === 'APROVADO' && onStatusChange
                    ? <MoverAprovado lead={lead} onStatusChange={onStatusChange} />
                    : undefined}
                />
              ))}
            </div>
          ) : (
            <LeadTable leads={shown} onView={onView} onWhatsApp={onWhatsApp} />
          )}

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[13px] text-muted">
              Mostrando {start + 1} a {start + shown.length} de {filtered.length}
            </p>

            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <PageBtn disabled={current === 1} onClick={() => setPageNum(current - 1)} aria-label="Anterior">
                  <ChevronLeft size={16} />
                </PageBtn>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pageCount || Math.abs(n - current) <= 1)
                  .reduce<(number | '…')[]>((acc, n) => {
                    const last = acc[acc.length - 1];
                    if (typeof last === 'number' && n - last > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '…' ? (
                      <span key={`gap-${i}`} className="px-2 text-subtle">…</span>
                    ) : (
                      <PageBtn key={n} active={n === current} onClick={() => setPageNum(n)}>
                        {n}
                      </PageBtn>
                    ),
                  )}
                <PageBtn disabled={current === pageCount} onClick={() => setPageNum(current + 1)} aria-label="Próxima">
                  <ChevronRight size={16} />
                </PageBtn>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- subcomponentes */

/** Atalhos para tirar um aprovado da lista, sem abrir o detalhe. */
function MoverAprovado({ lead, onStatusChange }: {
  lead: Lead; onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onStatusChange(lead.id, 'NAO_CONTRATOU')}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-orange/30 py-2
          text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10 cursor-pointer"
      >
        <UserX size={14} /> Não contratou
      </button>
      <button
        onClick={() => onStatusChange(lead.id, 'PASSEI_COLABORADOR')}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-info/30 py-2
          text-[12px] font-semibold text-info transition-colors hover:bg-info/10 cursor-pointer"
      >
        <UserRoundCheck size={14} /> Colaborador
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
      <Icon size={15} strokeWidth={2.2} />
      {label}
    </button>
  );
}

const TABLE_HEADERS = ['Nome', 'Telefone', 'Cidade', 'Valor solicitado', 'Prazo', 'Status', 'Ações'];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function LeadTable({ leads, onView, onWhatsApp }: {
  leads: Lead[]; onView: (l: Lead) => void; onWhatsApp: (l: Lead) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {TABLE_HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const internal = isInternalStatus(lead.status);
              return (
                <tr
                  key={lead.id}
                  onClick={() => onView(lead)}
                  className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-canvas/80"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={lead.nome} documentos={lead.documentos} className="h-8 w-8 text-[11px]" />
                      <span className="font-semibold text-ink">{lead.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{lead.telefone}</td>
                  <td className="px-4 py-3.5 text-ink-2">{lead.cidade}</td>
                  <td className="px-4 py-3.5 font-medium text-ink">{formatCurrency(lead.valorSolicitado)}</td>
                  <td className="px-4 py-3.5 text-ink-2">{lead.prazo} dias</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(lead.status)}`}>
                      {statusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Ver detalhes"
                        onClick={() => onView(lead)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10
                          transition-all hover:bg-brand/20 active:scale-95 cursor-pointer"
                      >
                        <Eye size={14} className="text-brand-deep" />
                      </button>
                      <button
                        title={internal ? 'Status interno — não envia mensagem' : 'Enviar status via WhatsApp'}
                        disabled={internal}
                        onClick={() => onWhatsApp(lead)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]
                          transition-all hover:brightness-110 active:scale-95 cursor-pointer
                          disabled:cursor-not-allowed disabled:bg-line"
                      >
                        <MessageCircle size={14} className={internal ? 'text-subtle' : 'text-white'}
                          fill={internal ? 'transparent' : '#fff'} />
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

function PageBtn({ children, active, disabled, onClick, ...rest }: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-[13px] font-semibold
        transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40
        ${active ? 'bg-brand text-white' : 'border border-line bg-surface text-ink-2 hover:bg-canvas'}`}
      {...rest}
    >
      {children}
    </button>
  );
}
