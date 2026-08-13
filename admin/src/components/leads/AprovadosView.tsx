import { ReactNode, useMemo, useState } from 'react';
import {
  Banknote, Briefcase, Building2, CalendarClock, CalendarCheck2, CheckCircle2, ClipboardCheck,
  ChevronRight, CircleDollarSign, CreditCard, Eye, Home, LayoutGrid, List, Loader2,
  MapPin, MessageCircle, MessageSquareText, Search, Share2, UserRound,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, matchesSearch, modalidade, origemOf } from '../../utils/analytics';
import { statusBadge, statusLabel } from '../../constants/status';
import useInfiniteList from '../../hooks/useInfiniteList';
import { LimparFiltros, SelectButton } from './Filters';
import Avatar from '../Avatar';
import LeadCardDetailed from './LeadCardDetailed';

type ViewMode = 'grade' | 'lista';
type Periodo = 'todo' | '7' | '30' | '90';
const VIEW_KEY = 'sp-admin-aprovados-view';

interface AprovadosViewProps {
  leads: Lead[];
  loading: boolean;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

function shortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function dateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('pt-BR')} • ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function dateTimeLong(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Valor efetivamente aprovado (cai para o solicitado quando não foi definido). */
function valorAprovadoDe(lead: Lead): number {
  return lead.valorAprovado ?? lead.valorSolicitado;
}

/** Rótulo da modalidade aprovada; sem valor definido, deriva do prazo. */
function modalidadeAprovadaLabel(lead: Lead): string {
  if (lead.modalidadeAprovada === 'PARCELADO') return 'Parcelado';
  if (lead.modalidadeAprovada === 'AVISTA') return 'À vista';
  return modalidade(lead.parcelas);
}

/** Intervalo [início, fim] do período selecionado; `null` em "Todo o período". */
function periodoRange(p: Periodo): { start: number; end: number } | null {
  if (p === 'todo') return null;
  const now = Date.now();
  return { start: now - Number(p) * 24 * 60 * 60 * 1000, end: now };
}

function periodoLabel(p: Periodo): string {
  return p === 'todo' ? 'Todo o período' : `Últimos ${p} dias`;
}

const PERIODOS: Periodo[] = ['todo', '7', '30', '90'];

export default function AprovadosView({ leads, loading, onView, onWhatsApp }: AprovadosViewProps) {
  const [query, setQuery] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('todo');
  const [view, setViewState] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) === 'lista' ? 'lista' : 'grade'),
  );
  const setView = (v: ViewMode) => { setViewState(v); localStorage.setItem(VIEW_KEY, v); };

  // A data da aprovação é o updatedAt (última mudança de status).
  const noPeriodo = useMemo(() => {
    const r = periodoRange(periodo);
    if (!r) return leads;
    return leads.filter((l) => {
      const t = new Date(l.updatedAt).getTime();
      return t >= r.start && t <= r.end;
    });
  }, [leads, periodo]);

  const totalValor = useMemo(() => noPeriodo.reduce((s, l) => s + valorAprovadoDe(l), 0), [noPeriodo]);

  const filtered = useMemo(
    () => (query.trim() ? noPeriodo.filter((l) => matchesSearch(l, query)) : noPeriodo),
    [noPeriodo, query],
  );

  const { shown, hasMore, sentinelRef } = useInfiniteList(filtered);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-subtle">
        <Loader2 size={22} className="animate-spin text-brand" /><span className="ml-3 text-sm">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid max-w-3xl grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success/10">
            <ClipboardCheck size={24} className="text-success" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">Aprovados</p>
            <p className="text-[30px] font-bold leading-tight text-ink">{noPeriodo.length}</p>
            <p className="text-[12px] text-subtle">Solicitações aprovadas</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-info/10">
            <CircleDollarSign size={24} className="text-info" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">Valor total aprovado no período</p>
            <p className="truncate text-[26px] font-bold leading-tight text-info" title={formatCurrency(totalValor)}>
              {formatCurrency(totalValor)}
            </p>
            <p className="text-[12px] text-subtle">Total de valores aprovados</p>
          </div>
        </div>

      </div>

      {/* Busca + filtros + alternância */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <LimparFiltros
          show={query !== '' || periodo !== 'todo'}
          onClick={() => { setQuery(''); setPeriodo('todo'); }}
        />

        <SelectButton
          icon={CalendarCheck2}
          value={periodo}
          onChange={(v) => setPeriodo(v as Periodo)}
          options={PERIODOS.map((p) => ({ value: p, label: periodoLabel(p) }))}
        />

        <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1">
          <ViewTab active={view === 'grade'} onClick={() => setView('grade')} icon={LayoutGrid} label="Grade" />
          <ViewTab active={view === 'lista'} onClick={() => setView('lista')} icon={List} label="Lista" />
        </div>
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query ? 'Nenhum resultado para a busca' : 'Nenhuma solicitação aprovada neste período'}
        </p>
      ) : view === 'grade' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((lead) => (
            <LeadCardDetailed key={lead.id} lead={lead} onView={onView} onWhatsApp={onWhatsApp} />
          ))}
        </div>
      ) : (
        <AprovadosTable leads={shown} onView={onView} onWhatsApp={onWhatsApp} />
      )}

      {/* Rolagem infinita: carrega mais ao chegar no fim da lista */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          <Loader2 size={20} className="animate-spin text-brand" />
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- lista */

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

const HEADERS = ['Nome', 'Telefone', 'Cidade', 'Valor aprovado', 'A pagar', 'Data da aprovação', 'Ações'];

function AprovadosTable({ leads, onView, onWhatsApp }: {
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
            {leads.map((lead) => (
              <tr key={lead.id} onClick={() => onView(lead)} className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-canvas/80">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.nome} documentos={lead.documentos} className="h-8 w-8 text-[11px]" />
                    <span className="font-semibold text-ink">{lead.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-ink-2">{lead.telefone}</td>
                <td className="px-4 py-3.5 text-ink-2">{lead.cidade}</td>
                <td className="px-4 py-3.5 font-medium text-success">{formatCurrency(valorAprovadoDe(lead))}</td>
                <td className="px-4 py-3.5 text-ink-2">{formatCurrency(lead.valorTotal)}</td>
                <td className="px-4 py-3.5 text-ink-2">{shortDate(lead.updatedAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button title="Ver detalhes" onClick={() => onView(lead)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 transition-all hover:bg-brand/20 cursor-pointer">
                      <Eye size={14} className="text-brand-deep" />
                    </button>
                    <button title="WhatsApp" onClick={() => onWhatsApp(lead)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] transition-all hover:brightness-110 cursor-pointer">
                      <MessageCircle size={14} className="text-white" fill="#fff" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
