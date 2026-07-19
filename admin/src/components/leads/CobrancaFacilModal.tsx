import { useEffect, useState } from 'react';
import {
  Banknote, Briefcase, Building2, CheckCircle2, FileText, Landmark, Loader2,
  MapPin, Phone, Tag, Upload, UserRound, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade } from '../../utils/analytics';
import { enviarCobrancaFacil } from '../../services/api';
import Avatar from '../Avatar';
import { notify } from '../Notice';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

interface CobrancaFacilModalProps {
  lead: Lead;
  onClose: () => void;
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

function docDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function CobrancaFacilModal({ lead, onClose }: CobrancaFacilModalProps) {
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (!enviando && e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, enviando]);

  const enviar = async () => {
    setEnviando(true);
    try {
      const res = await enviarCobrancaFacil(lead.id);
      if (res.success) {
        notify(`Cadastro de ${lead.nome} enviado para o Cobrança Fácil.`, 'success');
        onClose();
      } else {
        notify(res.error || 'Não foi possível enviar para o Cobrança Fácil.', 'error');
        setEnviando(false);
      }
    } catch {
      // Preview sem backend (mesma lógica dos leads fictícios): simula o envio.
      if (import.meta.env.DEV) {
        notify(`(preview) Cadastro de ${lead.nome} simulado — backend offline.`, 'success');
        onClose();
        return;
      }
      notify('Não foi possível conectar ao servidor.', 'error');
      setEnviando(false);
    }
  };

  const docs = lead.documentos ?? [];
  const cidadeBairro = [lead.cidade, lead.bairroTrabalho].filter(Boolean).join(' / ') || '—';
  const localTrabalho = lead.enderecoTrabalho || lead.bairroTrabalho || '—';

  const infos: { label: string; value: string }[] = [
    { label: 'Nome completo', value: lead.nome },
    { label: 'Telefone', value: lead.telefone },
    { label: 'Renda mensal', value: formatMoney(lead.renda) },
    { label: 'Cidade / Bairro', value: cidadeBairro },
    { label: 'Perfil', value: lead.perfil },
    { label: 'Empresa', value: lead.nomeEmpresa || '—' },
    { label: 'Indicado por', value: lead.indicacao || '—' },
    { label: 'Local de trabalho', value: localTrabalho },
    { label: 'Modalidade solicitada', value: modalidade(lead.prazo) },
  ];
  const meio = Math.ceil(infos.length / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={() => !enviando && onClose()} />
      <div className="relative z-10 flex max-h-[92vh] w-[min(1120px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
              <Landmark size={22} className="text-success" />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">Enviar para o sistema Cobrança Fácil</h3>
              <p className="text-[12.5px] text-muted">Confira os dados que serão enviados para o sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[260px_1fr]">
          {/* Coluna esquerda: resumo do cliente */}
          <div>
            <Avatar name={lead.nome} documentos={lead.documentos} rounded="rounded-2xl" className="h-40 w-full text-[40px]" />
            <p className="mt-3 text-center text-[16px] font-bold text-ink">{lead.nome}</p>
            <div className="mt-4 space-y-2.5">
              <SideRow icon={Phone} label="Telefone">{lead.telefone}</SideRow>
              <SideRow icon={Banknote} label="Renda mensal">{formatMoney(lead.renda)}</SideRow>
              <SideRow icon={MapPin} label="Cidade / Bairro">{cidadeBairro}</SideRow>
              <SideRow icon={Briefcase} label="Perfil">{lead.perfil}</SideRow>
              <SideRow icon={Building2} label="Empresa">{lead.nomeEmpresa || '—'}</SideRow>
              <SideRow icon={UserRound} label="Indicado por">{lead.indicacao || '—'}</SideRow>
              <SideRow icon={MapPin} label="Local de trabalho">{localTrabalho}</SideRow>
              <SideRow icon={Tag} label="Modalidade solicitada">
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{modalidade(lead.prazo)}</span>
              </SideRow>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-5">
            {/* Aviso */}
            <div className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
              <CheckCircle2 size={18} className="shrink-0 text-success" />
              <p className="text-[12.5px] text-ink-2">
                Todos os dados do cliente e a documentação serão enviados para o sistema Cobrança Fácil.
              </p>
            </div>

            {/* 1. Documentação */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-bold text-ink">1. Documentação que o cliente enviou</p>
                  <p className="text-[12.5px] text-muted">Arquivos que serão enviados junto com as informações.</p>
                </div>
                <span className="shrink-0 rounded-full bg-canvas px-2.5 py-1 text-[11.5px] font-semibold text-ink-2">
                  {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                </span>
              </div>

              {docs.length === 0 ? (
                <p className="mt-3 rounded-xl border border-line bg-canvas py-8 text-center text-[12.5px] text-subtle">
                  Nenhum documento enviado pelo cliente.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {docs.map((doc) => {
                    const isImg = IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url);
                    return (
                      <div key={doc.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                        <div className="relative flex aspect-[4/3] items-center justify-center bg-canvas">
                          {isImg ? (
                            <img src={doc.url} alt={doc.filename} loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <FileText size={34} className="text-subtle" strokeWidth={1.5} />
                          )}
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
                            <CheckCircle2 size={14} />
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 px-2.5 py-2">
                          <FileText size={13} className="mt-0.5 shrink-0 text-subtle" />
                          <div className="min-w-0">
                            <p className="truncate text-[11.5px] font-semibold text-ink" title={doc.filename}>{doc.filename}</p>
                            <p className="text-[10.5px] text-subtle">{docDate(doc.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Informações */}
            <div>
              <p className="text-[14px] font-bold text-ink">2. Informações que serão enviadas</p>
              <p className="mb-3 text-[12.5px] text-muted">Dados do cliente que serão transmitidos ao sistema.</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-line">
                  {infos.slice(0, meio).map((i, idx) => (
                    <InfoLine key={i.label} label={i.label} value={i.value} first={idx === 0} />
                  ))}
                </div>
                <div className="overflow-hidden rounded-xl border border-line">
                  {infos.slice(meio).map((i, idx) => (
                    <InfoLine key={i.label} label={i.label} value={i.value} first={idx === 0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            disabled={enviando}
            className="rounded-xl border border-line px-5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={enviando}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? <><Loader2 size={15} className="animate-spin" /> Enviando...</> : <>Enviar para o Cobrança Fácil <Upload size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SideRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">
        <Icon size={14} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-[13px] font-semibold text-ink" title={typeof children === 'string' ? children : undefined}>{children}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3.5 py-3 ${first ? '' : 'border-t border-line'}`}>
      <span className="flex items-center gap-2 text-[12.5px] text-muted">
        <CheckCircle2 size={15} className="shrink-0 text-success" />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[12.5px] font-semibold text-ink" title={value}>{value}</span>
    </div>
  );
}
