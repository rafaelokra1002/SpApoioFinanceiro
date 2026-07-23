import { ReactNode } from 'react';
import {
  Banknote, Briefcase, Building2, CalendarClock, CreditCard, Eye, Home, MapPin,
  MessageCircle, MessageSquareText, Share2, UserRound, Wallet,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade, origemOf } from '../../utils/analytics';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
import { isInternalStatus, statusBadge, statusLabel } from '../../constants/status';
import OrigemIcon from '../dashboard/OrigemIcon';

interface LeadCardDetailedProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  /** Canto superior direito — ex.: menu de ações da tela de recusados. */
  headerAction?: ReactNode;
  /** Bloco extra antes do rodapé — ex.: motivo da recusa. */
  extra?: ReactNode;
  /** Botões acima do "Ver detalhes" — ex.: mover aprovado de status. */
  actions?: ReactNode;
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-[13px] font-semibold text-ink" title={String(children)}>{children}</p>
      </div>
    </div>
  );
}

export default function LeadCardDetailed({
  lead, onView, onWhatsApp, headerAction, extra, actions,
}: LeadCardDetailedProps) {
  const internal = isInternalStatus(lead.status);
  const origem = origemOf(lead);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4">
        {/* Identidade */}
        <div className="flex items-start gap-3">
          <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-[18px] font-bold text-white ${avatarColor(lead.nome)}`}>
            {initials(lead.nome)}
            {clientPhotoUrl(lead.documentos) && (
              <img
                src={clientPhotoUrl(lead.documentos)}
                alt={lead.nome}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => e.currentTarget.remove()}
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-[15px] font-bold text-ink" title={lead.nome}>{lead.nome}</p>
              <span className="flex shrink-0 items-center gap-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${statusBadge(lead.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusLabel(lead.status)}
                </span>
                {headerAction}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
              {lead.telefone}
              {!internal && (
                <button onClick={() => onWhatsApp(lead)} title="Enviar status via WhatsApp"
                  className="text-[#25D366] transition-transform hover:scale-110 cursor-pointer">
                  <MessageCircle size={14} fill="currentColor" />
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Valores em destaque */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-info/5 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <Wallet size={13} className="text-info" /> Valor solicitado
            </p>
            <p className="mt-0.5 truncate text-[17px] font-bold text-info">{formatCurrency(lead.valorSolicitado)}</p>
          </div>
          <div className="rounded-xl bg-info/5 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <CalendarClock size={13} className="text-info" /> A pagar
            </p>
            <p className="mt-0.5 truncate text-[17px] font-bold text-ink">{formatCurrency(lead.valorTotal)}</p>
          </div>
        </div>

        {/* Campos */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field icon={<MapPin size={15} />} label="Cidade">{lead.cidade}</Field>
          <Field icon={<Banknote size={15} />} label="Renda mensal">{formatMoney(lead.renda)}</Field>
          <Field icon={<Briefcase size={15} />} label="Perfil profissional">{lead.perfil}</Field>
          <Field icon={<CreditCard size={15} />} label="Modalidade">
            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{modalidade(lead.prazo)}</span>
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
            {lead.endereco
              ? `${lead.endereco}${lead.cep ? ` — CEP: ${lead.cep}` : ''}`
              : '—'}
          </Field>
        </div>

        {/* Observação do cliente */}
        {lead.observacao && (
          <div className="mt-4 flex gap-2.5 rounded-xl border-l-4 border-info bg-info/5 p-3">
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-[11px] font-semibold text-info">Observação do cliente</p>
              <p className="mt-0.5 text-[12.5px] text-ink-2">{lead.observacao}</p>
            </div>
          </div>
        )}

        {extra}

        {actions && <div className="mt-4">{actions}</div>}
      </div>

      <button
        onClick={() => onView(lead)}
        className="mt-auto flex items-center justify-center gap-2 border-t border-line bg-line py-3
          text-[13px] font-bold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
      >
        <Eye size={15} /> Ver detalhes
      </button>
    </div>
  );
}
