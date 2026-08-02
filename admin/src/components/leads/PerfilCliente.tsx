import {
  AlertTriangle, Briefcase, Building2, Compass, FileText, Home, AtSign, Mail, MapPin,
  StickyNote, UserRound,
} from 'lucide-react';
import { Lead } from '../../types';

/**
 * Linhas extras do perfil do cliente, compartilhadas entre os modais de
 * aprovação e recusa. Cada campo só aparece quando está preenchido, para
 * não poluir o painel com "—" quando o lead não informou o dado.
 */
export default function PerfilCliente({ lead }: { lead: Lead }) {
  return (
    <>
      <Opt icon={UserRound} label="Indicado por" value={lead.indicacao} />
      <Opt icon={FileText} label="CPF" value={lead.cpf} />
      <Opt icon={Mail} label="E-mail" value={lead.email} />
      <Opt icon={AtSign} label="AtSign" value={lead.instagram} />
      <Opt icon={Home} label="Endereço" value={lead.endereco} wrap />
      <Opt icon={MapPin} label="CEP" value={lead.cep} />
      <Opt icon={Building2} label="Empresa" value={lead.nomeEmpresa} />
      <Opt icon={Briefcase} label="End. de trabalho" value={lead.enderecoTrabalho || lead.bairroTrabalho} wrap />
      <Opt icon={Compass} label="Origem" value={lead.origem} />
      <Opt icon={AlertTriangle} label="Deve alguém" value={lead.deveAlguem} wrap />
      <Opt icon={StickyNote} label="Observação" value={lead.observacao} wrap />
    </>
  );
}

/** Renderiza a linha apenas quando há valor; `wrap` permite quebra de linha em textos longos. */
function Opt({
  icon: Icon, label, value, wrap = false,
}: { icon: typeof MapPin; label: string; value: string | null; wrap?: boolean }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="flex shrink-0 items-center gap-2 text-[12.5px] text-muted">
        <Icon size={15} className="shrink-0 text-subtle" strokeWidth={2} />
        {label}
      </span>
      <span className={`min-w-0 text-right text-[13px] font-semibold text-ink ${wrap ? 'break-words' : 'truncate'}`}>
        {value}
      </span>
    </div>
  );
}
