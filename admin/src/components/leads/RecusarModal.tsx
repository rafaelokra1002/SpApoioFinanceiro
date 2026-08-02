import { useEffect, useState } from 'react';
import {
  Banknote, Check, Copy, CreditCard, MapPin, MessageCircle, UserRound, Wallet, X, XCircle,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade } from '../../utils/analytics';
import { getRecusaTemplates, renderRecusaTemplate } from '../../utils/localTemplates';
import { abrirWhatsApp } from '../../utils/whatsapp';
import Avatar from '../Avatar';
import { notify } from '../Notice';
import PerfilCliente from './PerfilCliente';

/** Cada motivo de recusa corresponde a um grupo (1/2/3) e a um texto curto salvo no lead. */
export const MOTIVOS_RECUSA = [
  {
    grupo: 1,
    titulo: 'Dados incompatíveis com a renda',
    descricao: 'A renda informada não é compatível com o valor solicitado e com nossa política de crédito.',
    motivoCurto: 'Dados incompatíveis com sua renda.',
  },
  {
    grupo: 2,
    titulo: 'Documentação inválida',
    descricao: 'A documentação enviada está vencida, incompleta ou não é válida.',
    motivoCurto: 'Documentação inválida ou incompleta.',
  },
  {
    grupo: 3,
    titulo: 'Outros motivos',
    descricao: 'Outros critérios internos não foram atendidos.',
    motivoCurto: 'Não atende aos critérios internos no momento.',
  },
] as const;

const MAX_MSG = 250;

/** Texto do grupo escolhido, com as variáveis já substituídas. */
function montarMensagem(nome: string, grupo: number, motivoCurto: string): string {
  return renderRecusaTemplate(getRecusaTemplates()[grupo], nome, motivoCurto);
}

interface RecusarModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: (data: { grupo: number; motivoRecusa: string; mensagem: string }) => void;
}

export default function RecusarModal({ lead, onClose, onConfirm }: RecusarModalProps) {
  // Começa sem motivo escolhido: o operador precisa selecionar um antes de recusar.
  const [motivoIdx, setMotivoIdx] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const escolherMotivo = (idx: number) => {
    setMotivoIdx(idx);
    setMensagem(montarMensagem(lead.nome, MOTIVOS_RECUSA[idx].grupo, MOTIVOS_RECUSA[idx].motivoCurto));
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      notify('Não foi possível copiar a mensagem.', 'error');
    }
  };

  const confirmar = () => {
    if (motivoIdx === null) return;
    const m = MOTIVOS_RECUSA[motivoIdx];
    onConfirm({ grupo: m.grupo, motivoRecusa: m.motivoCurto, mensagem: mensagem.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-[min(1100px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
              <XCircle size={22} className="text-danger" />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">Recusar solicitação</h3>
              <p className="text-[12.5px] text-muted">Informe o motivo da recusa e envie a mensagem para o cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[280px_1fr]">
          {/* Coluna esquerda: identidade */}
          <div>
            <Avatar name={lead.nome} documentos={lead.documentos} rounded="rounded-2xl" className="h-44 w-full text-[44px]" />
            <p className="mt-3 text-center text-[17px] font-bold text-ink">{lead.nome}</p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[13px] text-muted">
              <MessageCircle size={14} className="text-[#25D366]" fill="currentColor" />
              {lead.telefone}
            </p>

            <div className="mt-4 space-y-1">
              <InfoRow icon={Banknote} label="Valor solicitado">{formatCurrency(lead.valorSolicitado)}</InfoRow>
              <InfoRow icon={Wallet} label="Renda mensal">{formatMoney(lead.renda)}</InfoRow>
              <InfoRow icon={MapPin} label="Cidade">{lead.cidade}</InfoRow>
              <InfoRow icon={UserRound} label="Perfil">{lead.perfil}</InfoRow>
              <InfoRow icon={CreditCard} label="Modalidade solicitada">
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{modalidade(lead.prazo)}</span>
              </InfoRow>
              <PerfilCliente lead={lead} />
            </div>
          </div>

          {/* Coluna direita: motivo + mensagem */}
          <div className="space-y-5">
            <div>
              <p className="text-[14px] font-bold text-ink">1. Motivo da recusa</p>
              <p className="mb-3 text-[12.5px] text-muted">Selecione o principal motivo da recusa</p>
              <div className="space-y-2.5">
                {MOTIVOS_RECUSA.map((m, idx) => {
                  const ativo = idx === motivoIdx;
                  return (
                    <button
                      key={m.grupo}
                      onClick={() => escolherMotivo(idx)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer
                        ${ativo ? 'border-danger bg-danger/5' : 'border-line hover:bg-canvas'}`}
                    >
                      <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2
                        ${ativo ? 'border-danger bg-danger' : 'border-line'}`} style={{ height: 18, width: 18 }}>
                        {ativo && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-bold text-ink">{m.titulo}</span>
                        <span className="mt-0.5 block text-[12.5px] text-muted">{m.descricao}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[14px] font-bold text-ink">2. Mensagem para o cliente</p>
              <p className="mb-2 text-[12.5px] text-muted">Personalize a mensagem que será enviada ao cliente</p>
              <div className="relative">
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  maxLength={MAX_MSG}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 pb-10 text-[13px] leading-relaxed text-ink
                    focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                  <button
                    onClick={copiar}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5
                      text-[12px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
                  >
                    {copiado ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => abrirWhatsApp(lead.telefone, mensagem)}
                    title="Abre a conversa no WhatsApp com a mensagem pronta"
                    className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-2.5 py-1.5
                      text-[12px] font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                  >
                    <MessageCircle size={13} fill="currentColor" />
                    Enviar para cliente
                  </button>
                </div>
              </div>
              <p className="mt-1 text-right text-[11.5px] text-subtle">{mensagem.length}/{MAX_MSG}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={motivoIdx === null}
            className="rounded-xl bg-danger px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-110 cursor-pointer
              disabled:cursor-not-allowed disabled:opacity-40"
          >
            Recusar e enviar mensagem
          </button>
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-[12.5px] text-muted">
        <Icon size={15} className="shrink-0 text-subtle" strokeWidth={2} />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[13px] font-semibold text-ink">{children}</span>
    </div>
  );
}
