import { ReactNode } from 'react';
import {
  Banknote, Briefcase, Building2, Calendar, CreditCard, Eye, IdCard, MapPin,
  MessageCircle, UserRound, Users, Wallet, AtSign,
} from 'lucide-react';
import { Lead } from '../../types';
import { camposEmprego, formatCurrency, modalidade, origemOf } from '../../utils/analytics';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
import { METRICS, MetricKey, isInternalStatus, statusBadge, statusLabel } from '../../constants/status';

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

/** "08/08/2026 • 14:35" — data/hora exibida ao lado da situação. */
function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} • ${hora}`;
}

/** Item da grade: ícone colorido + rótulo + valor (com subtítulo opcional). */
function Field({ icon, iconBg, label, value, sub }: {
  icon: ReactNode; iconBg: string; label: string; value: ReactNode; sub?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] leading-tight text-muted">{label}</p>
        <p className="text-[13.5px] font-bold leading-snug text-ink [overflow-wrap:anywhere]">{value}</p>
        {sub && <p className="text-[11px] leading-tight text-subtle">{sub}</p>}
      </div>
    </div>
  );
}

/** Linha da grade: duas colunas com divisória vertical no meio. */
function FieldRow({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-line">
      <div className="py-3 pr-3">{left}</div>
      <div className="py-3 pl-3">{right}</div>
    </div>
  );
}

/** Borda da card conforme a situação (recusado vermelho, aprovado verde, etc.). */
const CARD_BORDER: Record<string, string> = {
  RECUSADO: 'border-danger/30',
  APROVADO: 'border-success/30',
  PENDENTE: 'border-warning/30',
};

/** Rótulo curto do perfil para a badge do cabeçalho. */
const PERFIL_LABELS: Record<string, string> = {
  CARTEIRA_ASSINADA: 'CLT', CLT_SEM_REGISTRO: 'CLT Informal', AUTONOMO: 'Conta própria',
  BENEFICIARIO: 'Beneficiário', ESTAGIARIO: 'Estagiário', SERVIDOR_PUBLICO: 'Servidor público',
  COM_GARANTIA: 'Com garantia',
  SEM_COMPROVACAO: 'Sem comprovação',
};
function perfilLabel(perfil: string): string {
  return PERFIL_LABELS[perfil] ?? perfil;
}

export default function LeadCardDetailed({
  lead, onView, onWhatsApp, headerAction, extra, actions,
}: LeadCardDetailedProps) {
  const internal = isInternalStatus(lead.status);
  const origem = origemOf(lead);
  const StatusIcon = METRICS[lead.status as MetricKey]?.icon;

  // Parcelas derivadas do prazo (não é campo real — igual à "Modalidade").
  const vezes = Math.max(1, lead.parcelas);
  const parcelado = vezes > 1;
  const valorParcela = parcelado ? lead.valorTotal / vezes : lead.valorTotal;
  const campos = camposEmprego(lead.perfil);
  // Servidor público: vínculo e matrícula/cargo em campos próprios.
  const isServidor = lead.perfil === 'SERVIDOR_PUBLICO';
  const vinculoServidorLabel = lead.vinculoServidor === 'EFETIVO' ? 'Cargo efetivo'
    : lead.vinculoServidor === 'COMISSIONADO' ? 'Cargo comissionado' : '—';
  const matriculaCargoLabel = lead.vinculoServidor === 'COMISSIONADO' ? 'Cargo que ocupa' : 'Matrícula funcional';

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition-shadow hover:shadow-md ${CARD_BORDER[lead.status] ?? 'border-line'}`}>
      <div className="flex flex-1 flex-col p-4">
        {/* Identidade */}
        <div className="flex items-start gap-3">
          <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-[20px] font-bold text-white ${avatarColor(lead.nome)}`}>
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
              <p className="min-w-0 text-[18px] font-extrabold leading-tight text-ink" title={lead.nome}>{lead.nome}</p>
              {headerAction}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
              {lead.telefone}
              {!internal && (
                <button onClick={() => onWhatsApp(lead)} title="Enviar status via WhatsApp"
                  className="text-[#25D366] transition-transform hover:scale-110 cursor-pointer">
                  <MessageCircle size={14} fill="currentColor" />
                </button>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge(lead.status)}`}>
                {StatusIcon && <StatusIcon size={13} />}
                {statusLabel(lead.status)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 text-[12px] font-semibold text-purple-600">
                <IdCard size={13} /> {perfilLabel(lead.perfil)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                <Calendar size={14} className="text-subtle" /> {formatDateTime(lead.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Campos (2 colunas com divisórias, ícones coloridos) */}
        <div className="mt-4 divide-y divide-line border-t border-line">
          <FieldRow
            left={<Field icon={<Wallet size={16} className="text-violet-500" />} iconBg="bg-violet-500/10" label="Renda mensal" value={formatMoney(lead.renda)} />}
            right={<Field icon={<Building2 size={16} className="text-blue-500" />} iconBg="bg-blue-500/10" label={campos.empresa} value={lead.nomeEmpresa || '—'} />}
          />
          <FieldRow
            left={<Field icon={<Banknote size={16} className="text-emerald-500" />} iconBg="bg-emerald-500/10" label="Valor solicitado" value={formatCurrency(lead.valorSolicitado)} />}
            right={<Field icon={<Briefcase size={16} className="text-violet-500" />} iconBg="bg-violet-500/10" label={campos.local} value={lead.enderecoTrabalho || lead.bairroTrabalho || '—'} />}
          />
          <FieldRow
            left={<Field icon={<CreditCard size={16} className="text-blue-500" />} iconBg="bg-blue-500/10" label="Valor total a pagar" value={formatCurrency(lead.valorTotal)} />}
            right={<Field icon={<AtSign size={16} className="text-pink-500" />} iconBg="bg-pink-500/10" label="Instagram (URL)" value={lead.instagram || '—'} />}
          />
          <FieldRow
            left={<Field icon={<Calendar size={16} className="text-violet-500" />} iconBg="bg-violet-500/10"
              label={parcelado ? 'Parcelado em' : 'Pagamento'}
              value={parcelado ? `${vezes} vezes` : 'À vista'}
              sub={parcelado ? `${formatCurrency(valorParcela)} por parcela` : undefined} />}
            right={<Field icon={<UserRound size={16} className="text-emerald-500" />} iconBg="bg-emerald-500/10" label="Indicado por" value={lead.indicacao || '—'} />}
          />
          <FieldRow
            left={<Field icon={<CreditCard size={16} className="text-blue-500" />} iconBg="bg-blue-500/10" label="Modalidade" value={modalidade(lead.parcelas)} />}
            right={<Field icon={<Users size={16} className="text-orange" />} iconBg="bg-orange/10" label="Origem" value={origem} />}
          />
          <FieldRow
            left={<Field icon={<MapPin size={16} className="text-orange" />} iconBg="bg-orange/10" label="Cidade" value={lead.cidade} />}
            right={isServidor
              ? <Field icon={<Briefcase size={16} className="text-indigo-500" />} iconBg="bg-indigo-500/10" label="Vínculo" value={vinculoServidorLabel} />
              : undefined}
          />
          {isServidor && (
            <FieldRow
              left={<Field icon={<IdCard size={16} className="text-sky-500" />} iconBg="bg-sky-500/10" label={matriculaCargoLabel} value={lead.matriculaCargo || '—'} />}
            />
          )}
        </div>

        {/* Observação do cliente (quando não há um `extra` específico) */}
        {!extra && lead.observacao && (
          <div className="mt-4 flex gap-2.5 rounded-xl bg-info/8 p-3">
            <MessageCircle size={17} className="mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-[12px] font-semibold text-info">Observação</p>
              <p className="mt-0.5 text-[12.5px] text-ink-2">{lead.observacao}</p>
            </div>
          </div>
        )}

        {extra}

        {actions && <div className="mt-4">{actions}</div>}

        <button
          onClick={() => onView(lead)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-info/10 py-3
            text-[13px] font-bold text-info transition-colors hover:bg-info/15 cursor-pointer"
        >
          <Eye size={15} /> Ver detalhes
        </button>
      </div>
    </div>
  );
}
