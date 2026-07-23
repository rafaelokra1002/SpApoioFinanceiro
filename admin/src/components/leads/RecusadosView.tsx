import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar, MapPin, MessageSquareText, MoreVertical, RotateCcw, Search,
  Trash2, UserX, Users,
} from 'lucide-react';
import { Lead } from '../../types';
import { matchesSearch } from '../../utils/analytics';
import { LimparFiltros, SelectButton } from './Filters';
import { MOTIVOS_RECUSA } from './RecusarModal';
import LeadCardDetailed from './LeadCardDetailed';

interface RecusadosViewProps {
  leads: Lead[];
  loading: boolean;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

type Periodo = 'sempre' | '7' | '30' | '90';

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
}

/** Cores da etiqueta de grupo, seguindo o mockup: 1 vermelho, 2 roxo, 3 laranja. */
const GRUPO_BADGE: Record<number, string> = {
  1: 'bg-danger/10 text-danger',
  2: 'bg-purple-500/10 text-purple-600',
  3: 'bg-orange/10 text-orange',
};
const GRUPO_ICON: Record<number, string> = {
  1: 'bg-danger/10 text-danger',
  2: 'bg-purple-500/10 text-purple-600',
  3: 'bg-orange/10 text-orange',
};

const PERIODO_DIAS: Record<Periodo, number | null> = { sempre: null, '7': 7, '30': 30, '90': 90 };

/** Nome do motivo de cada grupo — a mesma lista usada no modal de recusa. */
function motivoTitulo(grupo: number): string {
  return MOTIVOS_RECUSA.find((m) => m.grupo === grupo)?.titulo ?? `Grupo ${grupo}`;
}

export default function RecusadosView({ leads, loading, onView, onWhatsApp, onStatusChange, onDelete }: RecusadosViewProps) {
  const [query, setQuery] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('sempre');

  const grupoCount = useMemo(
    () => ({
      1: leads.filter((l) => l.grupo === 1).length,
      2: leads.filter((l) => l.grupo === 2).length,
      3: leads.filter((l) => l.grupo === 3).length,
    }),
    [leads],
  );

  const filtered = useMemo(() => {
    const dias = PERIODO_DIAS[periodo];
    const limite = dias ? Date.now() - dias * 24 * 60 * 60 * 1000 : null;
    return leads.filter((l) => {
      if (!matchesSearch(l, query)) return false;
      if (limite && new Date(l.updatedAt).getTime() < limite) return false;
      return true;
    });
  }, [leads, query, periodo]);

  if (loading) {
    return <p className="py-24 text-center text-sm text-subtle">Carregando...</p>;
  }

  return (
    <div className="space-y-5">
      {/* Resumo: total + grupos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserX} iconClass="bg-danger/10 text-danger" label="Total de recusados"
          value={leads.length} caption="clientes recusados" highlight />
        <StatCard icon={Users} iconClass={GRUPO_ICON[1]} label={motivoTitulo(1)} value={grupoCount[1]} caption="clientes caíram" valueClass="text-danger" />
        <StatCard icon={Users} iconClass={GRUPO_ICON[2]} label={motivoTitulo(2)} value={grupoCount[2]} caption="clientes caíram" valueClass="text-purple-600" />
        <StatCard icon={Users} iconClass={GRUPO_ICON[3]} label={motivoTitulo(3)} value={grupoCount[3]} caption="clientes caíram" valueClass="text-orange" />
      </div>

      {/* Busca + filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <LimparFiltros
          show={query !== '' || periodo !== 'sempre'}
          onClick={() => { setQuery(''); setPeriodo('sempre'); }}
        />

        <SelectButton icon={Calendar} value={periodo} onChange={(v) => setPeriodo(v as Periodo)}
          options={[
            { value: 'sempre', label: 'Todo o período' },
            { value: '7', label: 'Últimos 7 dias' },
            { value: '30', label: 'Últimos 30 dias' },
            { value: '90', label: 'Últimos 90 dias' },
          ]} />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query || periodo !== 'sempre'
            ? 'Nenhum recusado para esse filtro'
            : 'Nenhuma solicitação recusada'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => (
            <RecusadoCard
              key={lead.id}
              lead={lead}
              onView={onView}
              onWhatsApp={onWhatsApp}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- subcomponentes */

function StatCard({ icon: Icon, iconClass, label, value, caption, valueClass = 'text-ink', highlight }: {
  icon: typeof Users; iconClass: string; label: string; value: number; caption: string; valueClass?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 shadow-sm ${highlight ? 'border-danger/30' : 'border-line'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-2">{label}</p>
          <p className={`text-[26px] font-bold leading-tight ${valueClass}`}>{value}</p>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-subtle">{caption}</p>
    </div>
  );
}

function MetaRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
        <Icon size={14} className="shrink-0 text-subtle" strokeWidth={2} />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[13px] font-semibold text-ink">{children}</span>
    </div>
  );
}

/**
 * Mesmo card das outras listagens (LeadCardDetailed), com os extras da recusa:
 * menu de ações no topo e o bloco de motivo/grupo antes do rodapé.
 */
function RecusadoCard({ lead, onView, onWhatsApp, onStatusChange, onDelete }: {
  lead: Lead;
  onView: (l: Lead) => void;
  onWhatsApp: (l: Lead) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const menu = (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-canvas cursor-pointer"
        title="Mais ações"
      >
        <MoreVertical size={15} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-7 z-10 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
          <MenuItem icon={RotateCcw} label="Reavaliar (mover p/ Pendente)"
            onClick={() => { setMenuOpen(false); onStatusChange(lead.id, 'PENDENTE'); }} />
          <MenuItem icon={Trash2} label="Excluir solicitação" danger
            onClick={() => { setMenuOpen(false); onDelete(lead.id); }} />
        </div>
      )}
    </div>
  );

  const dadosRecusa = (
    <div className="mt-4 space-y-2">
      {/* Mesmo formato do bloco "Observação do cliente", em vermelho. */}
      <div className="flex gap-2.5 rounded-xl border-l-4 border-danger bg-danger/5 p-3">
        <MessageSquareText size={16} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <p className="text-[11px] font-semibold text-danger">Motivo da recusa</p>
          <p className="mt-0.5 text-[12.5px] text-ink-2">
            {lead.motivoRecusa || <span className="text-subtle">Nenhum motivo registrado</span>}
          </p>
        </div>
      </div>
      <MetaRow icon={Users} label="Motivo do grupo">
        {lead.grupo ? (
          <span className={`rounded-md px-2 py-0.5 text-[12px] ${GRUPO_BADGE[lead.grupo]}`} title={motivoTitulo(lead.grupo)}>
            {motivoTitulo(lead.grupo)}
          </span>
        ) : (
          <span className="text-subtle">—</span>
        )}
      </MetaRow>
      <MetaRow icon={Calendar} label="Data da recusa">{formatDateTime(lead.updatedAt)}</MetaRow>
    </div>
  );

  return (
    <LeadCardDetailed
      lead={lead}
      onView={onView}
      onWhatsApp={onWhatsApp}
      headerAction={menu}
      extra={dadosRecusa}
    />
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: {
  icon: typeof Users; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium transition-colors cursor-pointer
        ${danger ? 'text-danger hover:bg-danger/10' : 'text-ink-2 hover:bg-canvas'}`}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </button>
  );
}
