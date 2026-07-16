import { AtSign, Banknote, Briefcase, CreditCard, Eye, MapPin, MessageCircle, UserRound } from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import { avatarColor, initials } from '../../utils/avatar';
import { isInternalStatus, statusBadge, statusLabel } from '../../constants/status';

interface LeadCardProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
}

/** Não temos campo de modalidade: derivamos do prazo (até 30 dias = à vista). */
function modalidade(prazoDias: number): string {
  return prazoDias <= 30 ? 'À vista' : 'Parcelado';
}

function instagramHandle(value: string): string {
  const v = value.trim().replace(/^@/, '');
  return `@${v}`;
}

/** Renda é string livre no banco; formata como moeda quando for numérica. */
function formatRenda(renda: string | null): string {
  if (!renda) return '—';
  const n = Number(renda);
  return Number.isFinite(n) && n > 0 ? formatCurrency(n) : renda;
}

function MetaRow({ icon: Icon, label, children }: {
  icon: typeof MapPin; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
        <Icon size={14} className="shrink-0 text-subtle" strokeWidth={2} />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[13px] font-semibold text-ink" title={String(children)}>
        {children}
      </span>
    </div>
  );
}

export default function LeadCard({ lead, onView, onWhatsApp }: LeadCardProps) {
  const internal = isInternalStatus(lead.status);

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm
      transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
      {/* Identidade + status */}
      <div className="flex items-start gap-3">
        <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white ${avatarColor(lead.nome)}`}>
          {initials(lead.nome)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-[15px] font-bold text-ink" title={lead.nome}>{lead.nome}</p>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${statusBadge(lead.status)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusLabel(lead.status)}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
            {lead.telefone}
            {!internal && (
              <button
                onClick={() => onWhatsApp(lead)}
                title="Enviar status via WhatsApp"
                className="text-[#25D366] transition-transform hover:scale-110 cursor-pointer"
              >
                <MessageCircle size={14} fill="currentColor" />
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Valor em destaque */}
      <div className="mt-4 rounded-xl bg-brand/5 px-4 py-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted">Valor solicitado</p>
            <p className="truncate text-[22px] font-bold leading-tight text-brand-deep">
              {formatCurrency(lead.valorSolicitado)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium text-muted">A pagar</p>
            <p className="text-[13px] font-semibold text-ink">{formatCurrency(lead.valorTotal)}</p>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 space-y-2">
        <MetaRow icon={MapPin} label="Cidade">{lead.cidade}</MetaRow>
        <MetaRow icon={CreditCard} label="Modalidade">
          <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">
            {modalidade(lead.prazo)}
          </span>
        </MetaRow>
        <MetaRow icon={Briefcase} label="Perfil">{lead.perfil}</MetaRow>
        <MetaRow icon={Banknote} label="Renda">{formatRenda(lead.renda)}</MetaRow>
        {lead.instagram && (
          <MetaRow icon={AtSign} label="Instagram">{instagramHandle(lead.instagram)}</MetaRow>
        )}
        <MetaRow icon={UserRound} label="Indicado por">{lead.indicacao || '—'}</MetaRow>
      </div>

      {/* Ação */}
      <button
        onClick={() => onView(lead)}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-canvas py-2.5
          text-[13px] font-semibold text-ink-2 transition-colors
          group-hover:bg-brand group-hover:text-white cursor-pointer"
      >
        <Eye size={15} strokeWidth={2} />
        Visualizar
      </button>
    </div>
  );
}
