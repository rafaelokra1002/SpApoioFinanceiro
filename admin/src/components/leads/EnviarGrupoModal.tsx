import { useEffect, useState } from 'react';
import {
  Briefcase, Check, ChevronRight, Info, MapPin, MessageCircle, Pencil, Send, Share2, Users, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import Avatar from '../Avatar';
import { notify } from '../Notice';

interface EnviarGrupoModalProps {
  lead: Lead;
  onClose: () => void;
  /** Persiste o campo "Deve alguém" no cliente. */
  onPersist: (deveAlguem: string) => void;
}

export default function EnviarGrupoModal({ lead, onClose, onPersist }: EnviarGrupoModalProps) {
  const [trabalho, setTrabalho] = useState(lead.nomeEmpresa ?? '');
  const [cidadeBairro, setCidadeBairro] = useState(
    [lead.cidade, lead.bairroTrabalho].filter(Boolean).join(' / '),
  );
  const [deveAlguem, setDeveAlguem] = useState(lead.deveAlguem ?? '');
  const [observacao, setObservacao] = useState('');
  const [incluirObs, setIncluirObs] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const montarTexto = (): string => {
    const linhas = [
      '*Análise de cliente*',
      '',
      `*Nome:* ${lead.nome}`,
      `*Telefone:* ${lead.telefone}`,
      trabalho.trim() && `*Trabalho:* ${trabalho.trim()}`,
      cidadeBairro.trim() && `*Cidade/Bairro:* ${cidadeBairro.trim()}`,
      `*Valor solicitado:* ${formatCurrency(lead.valorSolicitado)}`,
      deveAlguem.trim() && `*Deve alguém:* ${deveAlguem.trim()}`,
      // A observação só vai quando o seletor estiver marcado.
      incluirObs && observacao.trim() && `*Observação:* ${observacao.trim()}`,
    ];
    return linhas.filter(Boolean).join('\n');
  };

  /** Salva o "Deve alguém" quando mudou (é o único campo persistido). */
  const persistirSeMudou = () => {
    if (deveAlguem.trim() !== (lead.deveAlguem ?? '').trim()) onPersist(deveAlguem.trim());
  };

  const compartilharWhatsApp = () => {
    persistirSeMudou();
    window.open(`https://wa.me/?text=${encodeURIComponent(montarTexto())}`, '_blank', 'noopener');
    onClose();
  };

  const compartilharInfo = async () => {
    persistirSeMudou();
    const texto = montarTexto();
    try {
      await navigator.clipboard.writeText(texto);
      notify('Informações copiadas para a área de transferência.', 'success');
    } catch {
      // Se a cópia falhar, ainda baixamos o arquivo.
    }
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${lead.nome.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-[min(1000px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/10">
              <Users size={22} className="text-info" />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">Enviar para o grupo</h3>
              <p className="text-[12.5px] text-muted">Selecione o grupo e edite as informações se necessário</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[300px_1fr]">
          {/* Coluna esquerda: dados editáveis */}
          <div>
            <Avatar name={lead.nome} documentos={lead.documentos} rounded="rounded-2xl" className="h-44 w-full text-[44px]" />
            <p className="mt-3 text-center text-[17px] font-bold text-ink">{lead.nome}</p>

            <div className="mt-4 space-y-3">
              <EditField icon={Briefcase} label="Trabalho" value={trabalho} onChange={setTrabalho} placeholder="Empresa / trabalho" />
              <EditField icon={MapPin} label="Cidade / Bairro" value={cidadeBairro} onChange={setCidadeBairro} placeholder="Cidade / bairro" />
              <EditField icon={Info} label="Deve alguém" value={deveAlguem} onChange={setDeveAlguem} placeholder="Ex.: sim, para o financeiro X" />

              <div>
                <button
                  type="button"
                  onClick={() => setIncluirObs((v) => !v)}
                  className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-muted cursor-pointer"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors
                    ${incluirObs ? 'border-info bg-info text-white' : 'border-line'}`}>
                    {incluirObs && <Check size={11} strokeWidth={3} />}
                  </span>
                  Observação (opcional)
                </button>
                <textarea
                  value={observacao}
                  onChange={(e) => { setObservacao(e.target.value); if (e.target.value.trim()) setIncluirObs(true); }}
                  rows={3}
                  placeholder="Digite a observação que deseja enviar..."
                  className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink
                    placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
                {observacao.trim() && !incluirObs && (
                  <p className="mt-1 text-[11px] text-subtle">Marque o círculo para incluir esta observação na mensagem.</p>
                )}
              </div>
            </div>
          </div>

          {/* Coluna direita: formas de compartilhar */}
          <div>
            <p className="text-[14px] font-bold text-ink">Compartilhar esta informação</p>
            <p className="mb-4 text-[12.5px] text-muted">Escolha como deseja compartilhar os dados deste cliente com o grupo.</p>

            <div className="space-y-3">
              <ShareOption
                icon={<MessageCircle size={22} className="text-white" fill="#fff" />}
                iconWrap="bg-[#25D366]"
                title="Compartilhar via grupo WhatsApp"
                desc="Envie as informações do cliente diretamente para um grupo no WhatsApp."
                onClick={compartilharWhatsApp}
              />
              <ShareOption
                icon={<Share2 size={20} className="text-info" />}
                iconWrap="bg-info/10"
                title="Compartilhar informação"
                desc="Gere um link ou arquivo com as informações para compartilhar por outros canais."
                onClick={compartilharInfo}
              />
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
            onClick={compartilharWhatsApp}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep cursor-pointer"
          >
            Enviar para o grupo <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditField({ icon: Icon, label, value, onChange, placeholder }: {
  icon: typeof MapPin; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-muted">
        <Icon size={14} className="text-info" strokeWidth={2} />
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-subtle focus:outline-none"
        />
        <Pencil size={14} className="shrink-0 text-subtle" />
      </div>
    </div>
  );
}

function ShareOption({ icon, iconWrap, title, desc, onClick }: {
  icon: React.ReactNode; iconWrap: string; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-line p-4 text-left transition-colors hover:border-brand/40 hover:bg-canvas cursor-pointer"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-[12.5px] text-muted">{desc}</span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-subtle" />
    </button>
  );
}
