import { useEffect, useState, ReactNode } from 'react';
import {
  Banknote, Briefcase, Building2, CreditCard, Download, Eye, FileText, Image as ImageIcon,
  Loader2, MapPin, MessageSquareText, Phone, Search, Send, UserRound, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { camposEmprego, formatCurrency, modalidade } from '../../utils/analytics';
import { enviarCobrancaFacil } from '../../services/api';
import { downloadDocument } from '../../utils/leadDossier';
import { fixMojibake } from '../../utils/text';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
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

/** Rótulo do documento (o app manda o nome real no filename, tipo genérico). */
function docLabel(doc: { tipo: string; filename: string }): string {
  const tipo = fixMojibake(doc.tipo?.trim() || '');
  if (tipo && !/^documentos?$/i.test(tipo)) return tipo;
  const name = fixMojibake(doc.filename?.replace(/\.[^.]+$/, '').trim() || '');
  return name || 'Documento';
}

/** Nome exibido no card (selfie vira "Foto do rosto"). */
function docDisplayLabel(doc: { tipo: string; filename: string }): string {
  const l = docLabel(doc);
  if (/selfie|rosto|foto do cliente/i.test(l)) return 'Foto do rosto';
  return l;
}

export default function CobrancaFacilModal({ lead, onClose }: CobrancaFacilModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);

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

  const baixar = async (doc: { id: string; filename: string; url: string; tipo: string }) => {
    try {
      setBaixando(doc.id);
      await downloadDocument(doc.url, `${lead.nome}-${docLabel(doc)}`);
    } catch {
      notify('Não foi possível baixar este documento.', 'error');
    } finally {
      setBaixando(null);
    }
  };

  const docs = lead.documentos ?? [];
  const photoUrl = clientPhotoUrl(lead.documentos);
  const localTrabalho = lead.enderecoTrabalho || lead.bairroTrabalho || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={() => !enviando && onClose()} />
      {/* Moldura com borda em gradiente verde, como no modelo. */}
      <div className="relative z-10 rounded-[26px] bg-gradient-to-br from-emerald-500 to-teal-600 p-[3px] shadow-2xl">
        <div className="flex max-h-[94vh] w-[min(920px,94vw)] flex-col overflow-hidden rounded-3xl bg-canvas">
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <Send size={18} />
              </span>
              <div>
                <h3 className="text-[17px] font-extrabold leading-tight text-ink">Enviar para o Cobrança Fácil</h3>
                <p className="text-[12px] text-subtle">Envio de cadastro para o sistema</p>
              </div>
            </div>
            <button onClick={() => !enviando && onClose()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md transition-transform hover:scale-105 cursor-pointer">
              <X size={18} strokeWidth={2.6} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto p-4">
            {/* Card do cliente: foto + identidade */}
            <div className="flex flex-col gap-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 sm:flex-row sm:items-center">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl">
                {photoUrl ? (
                  <img src={photoUrl} alt={lead.nome} className="h-full w-full object-cover"
                    onError={(e) => e.currentTarget.remove()} />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-[34px] font-bold text-white ${avatarColor(lead.nome)}`}>
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
              <div className="min-w-0 sm:pl-2">
                <p className="text-[11.5px] text-muted">Cliente</p>
                <p className="text-[19px] font-extrabold leading-tight text-ink">{lead.nome}</p>
                <p className="mt-2 text-[11.5px] text-muted">Número do cliente</p>
                <p className="mt-0.5 flex items-center gap-2 text-[15px] font-bold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                    <Phone size={15} />
                  </span>
                  {lead.telefone}
                </p>
              </div>
            </div>

            {/* Informações para o sistema */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <MessageSquareText size={16} className="text-success" /> Informações para o sistema
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard icon={<UserRound size={16} />} label="Nome do cliente" value={lead.nome} />
                <InfoCard icon={<Phone size={16} />} label="Telefone" value={lead.telefone} />
                <InfoCard icon={<Banknote size={16} />} label="Renda" value={formatMoney(lead.renda)} />
                <InfoCard icon={<MapPin size={16} />} label="Cidade" value={lead.cidade} />
                <InfoCard icon={<Briefcase size={16} />} label="Perfil do cliente"
                  value={<span className="inline-block rounded-md bg-success/10 px-2 py-0.5 text-[12px] font-semibold text-success">{lead.perfil}</span>} />
                <InfoCard icon={<UserRound size={16} />} label="Indicado por" value={lead.indicacao || '—'} />
                <InfoCard icon={<Building2 size={16} />} label={camposEmprego(lead.perfil).local} value={localTrabalho} />
                <InfoCard icon={<CreditCard size={16} />} label="Modalidade" value={modalidade(lead.parcelas)} />
              </div>
            </div>

            {/* Documentos e fotos enviados */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <ImageIcon size={16} className="text-success" /> Documentos e fotos enviados
                {docs.length > 0 && <span className="text-subtle">({docs.length})</span>}
              </p>
              {docs.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                  {docs.map((doc) => {
                    const isImg = IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url);
                    return (
                      <div key={doc.id} className="flex flex-col rounded-2xl border border-line bg-surface p-2 shadow-sm">
                        <p className="mb-1 truncate text-center text-[11px] font-semibold text-muted" title={docDisplayLabel(doc)}>
                          {docDisplayLabel(doc)}
                        </p>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="flex h-20 items-center justify-center overflow-hidden rounded-lg border border-line/70 bg-canvas">
                          {isImg
                            ? <img src={doc.url} alt={docDisplayLabel(doc)} loading="lazy" className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                            : <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                <FileText size={30} strokeWidth={1.4} />
                                <span className="text-[9.5px] font-semibold uppercase">PDF</span>
                              </div>}
                        </a>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink-2">
                            <Search size={12} /> Visualizar
                          </a>
                          <button onClick={() => baixar(doc)} disabled={baixando === doc.id}
                            className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                            {baixando === doc.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <><Download size={12} /> Baixar</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-line bg-canvas/60 py-8 text-center text-[12.5px] text-subtle">
                  Nenhum documento enviado pelo cliente.
                </p>
              )}
            </div>
          </div>

          {/* Rodapé: botão de envio em largura total */}
          <div className="shrink-0 border-t border-line bg-surface p-3.5">
            <button
              onClick={enviar}
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-[15px] font-bold text-white shadow-md transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando
                ? <><Loader2 size={17} className="animate-spin" /> Enviando...</>
                : <><Send size={17} /> Enviar para o Cobrança Fácil</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Campo da seção "Informações para o sistema": ícone verde + rótulo + valor. */
function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-line bg-canvas/40 px-2.5 py-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] leading-tight text-muted">{label}</p>
        <div className="text-[13px] font-bold leading-snug text-ink [overflow-wrap:anywhere]">{value}</div>
      </div>
    </div>
  );
}
