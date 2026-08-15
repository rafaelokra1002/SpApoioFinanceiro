import { useState, useEffect, ReactNode } from 'react';
import {
  X, CheckCircle, XCircle, Trash2, MessageCircle, Download, Loader2, Banknote,
  Wallet, CalendarClock, MapPin, Briefcase, Building2, UserRound, CreditCard,
  Send, Shield, Users, FileText, Search, ChevronDown, Calendar, AtSign, Target,
  Monitor, CloudDownload, ClipboardList, Camera, Clock, Zap, ExternalLink, Play,
  MoreHorizontal, Check, FolderInput,
} from 'lucide-react';
import { Lead } from '../types';
import { parseGarantia, isBemDoc, GarantiaInfo } from '../utils/garantia';
import { fixMojibake } from '../utils/text';
import { fetchMessageLogs } from '../services/api';
import { downloadDocument, downloadLeadDossier } from '../utils/leadDossier';
import { METRICS, STATUS_ORDER, isInternalStatus, statusLabel, MetricKey } from '../constants/status';
import { camposEmprego, modalidade, origemOf } from '../utils/analytics';
import { avatarColor, clientPhotoUrl, initials } from '../utils/avatar';
import { notify } from './Notice';
import RecusarModal from './leads/RecusarModal';
import AprovarModal from './leads/AprovarModal';
import EnviarGrupoModal from './leads/EnviarGrupoModal';
import { MOTIVOS_RECUSA } from './leads/RecusarModal';
import CobrancaFacilModal from './leads/CobrancaFacilModal';
import EnviarStatusModal from './leads/EnviarStatusModal';

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

/** "27/05/2025 às 14:35" — usado no chip de situação do topo. */
function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const data = d.toLocaleDateString('pt-BR');
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v|avi|3gp|mkv)$/i;

/** Rótulos amigáveis dos perfis (o app grava o código em `lead.perfil`). */
const PERFIL_LABELS: Record<string, string> = {
  CARTEIRA_ASSINADA: 'CLT Registrado',
  CLT_SEM_REGISTRO: 'CLT Informal',
  AUTONOMO: 'Autônomo',
  BENEFICIARIO: 'Beneficiário',
  ESTAGIARIO: 'Estagiário',
  COM_GARANTIA: 'Bem como garantia',
  SEM_COMPROVACAO: 'Renda sem comprovação',
};
function perfilLabel(perfil: string): string {
  return PERFIL_LABELS[perfil] ?? perfil;
}

/** Rótulo do documento: o app manda o nome real no filename e um tipo genérico. */
function docLabel(doc: { tipo: string; filename: string }): string {
  const tipo = fixMojibake(doc.tipo?.trim() || '');
  if (tipo && !/^documentos?$/i.test(tipo)) return tipo;
  const name = fixMojibake(doc.filename?.replace(/\.[^.]+$/, '').trim() || '');
  return name || tipo || 'Documento';
}

/** Nome exibido no card do documento (selfie vira "Foto do cliente"). */
function docDisplayLabel(doc: { tipo: string; filename: string }): string {
  const l = docLabel(doc);
  if (/selfie|rosto/i.test(l)) return 'Foto do cliente';
  // Mídia do bem ("Veículo — Foto frontal") aparece só com o trecho final.
  if (isBemDoc(l)) return l.split(' — ').slice(1).join(' — ') || l;
  return l;
}

/** Cor do texto/ícone conforme a situação atual do lead. */
function statusTone(status: string): string {
  switch (status) {
    case 'APROVADO': return 'text-success';
    case 'RECUSADO': return 'text-danger';
    case 'PENDENTE': return 'text-warning';
    default: return 'text-info';
  }
}

/** Rótulo do chip de data conforme a situação. */
function dateChipLabel(status: string): string {
  switch (status) {
    case 'APROVADO': return 'Aprovado em:';
    case 'RECUSADO': return 'Recusado em:';
    case 'PENDENTE': return 'Recebido em:';
    default: return 'Atualizado em:';
  }
}

export default function LeadDetail({ lead, onClose, onStatusChange, onDelete, onWhatsApp, onUpdateGroups, onRecusar, onAprovar }: LeadDetailProps) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [baixandoDoc, setBaixandoDoc] = useState<string | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [aprovando, setAprovando] = useState(false);
  const [enviandoGrupo, setEnviandoGrupo] = useState(false);
  const [cobrancaFacil, setCobrancaFacil] = useState(false);
  const [enviandoStatus, setEnviandoStatus] = useState(false);
  // "Mais ações" abre uma aba suspensa (modal) com marcações internas + envio ao grupo.
  const [maisAcoes, setMaisAcoes] = useState(false);
  // "Mover para a categoria" abre uma aba suspensa com os status disponíveis.
  const [moverCategoria, setMoverCategoria] = useState(false);
  // Clicar numa barra de garantia abre uma tela suspensa (modal) com o conteúdo.
  const [modalBem, setModalBem] = useState<'info' | 'midia' | null>(null);

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

  const baixarDocumento = async (doc: { id: string; tipo: string; filename: string; url: string }) => {
    try {
      setBaixandoDoc(doc.id);
      await downloadDocument(doc.url, `${lead.nome}-${docLabel(doc)}`);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      notify('Não foi possível baixar este documento.', 'error');
    } finally {
      setBaixandoDoc(null);
    }
  };

  const hasLocation = typeof lead.latitude === 'number' && typeof lead.longitude === 'number';
  const mapsUrl = `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`;

  const photoUrl = clientPhotoUrl(lead.documentos);

  // Garantia: dados estruturados extraídos da observação (perfil COM_GARANTIA).
  const garantia = parseGarantia(lead.observacao);
  // Observação a exibir: sem o bloco de garantia (que ganha seção própria).
  const observacaoCliente = garantia ? garantia.observacaoCliente : (lead.observacao || '');

  // Separa as mídias do bem (fotos/vídeo do item) dos documentos pessoais.
  const docs = lead.documentos ?? [];
  const bemDocs = docs.filter((d) => isBemDoc(docLabel(d)));
  const pessoalDocs = docs.filter((d) => !isBemDoc(docLabel(d)));
  // As barras do bem só valem para quem ofereceu garantia.
  const temGarantia = lead.perfil === 'COM_GARANTIA' || garantia !== null || bemDocs.length > 0;
  const campos = camposEmprego(lead.perfil);

  const StatusIcon = METRICS[lead.status as MetricKey]?.icon ?? CalendarClock;

  // Enquanto qualquer modal de ação está aberto, a "Visão do Cliente" some (não fica atrás).
  const algumModal = recusando || aprovando || enviandoGrupo || cobrancaFacil
    || enviandoStatus || maisAcoes || moverCategoria || modalBem !== null;

  const renderDocCard = (doc: typeof docs[number], tall = false) => {
    const isImage = IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url);
    const isVideo = VIDEO_EXT.test(doc.filename) || VIDEO_EXT.test(doc.url);
    const media = tall ? 'h-40' : 'h-20';
    return (
      <div key={doc.id} className="flex flex-col rounded-2xl border border-line bg-surface p-2.5 shadow-sm">
        <p className="mb-1.5 truncate text-center text-[12px] font-semibold text-muted" title={docDisplayLabel(doc)}>
          {docDisplayLabel(doc)}
        </p>
        <a href={doc.url} target="_blank" rel="noopener noreferrer"
          className={`flex ${media} items-center justify-center overflow-hidden rounded-xl border border-line/70 bg-canvas`}>
          {isVideo
            ? <VideoThumb url={doc.url} />
            : isImage
            ? <img src={doc.url} alt={docDisplayLabel(doc)} loading="lazy" className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            : <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <FileText size={36} strokeWidth={1.4} />
                <span className="px-2 text-center text-[10px] font-semibold leading-tight">Documento PDF</span>
              </div>}
        </a>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <a href={doc.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11.5px] font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink-2">
            <Search size={13} /> Visualizar
          </a>
          <button
            onClick={() => baixarDocumento(doc)}
            disabled={baixandoDoc === doc.id}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11.5px] font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
            {baixandoDoc === doc.id
              ? <><Loader2 size={12} className="animate-spin" /> Baixando</>
              : <><Download size={13} /> Baixar</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Visão do Cliente — oculta enquanto um modal de ação está aberto. */}
      {!algumModal && (
      // Moldura com borda em gradiente azul→roxo, como no modelo.
      <div className="rounded-[26px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[3px] shadow-2xl">
      <div className="flex max-h-[96vh] w-[min(1080px,94vw)] flex-col overflow-hidden rounded-3xl bg-canvas">
        {/* Cabeçalho */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-b border-line bg-surface px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
              <UserRound size={20} />
            </span>
            <div>
              <h3 className="text-[19px] font-extrabold leading-tight text-ink">Visão do Cliente</h3>
              <p className="text-[12px] text-subtle">Todas as informações e documentos do cliente em um só lugar.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Chips: categoria • situação • data */}
            <div className="hidden items-stretch divide-x divide-line overflow-hidden rounded-xl border border-line bg-canvas md:flex">
              <HeaderChip icon={<Target size={16} className="text-purple-500" />} label="Categoria" value={perfilLabel(lead.perfil)} />
              <HeaderChip icon={<StatusIcon size={16} className={statusTone(lead.status)} />} label="Situação"
                value={<span className={statusTone(lead.status)}>{statusLabel(lead.status)}</span>} />
              <HeaderChip icon={<Calendar size={16} className="text-blue-500" />} label={dateChipLabel(lead.status)}
                value={formatDateTime(lead.status === 'PENDENTE' ? lead.createdAt : lead.updatedAt)} />
            </div>

            <button onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md transition-transform hover:scale-105 cursor-pointer">
              <X size={20} strokeWidth={2.6} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
          {/* Linha 1: Dados do cliente | Documentos enviados */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
            {/* Dados do cliente */}
            <Section icon={<UserRound size={18} className="text-ink" />} title="Dados do Cliente">
              <div className="flex items-center gap-3">
                <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-[22px] font-bold text-white ring-2 ring-blue-400/40 ${avatarColor(lead.nome)}`}>
                  {initials(lead.nome)}
                  {photoUrl && (
                    <img src={photoUrl} alt={lead.nome} loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => e.currentTarget.remove()} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[18px] font-extrabold leading-tight text-ink">{lead.nome}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-2">
                    {!isInternalStatus(lead.status) && (
                      <button onClick={() => onWhatsApp(lead)} title="Enviar WhatsApp"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110 cursor-pointer">
                        <MessageCircle size={11} fill="currentColor" />
                      </button>
                    )}
                    {lead.telefone}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3">
                <InfoItem icon={<Banknote size={15} className="text-emerald-500" />} iconBg="bg-emerald-500/10" label="Renda mensal" value={formatMoney(lead.renda)} />
                <InfoItem icon={<Building2 size={15} className="text-indigo-500" />} iconBg="bg-indigo-500/10" label={campos.empresa} value={lead.nomeEmpresa || '—'} />
                <InfoItem icon={<Wallet size={15} className="text-violet-500" />} iconBg="bg-violet-500/10" label="Valor solicitado" value={formatCurrency(lead.valorSolicitado)} />
                <InfoItem icon={<Briefcase size={15} className="text-sky-500" />} iconBg="bg-sky-500/10" label={campos.local} value={lead.enderecoTrabalho || lead.bairroTrabalho || '—'} />
                <InfoItem icon={<CalendarClock size={15} className="text-rose-500" />} iconBg="bg-rose-500/10" label="Total a pagar com juros"
                  value={<span className="text-danger">{formatCurrency(lead.valorTotal)}</span>} />
                <InfoItem icon={<AtSign size={15} className="text-pink-500" />} iconBg="bg-pink-500/10" label="Instagram (URL)"
                  value={lead.instagram
                    ? <a href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace(/^@/, '')}`}
                        target="_blank" rel="noopener noreferrer" className="hover:underline">{lead.instagram}</a>
                    : '—'} />
                <InfoItem icon={<CreditCard size={15} className="text-amber-500" />} iconBg="bg-amber-500/10" label="Modalidade"
                  value={lead.parcelas > 1 ? `Parcelado (${lead.parcelas}x)` : 'À vista'} />
                <InfoItem icon={<UserRound size={15} className="text-blue-500" />} iconBg="bg-blue-500/10" label="Indicado por" value={lead.indicacao || '—'} />
                <InfoItem icon={<MapPin size={15} className="text-teal-500" />} iconBg="bg-teal-500/10" label="Cidade / Estado" value={lead.cidade} />
                <InfoItem icon={<Users size={15} className="text-emerald-500" />} iconBg="bg-emerald-500/10" label="Origem" value={origemOf(lead)} />
              </div>
            </Section>

            {/* Documentos enviados */}
            <Section icon={<FileText size={18} className="text-purple-500" />} title="Documentos Enviados"
              count={pessoalDocs.length}>
              {pessoalDocs.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {pessoalDocs.map((d) => renderDocCard(d))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-line bg-canvas/60 py-10 text-center text-[13px] text-subtle">
                  Nenhum documento enviado.
                </p>
              )}
            </Section>
          </div>

          {/* Linha 2: barras do bem em garantia (só para clientes COM garantia) —
              clicar abre uma tela suspensa (modal) */}
          {temGarantia && (
            <div className="space-y-2.5">
              <GarantiaBar
                icon={<Shield size={16} className="text-amber-600" />}
                title="Informações do bem como garantia"
                onClick={() => setModalBem('info')}
              />
              <GarantiaBar
                icon={<Camera size={16} className="text-purple-500" />}
                title="Fotos e vídeo do bem como garantia"
                count={bemDocs.length}
                onClick={() => setModalBem('midia')}
              />
            </div>
          )}

          {/* Linha 3: localização | observação */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3.5">
              <p className="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-ink">
                <MapPin size={15} className="text-emerald-600" /> Localização
              </p>
              {hasLocation ? (
                <div className="flex gap-3.5">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-line">
                    <iframe
                      title="Localização da solicitação"
                      className="pointer-events-none h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${lead.latitude},${lead.longitude}&z=15&output=embed`}
                    />
                  </a>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
                      <CheckCircle size={14} /> Localização recebida
                    </p>
                    {lead.endereco && (
                      <>
                        <p className="mt-2 text-[11px] font-semibold text-subtle">Endereço completo:</p>
                        <p className="whitespace-pre-line text-[13px] text-ink-2">{lead.endereco}</p>
                      </>
                    )}
                    {lead.cep && <p className="text-[13px] text-ink-2">CEP: {lead.cep}</p>}
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-1.5 text-[12px] font-semibold text-brand-deep transition-colors hover:bg-brand/10">
                      Ver no mapa <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/60 py-8 text-center">
                  <MapPin size={24} className="text-subtle" />
                  <p className="mt-1.5 px-4 text-[12px] text-subtle">O cliente não compartilhou a localização.</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
              <p className="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-teal-600 dark:text-teal-400">
                <ClipboardList size={15} /> Observação do cliente
              </p>
              {observacaoCliente ? (
                <p className="whitespace-pre-line text-[13px] text-ink-2">{observacaoCliente}</p>
              ) : (
                <p className="text-[13px] text-subtle">Sem observação do cliente.</p>
              )}
            </div>
          </div>

          {/* Linha 4: ações */}
          <Section icon={<Zap size={18} className="text-blue-500" fill="currentColor" />} title="Ações">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
                  <BigAction icon={<CheckCircle size={15} />} label="Aprovar"
                    gradient="bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={() => setAprovando(true)} />
                  <BigAction icon={<XCircle size={15} />} label="Recusar"
                    gradient="bg-gradient-to-r from-red-500 to-rose-600"
                    onClick={() => setRecusando(true)} />
                  <BigAction icon={<Send size={15} />} label="Enviar status"
                    gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                    disabled={isInternalStatus(lead.status)}
                    onClick={() => setEnviandoStatus(true)} />
                  <BigAction icon={<Monitor size={15} />} label="Enviar cobrança fácil"
                    gradient="bg-gradient-to-r from-teal-500 to-cyan-600"
                    onClick={() => setCobrancaFacil(true)} />
                  <BigAction icon={downloading ? <Loader2 size={15} className="animate-spin" /> : <CloudDownload size={15} />}
                    label={downloading ? 'Gerando...' : 'Baixar backup'}
                    gradient="bg-gradient-to-r from-orange-400 to-amber-500"
                    disabled={downloading}
                    onClick={handleDownload} />
                  <BigAction icon={<MapPin size={15} />} label="Ver localização"
                    gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                    disabled={!hasLocation}
                    onClick={hasLocation ? () => window.open(mapsUrl, '_blank', 'noopener') : undefined} />
                  <BigAction icon={<Trash2 size={15} />} label="Excluir solicitação"
                    gradient="bg-gradient-to-r from-rose-500 to-red-500"
                    onClick={() => onDelete(lead.id)} />

                  {/* Mais ações: abre uma aba suspensa (modal) com as marcações e o envio ao grupo. */}
                  <BigAction icon={<MoreHorizontal size={15} />} label="Mais ações"
                    gradient="bg-gradient-to-r from-slate-500 to-slate-600"
                    onClick={() => setMaisAcoes(true)} />
                </div>
              </div>

              {/* Mover para a categoria + legenda */}
              <div>
                <button onClick={() => setMoverCategoria(true)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-md transition-all hover:brightness-110 cursor-pointer">
                  Mover para a categoria
                  <ChevronDown size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Dados da recusa: grupo em que caiu + motivo (aparece só em recusados). */}
            {lead.status === 'RECUSADO' && (
              <div className="mt-4">
                <RecusaEditor lead={lead} onUpdateGroups={onUpdateGroups} />
              </div>
            )}

            {/* Histórico de mensagens */}
            {logs.length > 0 && (
              <div className="mt-4">
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
          </Section>
        </div>
      </div>
      </div>
      )}

      {/* Modais de ação — fora da Visão do Cliente para ela não ficar atrás. */}
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
            onStatusChange={(status) => { setAprovando(false); onStatusChange(lead.id, status); }}
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

        {/* Envio de atualização de status ao cliente. */}
        {enviandoStatus && (
          <EnviarStatusModal
            lead={lead}
            onClose={() => setEnviandoStatus(false)}
            onEnviarStatus={() => onWhatsApp(lead)}
          />
        )}

        {/* Aba suspensa "Mais ações": marcações internas + envio ao grupo. */}
        {maisAcoes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMaisAcoes(false)} />
            <div className="relative z-10 w-[min(400px,92vw)] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="flex items-center gap-2 text-[15px] font-bold text-ink">
                  <MoreHorizontal size={17} className="text-ink-2" /> Mais ações
                </p>
                <button onClick={() => setMaisAcoes(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
                  <X size={16} className="text-subtle" />
                </button>
              </div>
              <div className="space-y-1.5 p-3">
                <MaisAcaoRow
                  icon={<Shield size={17} />} label="Evitar golpes"
                  ativo={lead.evitarGolpes} tint="purple"
                  onClick={() => onUpdateGroups(lead.id, { evitarGolpes: !lead.evitarGolpes })}
                />
                <MaisAcaoRow
                  icon={<Users size={17} />} label="Análise de clientes"
                  ativo={lead.analiseCliente} tint="orange"
                  onClick={() => onUpdateGroups(lead.id, { analiseCliente: !lead.analiseCliente })}
                />
                <MaisAcaoRow
                  icon={<Send size={17} />} label="Enviar para o grupo"
                  descricao="Compartilhar no grupo de análise"
                  onClick={() => { setMaisAcoes(false); setEnviandoGrupo(true); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Aba suspensa "Mover para a categoria": status disponíveis (exceto o atual). */}
        {moverCategoria && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMoverCategoria(false)} />
            <div className="relative z-10 w-[min(400px,92vw)] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="flex items-center gap-2 text-[15px] font-bold text-ink">
                  <FolderInput size={17} className="text-purple-600" /> Mover para a categoria
                </p>
                <button onClick={() => setMoverCategoria(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
                  <X size={16} className="text-subtle" />
                </button>
              </div>
              <div className="space-y-1.5 p-3">
                {STATUS_ORDER.filter((s) => s !== lead.status).map((s) => {
                  const Icon = METRICS[s].icon;
                  return (
                    <button key={s} onClick={() => { setMoverCategoria(false); onStatusChange(lead.id, s); }}
                      className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:bg-canvas cursor-pointer">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas ${statusTone(s)}`}>
                        <Icon size={17} />
                      </span>
                      <span className="text-[13.5px] font-semibold text-ink">{METRICS[s].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tela suspensa do bem em garantia (informações ou mídias). */}
        {modalBem && (
          <GarantiaModal
            tipo={modalBem}
            garantia={garantia}
            bemDocs={bemDocs}
            renderDocCard={renderDocCard}
            onSwitch={setModalBem}
            onClose={() => setModalBem(null)}
          />
        )}
    </>
  );
}

/** Card de seção com cabeçalho (ícone + título + contagem opcional). */
function Section({ icon, title, count, children }: {
  icon: ReactNode; title: string; count?: number; children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-sm">
      <p className="mb-2 flex items-center gap-2 border-b border-line pb-2 text-[14px] font-bold text-ink">
        {icon} {title}
        {typeof count === 'number' && count > 0 && <span className="text-subtle">({count})</span>}
      </p>
      {children}
    </div>
  );
}

/** Barra do bem em garantia: clicar abre a tela suspensa (modal) com o conteúdo. */
function GarantiaBar({ icon, title, count, onClick }: {
  icon: ReactNode; title: string; count?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-3.5 py-2.5 text-left transition-colors hover:bg-amber-500/15 cursor-pointer">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface shadow-sm">{icon}</span>
      <span className="text-[14px] font-bold text-ink">{title}</span>
      {typeof count === 'number' && count > 0 && <span className="text-[12px] text-subtle">({count})</span>}
      <span className="ml-auto flex items-center gap-2.5">
        <span className="rounded-md bg-orange/15 px-2 py-0.5 text-[11.5px] font-semibold text-orange">Suspenso</span>
        <ChevronDown size={18} className="text-subtle" />
      </span>
    </button>
  );
}

/** Miniatura de vídeo: quadro do vídeo + botão de play + duração. */
function VideoThumb({ url }: { url: string }) {
  const [dur, setDur] = useState('');
  return (
    <div className="relative h-full w-full">
      <video
        src={url}
        preload="metadata"
        muted
        className="h-full w-full object-cover"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) {
            const m = Math.floor(d / 60);
            const s = Math.floor(d % 60);
            setDur(`${m}:${String(s).padStart(2, '0')}`);
          }
        }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </span>
      </span>
      {dur && (
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {dur}
        </span>
      )}
    </div>
  );
}

/** Tela suspensa (modal) com as informações ou as mídias do bem em garantia. */
function GarantiaModal({ tipo, garantia, bemDocs, renderDocCard, onSwitch, onClose }: {
  tipo: 'info' | 'midia';
  garantia: GarantiaInfo | null;
  bemDocs: Lead['documentos'];
  renderDocCard: (doc: Lead['documentos'][number], tall?: boolean) => ReactNode;
  onSwitch: (tipo: 'info' | 'midia') => void;
  onClose: () => void;
}) {
  const isInfo = tipo === 'info';
  // Campos "Sim/Não" viram pílulas de acessórios; o resto vira lista label/valor.
  const isAcessorio = (v: string) => /^(sim|n[aã]o)$/i.test(v.trim());
  const mainCampos = garantia?.campos.filter((c) => !isAcessorio(c.value)) ?? [];
  const acessorios = garantia?.campos.filter((c) => isAcessorio(c.value)) ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Moldura com borda em gradiente roxo, como no modelo. */}
      <div className="relative z-10 rounded-[22px] bg-gradient-to-br from-violet-500 to-purple-600 p-[3px] shadow-2xl">
        <div className="flex max-h-[86vh] w-[min(900px,94vw)] flex-col overflow-hidden rounded-[19px] bg-surface">
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <p className="flex items-center gap-2.5 text-[16px] font-bold text-ink">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isInfo ? 'bg-orange/10 text-orange' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md'}`}>
                {isInfo ? <Shield size={18} /> : <Camera size={18} />}
              </span>
              {isInfo ? 'Informações do bem como garantia' : 'Fotos e vídeo do bem como garantia'}
              {garantia && <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[12px] font-semibold text-purple-600 dark:text-purple-400">{garantia.bem}</span>}
            </p>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md transition-transform hover:scale-105 cursor-pointer">
              <X size={18} strokeWidth={2.6} />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="overflow-y-auto p-5">
            {isInfo ? (
              garantia && garantia.campos.length > 0 ? (
                <div className="space-y-5">
                  {/* Campos principais em lista (label à esquerda, valor à direita). */}
                  {mainCampos.length > 0 && (
                    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-canvas/40">
                      {mainCampos.map((c, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                          <span className="text-[13.5px] text-muted">{c.label}</span>
                          <span className="text-right text-[14px] font-semibold text-ink [overflow-wrap:anywhere]">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acessórios inclusos (Sim/Não) como pílulas com ✓. */}
                  {acessorios.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-[15px] font-bold text-ink">Acessórios inclusos</p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {acessorios.map((c, i) => {
                          const sim = /^sim$/i.test(c.value.trim());
                          return (
                            <div key={i} className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink-2">
                              {c.label} —
                              {sim
                                ? <CheckCircle size={15} className="text-success" />
                                : <XCircle size={15} className="text-danger" />}
                              {c.value}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-[13px] text-subtle">Este cliente não ofereceu bem em garantia.</p>
              )
            ) : (
              bemDocs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {bemDocs.map((d) => renderDocCard(d, true))}
                </div>
              ) : (
                <p className="py-8 text-center text-[13px] text-subtle">Nenhuma mídia do bem enviada.</p>
              )
            )}
          </div>

          {/* Rodapé: alterna entre detalhes e mídias (fechar é pelo X do topo) */}
          <div className="shrink-0 border-t border-line px-5 py-3">
            <button onClick={() => onSwitch(isInfo ? 'midia' : 'info')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange/50 px-4 py-2.5 text-[14px] font-semibold text-orange transition-colors hover:bg-orange/10 cursor-pointer">
              {isInfo
                ? <><Camera size={16} /> Ver fotos e vídeos</>
                : <><Search size={16} /> Visualizar detalhes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chip do cabeçalho (categoria / situação / data). */
function HeaderChip({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span className="shrink-0">{icon}</span>
      <div className="leading-tight">
        <p className="text-[10.5px] text-subtle">{label}</p>
        <p className="text-[12.5px] font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

/** Item da grade "Dados do Cliente": ícone colorido + rótulo + valor completo. */
function InfoItem({ icon, iconBg, label, value }: { icon: ReactNode; iconBg: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] leading-tight text-muted">{label}</p>
        {/* Valor por completo: quebra em várias linhas em vez de cortar com "…". */}
        <p className="text-[13px] font-bold leading-snug text-ink [overflow-wrap:anywhere]">{value}</p>
      </div>
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

/** Botão grande de ação: ícone em círculo translúcido + rótulo, com gradiente. */
function BigAction({ icon, label, gradient, disabled, onClick }: {
  icon: ReactNode; label: string; gradient: string; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-bold text-white shadow-sm transition-all hover:brightness-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 ${gradient}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">{icon}</span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

/** Linha da aba suspensa "Mais ações": marcação (toggle) ou ação simples. */
function MaisAcaoRow({ icon, label, descricao, ativo, tint, onClick }: {
  icon: ReactNode; label: string; descricao?: string; ativo?: boolean; tint?: 'purple' | 'orange'; onClick?: () => void;
}) {
  const isToggle = ativo !== undefined;
  const iconBox = !isToggle
    ? 'bg-info/10 text-info'
    : ativo
    ? (tint === 'purple' ? 'bg-purple-500/15 text-purple-600' : 'bg-orange/15 text-orange')
    : 'bg-canvas text-subtle';
  const checkColor = tint === 'purple' ? 'text-purple-600' : 'text-orange';
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:bg-canvas cursor-pointer">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        <span className="block text-[11.5px] text-subtle">
          {isToggle ? (ativo ? 'Ativado' : 'Toque para ativar') : descricao}
        </span>
      </span>
      {isToggle && ativo && <Check size={17} className={checkColor} />}
    </button>
  );
}
