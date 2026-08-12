import { useEffect, useState } from 'react';
import { Check, Copy, Eye, MessageCircle, MessageSquareText, Phone, Send, UserRound, X } from 'lucide-react';
import { Lead } from '../../types';
import { renderTemplate, STATUS_PADRAO } from '../../utils/localTemplates';
import { abrirWhatsApp } from '../../utils/whatsapp';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
import { notify } from '../Notice';

interface EnviarStatusModalProps {
  lead: Lead;
  onClose: () => void;
  /** Envio pelo WhatsApp conectado ao painel (comportamento atual do botão). */
  onEnviarStatus: () => void;
}

export default function EnviarStatusModal({ lead, onClose, onEnviarStatus }: EnviarStatusModalProps) {
  const [mensagem, setMensagem] = useState(() => renderTemplate(STATUS_PADRAO, { nome: lead.nome }));
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      notify('Não foi possível copiar a mensagem.', 'error');
    }
  };

  const photoUrl = clientPhotoUrl(lead.documentos);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Moldura com borda em gradiente roxo. */}
      <div className="relative z-10 rounded-[26px] bg-gradient-to-br from-violet-500 to-purple-600 p-[3px] shadow-2xl">
        <div className="flex max-h-[94vh] w-[min(920px,94vw)] flex-col overflow-hidden rounded-3xl bg-canvas">
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                <Send size={18} />
              </span>
              <div>
                <h3 className="text-[18px] font-extrabold leading-tight text-ink">Enviar status ao cliente</h3>
                <p className="text-[12px] text-subtle">Atualização de andamento da solicitação</p>
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-600"><UserRound size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-muted">Cliente</p>
                    <p className="text-[16px] font-bold text-ink [overflow-wrap:anywhere]">{lead.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success"><Phone size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-muted">Número do cliente</p>
                    <p className="text-[15px] font-bold text-ink">{lead.telefone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagem para o cliente */}
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <MessageSquareText size={16} className="text-purple-600" /> Mensagem para o cliente
              </p>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={7}
                className="max-h-48 w-full resize-none rounded-xl border border-line bg-canvas/40 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2
                  focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
                <button onClick={copiar} disabled={!mensagem}
                  className="flex items-center gap-1.5 rounded-lg border border-orange/50 bg-surface px-3 py-2 text-[12.5px] font-semibold text-orange transition-colors hover:bg-orange/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
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

          {/* Rodapé: enviar status pelo WhatsApp do painel */}
          <div className="shrink-0 border-t border-line bg-surface p-3">
            <button onClick={() => { onEnviarStatus(); onClose(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-[15px] font-bold text-white shadow-md transition-all hover:brightness-110 cursor-pointer">
              <Send size={18} /> Enviar status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
