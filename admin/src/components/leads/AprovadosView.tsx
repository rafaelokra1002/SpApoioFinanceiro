import { ReactNode, useMemo, useState } from 'react';
import {
  Banknote, Briefcase, Building2, CalendarClock, CalendarCheck2, CheckCircle2, ClipboardCheck,
  ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, Eye, Home, LayoutGrid, List, Loader2,
  MapPin, MessageCircle, MessageSquareText, Search, Share2, UserRound, Wallet, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade, origemOf } from '../../utils/analytics';
import { statusBadge, statusLabel } from '../../constants/status';
import Avatar from '../Avatar';
import OrigemIcon from '../dashboard/OrigemIcon';

type ViewMode = 'grade' | 'lista';
type Periodo = 'mes' | 'mespassado' | '7' | '30' | 'todo';
const VIEW_KEY = 'sp-admin-aprovados-view';
const PER_PAGE = 6;

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
  return modalidade(lead.prazo);
}

/** Intervalo [início, fim] do período selecionado (fim é "agora" nas opções relativas). */
function periodoRange(p: Periodo): { start: number; end: number } | null {
  const now = new Date();
  if (p === 'todo') return null;
  if (p === 'mes') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), end: now.getTime() };
  }
  if (p === 'mespassado') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
      end: new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1,
    };
  }
  const dias = Number(p);
  return { start: now.getTime() - dias * 24 * 60 * 60 * 1000, end: now.getTime() };
}

function periodoLabel(p: Periodo): string {
  const r = periodoRange(p);
  const fmt = (t: number) => new Date(t).toLocaleDateString('pt-BR');
  if (p === 'mes') return `Este mês (${fmt(r!.start)} a ${fmt(r!.end)})`;
  if (p === 'mespassado') return `Mês passado (${fmt(r!.start)} a ${fmt(r!.end)})`;
  if (p === '7') return 'Últimos 7 dias';
  if (p === '30') return 'Últimos 30 dias';
  return 'Todo o período';
}

const PERIODOS: Periodo[] = ['mes', 'mespassado', '7', '30', 'todo'];

export default function AprovadosView({ leads, loading, onView, onWhatsApp }: AprovadosViewProps) {
  const [query, setQuery] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [pageNum, setPageNum] = useState(1);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return noPeriodo;
    return noPeriodo.filter(
      (l) => l.nome.toLowerCase().includes(q) || l.telefone.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
    );
  }, [noPeriodo, query]);

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
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-2 text-[13px] font-medium text-muted">Por período</p>
          <div className="relative">
            <CalendarCheck2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <select
              value={periodo}
              onChange={(e) => { setPeriodo(e.target.value as Periodo); setPageNum(1); }}
              className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-canvas py-3 pl-10 pr-9
                text-[13px] font-semibold text-ink-2 transition-colors hover:bg-surface focus:border-brand focus:outline-none"
            >
              {PERIODOS.map((p) => (
                <option key={p} value={p}>{periodoLabel(p)}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
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
            <X size={15} /> Limpar pesquisa
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
          {query ? 'Nenhum resultado para a busca' : 'Nenhuma solicitação aprovada neste período'}
        </p>
      ) : view === 'grade' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {shown.map((lead) => (
            <AprovadoCard key={lead.id} lead={lead} onView={onView} onWhatsApp={onWhatsApp} />
          ))}
        </div>
      ) : (
        <AprovadosTable leads={shown} onView={onView} onWhatsApp={onWhatsApp} />
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

/* --------------------------------------------------------------- card aprovado */

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-[13px] font-semibold text-ink" title={String(children)}>{children}</p>
      </div>
    </div>
  );
}

function ValueBox({ icon, iconClass, label, value, valueClass = 'text-ink' }: {
  icon: ReactNode; iconClass: string; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-canvas px-2.5 py-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[10.5px] font-medium text-muted">{label}</p>
        <p className={`truncate text-[14px] font-bold leading-tight ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function AprovadoCard({ lead, onView, onWhatsApp }: {
  lead: Lead; onView: (l: Lead) => void; onWhatsApp: (l: Lead) => void;
}) {
  const origem = origemOf(lead);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4">
        {/* Identidade */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar name={lead.nome} documentos={lead.documentos} className="h-14 w-14 text-[18px]" />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-[15px] font-bold text-ink" title={lead.nome}>{lead.nome}</p>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${statusBadge(lead.status)}`}>
                <CheckCircle2 size={11} />
                {statusLabel(lead.status)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
                {lead.telefone}
                <button onClick={() => onWhatsApp(lead)} title="Enviar mensagem via WhatsApp"
                  className="text-[#25D366] transition-transform hover:scale-110 cursor-pointer">
                  <MessageCircle size={14} fill="currentColor" />
                </button>
              </p>
              <p className="shrink-0 text-[11.5px] text-subtle">{dateTime(lead.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <ValueBox icon={<CircleDollarSign size={16} />} iconClass="bg-success/10 text-success"
            label="Valor aprovado" value={formatCurrency(valorAprovadoDe(lead))} valueClass="text-success" />
          <ValueBox icon={<CalendarClock size={16} />} iconClass="bg-info/10 text-info"
            label="A pagar" value={formatCurrency(lead.valorTotal)} />
          <ValueBox icon={<CheckCircle2 size={16} />} iconClass="bg-success/10 text-success"
            label="Situação" value={statusLabel(lead.status)} valueClass="text-success" />
        </div>

        {/* Campos */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field icon={<MapPin size={15} />} label="Cidade">{lead.cidade}</Field>
          <Field icon={<Banknote size={15} />} label="Renda mensal">{formatMoney(lead.renda)}</Field>
          <Field icon={<Briefcase size={15} />} label="Perfil profissional">{lead.perfil}</Field>
          <Field icon={<CreditCard size={15} />} label="Modalidade">
            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{modalidadeAprovadaLabel(lead)}</span>
          </Field>
          <Field icon={<Building2 size={15} />} label="Empresa">{lead.nomeEmpresa || '—'}</Field>
          <Field icon={<Briefcase size={15} />} label="Local de trabalho">
            {lead.enderecoTrabalho || lead.bairroTrabalho || '—'}
          </Field>
          <Field icon={<UserRound size={15} />} label="Indicado por">{lead.indicacao || '—'}</Field>
          <Field icon={<Share2 size={15} />} label="Origem do cliente">
            <span className="flex items-center gap-1.5">
              <span className="[&>svg]:h-4 [&>svg]:w-4"><OrigemIcon label={origem} /></span>
              {origem}
            </span>
          </Field>
          <Field icon={<Home size={15} />} label="Local da solicitação">
            {lead.endereco ? `${lead.endereco}${lead.cep ? ` — CEP: ${lead.cep}` : ''}` : '—'}
          </Field>
          <Field icon={<CalendarCheck2 size={15} />} label="Data da aprovação">{dateTimeLong(lead.updatedAt)}</Field>
        </div>

        {/* Observação */}
        {lead.observacao && (
          <div className="mt-4 flex gap-2.5 rounded-xl border-l-4 border-info bg-info/5 p-3">
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-[11px] font-semibold text-info">Observação do cliente</p>
              <p className="mt-0.5 text-[12.5px] text-ink-2">{lead.observacao}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onView(lead)}
        className="mt-auto flex items-center justify-between border-t border-line bg-brand px-5 py-3
          text-[13px] font-bold text-white transition-colors hover:bg-brand-deep cursor-pointer"
      >
        <span className="flex-1" />
        <span className="flex items-center gap-2"><Eye size={15} /> Ver detalhes</span>
        <span className="flex flex-1 justify-end"><ChevronRight size={17} /></span>
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- lista + paginação */

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
  children: ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void;
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
