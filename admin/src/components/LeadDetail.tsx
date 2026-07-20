import { useState, useEffect, ReactNode } from 'react';
import {
  X, CheckCircle, XCircle, Trash2, MessageCircle, Download, Loader2, Banknote,
  Wallet, CalendarClock, MapPin, Briefcase, Building2, UserRound, CreditCard, Home,
  Send, Shield, Users, FileText,
} from 'lucide-react';
import { Lead } from '../types';
import { fetchMessageLogs } from '../services/api';
import { downloadLeadDossier } from '../utils/leadDossier';
import { METRICS, STATUS_ORDER, isInternalStatus, statusLabel } from '../constants/status';
import { modalidade } from '../utils/analytics';
import { avatarColor, clientPhotoUrl, initials } from '../utils/avatar';
import { notify } from './Notice';
import RecusarModal from './leads/RecusarModal';
import AprovarModal from './leads/AprovarModal';
import EnviarGrupoModal from './leads/EnviarGrupoModal';
import { MOTIVOS_RECUSA } from './leads/RecusarModal';
import CobrancaFacilModal from './leads/CobrancaFacilModal';

interface MessageLog {
  id: string;
  mensagem: string;
  status: string;
  createdAt: string;
}

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (lead: Lead) => void;
  onUpdateGroups: (id: string, data: { evitarGolpes?: boolean; analiseCliente?: boolean; grupo?: number | null; motivoRecusa?: string | null; deveAlguem?: string | null }) => void;
  onRecusar: (lead: Lead, data: { grupo: number; motivoRecusa: string; mensagem: string }) => void;
  onAprovar: (lead: Lead, data: { valorAprovado: number; valorTotal: number; modalidadeAprovada: 'PARCELADO' | 'AVISTA' }) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

/** Rótulo do documento: o app manda o nome real no filename e um tipo genérico. */
function docLabel(doc: { tipo: string; filename: string }): string {
  const tipo = doc.tipo?.trim() || '';
  if (tipo && !/^documentos?$/i.test(tipo)) return tipo;
  const name = doc.filename?.replace(/\.[^.]+$/, '').trim();
  return name || tipo || 'Documento';
}

export default function LeadDetail({ lead, onClose, onStatusChange, onDelete, onWhatsApp, onUpdateGroups, onRecusar, onAprovar }: LeadDetailProps) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [recusando, setRecusando] = useState(false);
  const [aprovando, setAprovando] = useState(false);
  const [enviandoGrupo, setEnviandoGrupo] = useState(false);
  const [cobrancaFacil, setCobrancaFacil] = useState(false);

  useEffect(() => {
    fetchMessageLogs(lead.id).then(res => {
      if (res.success) setLogs(res.data);
    }).catch(() => {});
  }, [lead.id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadLeadDossier(lead, logs);
    } catch (error) {
      console.error('Erro ao gerar dossiê:', error);
      notify('Não foi possível gerar o backup deste cliente.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const endereco = lead.endereco
    ? `${lead.endereco}${lead.cep ? ` — CEP: ${lead.cep}` : ''}`
    : '—';

  const hasLocation = typeof lead.latitude === 'number' && typeof lead.longitude === 'number';
  const mapsUrl = `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`;

  const photoUrl = clientPhotoUrl(lead.documentos);

  return (
    <div className="flex max-h-[90vh] w-[min(940px,95vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="text-[16px] font-bold text-ink">Detalhes do cliente</h3>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
          <X size={17} className="text-subtle" />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[300px_1fr]">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center">
            <span className={`relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl text-[36px] font-bold text-white ${avatarColor(lead.nome)}`}>
              {initials(lead.nome)}
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={lead.nome}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => e.currentTarget.remove()}
                />
              )}
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink">{lead.nome}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
              {lead.telefone}
              {!isInternalStatus(lead.status) && (
                <button onClick={() => onWhatsApp(lead)} title="WhatsApp" className="text-[#25D366] hover:scale-110 transition-transform cursor-pointer">
                  <MessageCircle size={14} fill="currentColor" />
                </button>
              )}
            </p>
          </div>

          <div className="divide-y divide-line rounded-xl border border-line">
            <InfoRow icon={<Banknote size={15} />} label="Renda mensal">{formatMoney(lead.renda)}</InfoRow>
            <InfoRow icon={<Wallet size={15} />} label="Valor solicitado">
              <span className="font-bold text-info">{formatCurrency(lead.valorSolicitado)}</span>
            </InfoRow>
            <InfoRow icon={<CalendarClock size={15} />} label="Total a pagar c/ juros">{formatCurrency(lead.valorTotal)}</InfoRow>
            <InfoRow icon={<MapPin size={15} />} label="Cidade">{lead.cidade}</InfoRow>
            <InfoRow icon={<Briefcase size={15} />} label="Perfil profissional">
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{lead.perfil}</span>
            </InfoRow>
            <InfoRow icon={<Building2 size={15} />} label="Empresa">{lead.nomeEmpresa || '—'}</InfoRow>
            <InfoRow icon={<Briefcase size={15} />} label="Local de trabalho">{lead.enderecoTrabalho || lead.bairroTrabalho || '—'}</InfoRow>
            <InfoRow icon={<UserRound size={15} />} label="Indicado por">{lead.indicacao || '—'}</InfoRow>
            <InfoRow icon={<CreditCard size={15} />} label="Modalidade">
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] text-brand-deep">{modalidade(lead.prazo)}</span>
            </InfoRow>
            <InfoRow icon={<Home size={15} />} label="Endereço">{endereco}</InfoRow>
          </div>

          {/* Localização compartilhada pelo cliente */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink-2">
              <MapPin size={14} className="text-info" /> Localização da solicitação
            </p>
            {hasLocation ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <iframe
                  title="Localização da solicitação"
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${lead.latitude},${lead.longitude}&z=15&output=embed`}
                />
                <a
                  href={`https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-canvas py-2 text-[12px] font-semibold text-brand-deep transition-colors hover:bg-line"
                >
                  <MapPin size={13} /> Ver no mapa
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/60 py-6 text-center">
                <MapPin size={22} className="text-subtle" />
                <p className="mt-1.5 px-4 text-[11.5px] text-subtle">
                  O cliente não compartilhou a localização.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          {/* Documentos */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink">
              <FileText size={16} className="text-info" /> Documentos e fotos enviados
              {lead.documentos?.length > 0 && <span className="text-subtle">({lead.documentos.length})</span>}
            </p>
            {lead.documentos?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {lead.documentos.map((doc) => {
                  const isImage = IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url);
                  return (
                    <div key={doc.id} className="overflow-hidden rounded-xl border border-line">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex h-24 items-center justify-center bg-canvas">
                        {isImage
                          ? <img src={doc.url} alt={docLabel(doc)} loading="lazy" className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                          : <FileText size={30} className="text-subtle" strokeWidth={1.5} />}
                      </a>
                      <div className="px-2 py-1.5">
                        <p className="truncate text-[11.5px] font-semibold text-ink" title={docLabel(doc)}>{docLabel(doc)}</p>
                        <p className="text-[10px] text-subtle">Enviado em {formatDate(doc.createdAt)}</p>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-brand/10 py-1 text-[11px] font-semibold text-brand-deep transition-colors hover:bg-brand/20">
                          <Download size={11} /> Baixar
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-canvas/60 py-8 text-center text-[13px] text-subtle">
                Nenhum documento enviado.
              </p>
            )}
          </div>

          {/* Observação: logo abaixo dos documentos */}
          {lead.observacao && (
            <div className="flex gap-2.5 rounded-xl border-l-4 border-info bg-info/5 p-3">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-info" />
              <div>
                <p className="text-[11px] font-semibold text-info">Observação do cliente</p>
                <p className="mt-0.5 text-[12.5px] text-ink-2">{lead.observacao}</p>
              </div>
            </div>
          )}

          {/* Ações da análise */}
          <div>
            <p className="mb-2 text-[14px] font-bold text-ink">Ações da análise</p>

            {/* Status para leads não pendentes */}
            {lead.status !== 'PENDENTE' && (
              <select
                value={STATUS_ORDER.includes(lead.status as never) ? lead.status : ''}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="mb-3 w-full cursor-pointer rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              >
                {!STATUS_ORDER.includes(lead.status as never) && <option value="" disabled>{statusLabel(lead.status)}</option>}
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{METRICS[s].label}</option>)}
              </select>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {lead.status === 'PENDENTE' && (
                <>
                  <ActionBtn icon={<CheckCircle size={15} />} label="Aprovar"
                    className="bg-success text-white hover:brightness-110"
                    onClick={() => setAprovando(true)} />
                  <ActionBtn icon={<XCircle size={15} />} label="Recusar"
                    className="bg-danger text-white hover:brightness-110"
                    onClick={() => setRecusando(true)} />
                </>
              )}
              <ActionBtn icon={<MessageCircle size={15} />} label="Enviar status ao cliente"
                disabled={isInternalStatus(lead.status)}
                className="bg-info/10 text-info hover:bg-info/20 disabled:opacity-50"
                onClick={() => onWhatsApp(lead)} />
              <ActionBtn icon={<Shield size={15} />} label="Evitar golpes"
                className={lead.evitarGolpes ? 'bg-purple-500/15 text-purple-600 ring-1 ring-purple-500' : 'bg-canvas text-ink-2 hover:bg-line'}
                onClick={() => onUpdateGroups(lead.id, { evitarGolpes: !lead.evitarGolpes })} />
              <ActionBtn icon={<Users size={15} />} label="Análise de clientes"
                className={lead.analiseCliente ? 'bg-orange/15 text-orange ring-1 ring-orange' : 'bg-canvas text-ink-2 hover:bg-line'}
                onClick={() => onUpdateGroups(lead.id, { analiseCliente: !lead.analiseCliente })} />
              <ActionBtn icon={<Send size={15} />} label="Enviar para o grupo"
                className="bg-info/10 text-info hover:bg-info/20"
                onClick={() => setEnviandoGrupo(true)} />
              <ActionBtn icon={<Send size={15} />} label="Sistema Cobrança Fácil"
                className="bg-success/10 text-success hover:bg-success/20"
                onClick={() => setCobrancaFacil(true)} />
              <ActionBtn
                icon={downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                label={downloading ? 'Gerando...' : 'Baixar backup'}
                disabled={downloading}
                className="bg-canvas text-ink-2 hover:bg-line" onClick={handleDownload} />
              <ActionBtn icon={<MapPin size={15} />} label="Ver localização"
                disabled={!hasLocation}
                className={hasLocation ? 'bg-canvas text-ink-2 hover:bg-line' : 'bg-canvas text-subtle'}
                onClick={hasLocation ? () => window.open(mapsUrl, '_blank', 'noopener') : undefined} />
              <ActionBtn icon={<Trash2 size={15} />} label="Excluir solicitação"
                className="bg-danger/10 text-danger hover:bg-danger/20"
                onClick={() => onDelete(lead.id)} />
            </div>
          </div>

          {/* Dados da recusa: grupo em que caiu + motivo (aparece só em recusados). */}
          {lead.status === 'RECUSADO' && (
            <RecusaEditor lead={lead} onUpdateGroups={onUpdateGroups} />
          )}

          {/* Histórico de mensagens */}
          {logs.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink-2">Mensagens enviadas ({logs.length})</p>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl bg-canvas p-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${log.status === 'ENVIADO' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-subtle">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="line-clamp-3 whitespace-pre-line text-[11px] text-ink-2">{log.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de recusa: motivo + mensagem ao cliente (aberto pelo botão Recusar). */}
      {recusando && (
        <RecusarModal
          lead={lead}
          onClose={() => setRecusando(false)}
          onConfirm={(data) => { setRecusando(false); onRecusar(lead, data); }}
        />
      )}

      {/* Modal de aprovação: valor + modalidade (aberto pelo botão Aprovar). */}
      {aprovando && (
        <AprovarModal
          lead={lead}
          onClose={() => setAprovando(false)}
          onConfirm={(data) => { setAprovando(false); onAprovar(lead, data); }}
        />
      )}

      {/* Modal de envio ao grupo de análise (WhatsApp / copiar). */}
      {enviandoGrupo && (
        <EnviarGrupoModal
          lead={lead}
          onClose={() => setEnviandoGrupo(false)}
          onPersist={(deveAlguem) => onUpdateGroups(lead.id, { deveAlguem })}
        />
      )}

      {/* Revisão + envio dos dados ao sistema Cobrança Fácil. */}
      {cobrancaFacil && (
        <CobrancaFacilModal lead={lead} onClose={() => setCobrancaFacil(false)} />
      )}
    </div>
  );
}

/** Editor dos dados da recusa: grupo em que caiu (1/2/3) + motivo. */
function RecusaEditor({ lead, onUpdateGroups }: {
  lead: Lead;
  onUpdateGroups: (id: string, data: { grupo?: number | null; motivoRecusa?: string | null }) => void;
}) {
  const [motivo, setMotivo] = useState(lead.motivoRecusa ?? '');

  // Sincroniza quando trocar de lead (o modal é reaproveitado entre clientes).
  useEffect(() => { setMotivo(lead.motivoRecusa ?? ''); }, [lead.id, lead.motivoRecusa]);

  const grupoDirty = (lead.grupo ?? null);
  const motivoDirty = motivo.trim() !== (lead.motivoRecusa ?? '').trim();

  const setGrupo = (g: number) => {
    onUpdateGroups(lead.id, { grupo: grupoDirty === g ? null : g });
  };

  const salvarMotivo = () => {
    onUpdateGroups(lead.id, { motivoRecusa: motivo.trim() || null });
    notify('Motivo da recusa salvo.', 'success');
  };

  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
      <p className="mb-2 text-[11px] font-semibold text-danger">Dados da recusa</p>

      <p className="mb-1.5 text-[11.5px] text-muted">Motivo do grupo</p>
      <div className="mb-3 space-y-1.5">
        {MOTIVOS_RECUSA.map((m) => (
          <button
            key={m.grupo}
            onClick={() => setGrupo(m.grupo)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-[12.5px] font-semibold transition-colors cursor-pointer
              ${grupoDirty === m.grupo ? 'border-danger bg-danger text-white' : 'border-line bg-surface text-ink-2 hover:bg-canvas'}`}
          >
            {m.titulo}
          </button>
        ))}
      </div>

      <p className="mb-1.5 text-[11.5px] text-muted">Motivo da recusa</p>
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        rows={2}
        placeholder="Ex.: Score de crédito baixo, documentação incompleta..."
        className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink
          placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
      />
      <button
        onClick={salvarMotivo}
        disabled={!motivoDirty}
        className="mt-2 w-full rounded-lg bg-danger py-2 text-[12.5px] font-semibold text-white transition-colors
          hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        Salvar motivo
      </button>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">{icon}</span>
      <span className="w-28 shrink-0 text-[11.5px] text-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right text-[12.5px] font-semibold text-ink" title={typeof children === 'string' ? children : undefined}>
        {children}
      </span>
    </div>
  );
}

function ActionBtn({ icon, label, className = '', disabled, onClick }: {
  icon: ReactNode; label: string; className?: string; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center text-[12px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${className}`}
    >
      {icon}
      <span className="leading-tight">{label}</span>
    </button>
  );
}
