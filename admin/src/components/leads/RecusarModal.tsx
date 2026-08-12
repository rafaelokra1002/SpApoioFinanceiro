import { useEffect, useState, ReactNode } from 'react';
import {
  Check, Copy, Eye, FileWarning, FolderX, HandCoins, MessageCircle, MessageSquareText,
  Phone, UserRound, X, XCircle,
} from 'lucide-react';
import { Lead } from '../../types';
import { getRecusaTemplates, renderRecusaTemplate, renderTemplate, RECUSA_PADRAO } from '../../utils/localTemplates';
import { abrirWhatsApp } from '../../utils/whatsapp';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
import { notify } from '../Notice';

/** Ícone e cores de cada motivo (por grupo), seguindo o modelo. */
const MOTIVO_STYLE: Record<number, {
  icon: ReactNode; radio: string; dot: string; iconBox: string; activeCard: string; idleCard: string;
}> = {
  1: { icon: <FileWarning size={17} />, radio: 'border-danger', dot: 'bg-danger', iconBox: 'bg-danger/10 text-danger', activeCard: 'border-danger bg-danger/5', idleCard: 'border-danger/25 bg-danger/5' },
  2: { icon: <FolderX size={17} />, radio: 'border-orange', dot: 'bg-orange', iconBox: 'bg-orange/10 text-orange', activeCard: 'border-orange bg-orange/5', idleCard: 'border-orange/25 bg-orange/5' },
  3: { icon: <MessageCircle size={17} />, radio: 'border-purple-500', dot: 'bg-purple-500', iconBox: 'bg-purple-500/10 text-purple-600', activeCard: 'border-purple-500 bg-purple-500/5', idleCard: 'border-purple-500/25 bg-purple-500/5' },
  4: { icon: <HandCoins size={17} />, radio: 'border-info', dot: 'bg-info', iconBox: 'bg-info/10 text-info', activeCard: 'border-info bg-info/5', idleCard: 'border-info/25 bg-info/5' },
};

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
    titulo: 'Outro motivo',
    descricao: 'Outros critérios internos não foram atendidos.',
    motivoCurto: 'Não atende aos critérios internos no momento.',
  },
  {
    grupo: 4,
    titulo: 'Débito com a agiota',
    descricao: 'O cliente possui débito com agiota, o que impede a liberação do crédito.',
    motivoCurto: 'Débito com a agiota.',
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
  // Começa sem motivo escolhido, mas já com uma mensagem de recusa padrão preenchida.
  const [motivoIdx, setMotivoIdx] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState(() => renderTemplate(RECUSA_PADRAO, { nome: lead.nome.trim().split(/\s+/)[0] || lead.nome }));
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

  const photoUrl = clientPhotoUrl(lead.documentos);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Moldura com borda em gradiente vermelho. */}
      <div className="relative z-10 rounded-[26px] bg-gradient-to-br from-red-500 to-rose-600 p-[3px] shadow-2xl">
        <div className="flex max-h-[94vh] w-[min(1000px,94vw)] flex-col overflow-hidden rounded-3xl bg-canvas">
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
                <XCircle size={20} />
              </span>
              <div>
                <h3 className="text-[18px] font-extrabold leading-tight text-ink">Recusa</h3>
                <p className="text-[12px] text-subtle">Análise de recusa da solicitação</p>
              </div>
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md transition-transform hover:scale-105 cursor-pointer">
              <X size={18} strokeWidth={2.6} />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto p-3.5">
            {/* Card do cliente */}
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row sm:items-center">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                {photoUrl ? (
                  <img src={photoUrl} alt={lead.nome} className="h-full w-full object-cover" onError={(e) => e.currentTarget.remove()} />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-[30px] font-bold text-white ${avatarColor(lead.nome)}`}>
                    {initials(lead.nome)}
                  </div>
                )}
                {photoUrl && (
                  <a href={photoUrl} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-black/70">
                    <Eye size={14} /> Visualizar foto
                  </a>
                )}
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger"><UserRound size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-muted">Cliente</p>
                    <p className="text-[16px] font-bold text-ink [overflow-wrap:anywhere]">{lead.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger"><Phone size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-muted">Número do cliente</p>
                    <p className="text-[15px] font-bold text-ink">{lead.telefone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivo da recusa */}
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <XCircle size={16} className="text-danger" /> Motivo da recusa
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {MOTIVOS_RECUSA.map((m, idx) => {
                  const ativo = idx === motivoIdx;
                  const st = MOTIVO_STYLE[m.grupo];
                  return (
                    <button key={m.grupo} onClick={() => escolherMotivo(idx)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors cursor-pointer
                        ${ativo ? st.activeCard : `${st.idleCard} hover:brightness-95`}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${ativo ? st.radio : 'border-subtle/50'}`}>
                        {ativo && <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />}
                      </span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${st.iconBox}`}>{st.icon}</span>
                      <span className="text-[12.5px] font-bold leading-snug text-ink">{m.titulo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mensagem para o cliente */}
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <MessageSquareText size={16} className="text-danger" /> Mensagem para o cliente
              </p>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                maxLength={MAX_MSG}
                rows={5}
                placeholder="Selecione um motivo acima para gerar a mensagem…"
                className="max-h-32 w-full resize-none rounded-xl border border-line bg-canvas/40 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2
                  placeholder:text-subtle focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/15"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
                <button onClick={copiar} disabled={!mensagem}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                  {copiado ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  {copiado ? 'Copiado' : 'Copiar mensagem'}
                </button>
                <button onClick={() => abrirWhatsApp(lead.telefone, mensagem)} disabled={!mensagem}
                  className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-[12.5px] font-bold text-white transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                  <MessageCircle size={14} fill="currentColor" /> Enviar via WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé: recusar em largura total */}
          <div className="shrink-0 border-t border-line bg-surface p-3">
            <button onClick={confirmar} disabled={motivoIdx === null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-2.5 text-[15px] font-bold text-white shadow-md transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
              <XCircle size={18} /> Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
