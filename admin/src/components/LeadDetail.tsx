import { useState, useEffect, ReactNode } from 'react';
import {
  X, CheckCircle, XCircle, Trash2, MessageCircle, Download, Loader2, MapPin, Briefcase, UserRound,
  CreditCard, Send, Shield, Users, FileText, Search, ChevronDown, Calendar, Camera, Play, MoreHorizontal,
  Check, FolderInput, Pencil, Copy, Eye, ChevronLeft, ChevronRight, Map as MapIcon, House, MessageSquare,
} from 'lucide-react';
import { Lead } from '../types';
import { parseGarantia, isBemDoc, GarantiaInfo } from '../utils/garantia';
import { fixMojibake } from '../utils/text';
import { fetchMessageLogs } from '../services/api';
import { downloadDocument, downloadLeadDossier } from '../utils/leadDossier';
import { METRICS, STATUS_ORDER, isInternalStatus, statusLabel } from '../constants/status';
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
  CLT_SEM_REGISTRO: 'Trabalho Informal',
  AUTONOMO: 'Autônomo / conta própria',
  MOTORISTA_APP: 'Motorista de aplicativo',
  TRABALHO_JOB: 'Trabalho com job (GP)',
  BENEFICIARIO: 'Beneficiário',
  ESTAGIARIO: 'Estagiário',
  SERVIDOR_PUBLICO: 'Servidor público',
  RECEBE_SEGURO: 'Recebe seguro',
  COM_GARANTIA: 'Bem como garantia',
  SEM_COMPROVACAO: 'Sem comprovação de renda',
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
    case 'APROVADO': return 'Aprovada em';
    case 'RECUSADO': return 'Recusada em';
    case 'PENDENTE': return 'Recebida em';
    default: return 'Atualizada em';
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
  // "Mais opções": menu suspenso na barra de ações.
  const [menuMais, setMenuMais] = useState(false);
  // Popover "Copiar dados" e documento aberto no visualizador.
  const [copiarAberto, setCopiarAberto] = useState(false);
  const [docIdx, setDocIdx] = useState(0);
  // "Mover para a categoria" abre uma aba suspensa com os status disponíveis.
  const [moverCategoria, setMoverCategoria] = useState(false);
  // Clicar numa barra de garantia abre uma tela suspensa (modal) com o conteúdo.
  const [modalBem, setModalBem] = useState<'info' | 'midia' | null>(null);

  useEffect(() => {
    fetchMessageLogs(lead.id).then(res => {
      if (res.success) setLogs(res.data);
    }).catch(() => {});
  }, [lead.id]);

  // O modal é reaproveitado entre clientes: volta para o primeiro documento.
  useEffect(() => { setDocIdx(0); setCopiarAberto(false); setMenuMais(false); }, [lead.id]);

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
  // Servidor público: vínculo e matrícula/cargo em campos próprios.
  const isServidor = lead.perfil === 'SERVIDOR_PUBLICO';
  const vinculoServidorLabel = lead.vinculoServidor === 'EFETIVO' ? 'Cargo efetivo'
    : lead.vinculoServidor === 'COMISSIONADO' ? 'Cargo comissionado' : '—';
  const matriculaCargoLabel = lead.vinculoServidor === 'COMISSIONADO' ? 'Cargo que ocupa' : 'Matrícula funcional';
  // Motorista de aplicativo: veículo próprio/alugado e placa.
  const isMotorista = lead.perfil === 'MOTORISTA_APP';
  const veiculoProprioLabel = lead.veiculoProprio === 'PROPRIO' ? 'Próprio'
    : lead.veiculoProprio === 'ALUGADO' ? 'Alugado' : '—';

  // Enquanto qualquer modal de ação está aberto, a "Visão do Cliente" some (não fica atrás).
  const algumModal = recusando || aprovando || enviandoGrupo || cobrancaFacil
    || enviandoStatus || moverCategoria || modalBem !== null;

  // Visualizador: documentos pessoais na ordem das abas (Documento, Rosto, Trabalho, Casa).
  const docsOrdenados = [...pessoalDocs].sort(
    (x, y) => DOC_TABS.findIndex((t) => t.key === docGrupo(x)) - DOC_TABS.findIndex((t) => t.key === docGrupo(y)),
  );
  // Páginas do visualizador: a aba Documento junta RG/CNH frente e verso numa página só;
  // nas outras abas é um documento por página.
  const paginas: (typeof docsOrdenados)[] = [];
  for (const d of docsOrdenados) {
    const ultima = paginas[paginas.length - 1];
    if (docGrupo(d) === 'documento' && ultima && docGrupo(ultima[0]) === 'documento') ultima.push(d);
    else paginas.push([d]);
  }
  const pagina = paginas.length ? paginas[Math.min(docIdx, paginas.length - 1)] : undefined;
  const docAtual = pagina?.[0];

  const renderMidia = (doc: typeof docsOrdenados[number]) => (
    VIDEO_EXT.test(doc.filename) || VIDEO_EXT.test(doc.url)
      ? <video src={doc.url} controls className="h-full max-w-full" />
      : IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url)
      ? <img src={doc.url} alt={docDisplayLabel(doc)} className="h-full max-w-full object-contain" />
      : <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-2">
          <FileText size={54} strokeWidth={1.3} />
          <span className="text-[13px] font-semibold">Documento PDF</span>
        </div>
  );

  const botoesDoc = (doc: typeof docsOrdenados[number]) => (
    <>
      <a href={doc.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-canvas">
        <Eye size={16} /> Visualizar
      </a>
      <ViewerBtn onClick={() => baixarDocumento(doc)} disabled={baixandoDoc === doc.id}>
        {baixandoDoc === doc.id
          ? <><Loader2 size={15} className="animate-spin" /> Baixando</>
          : <><Download size={16} /> Baixar</>}
      </ViewerBtn>
    </>
  );

  const endereco = partesEndereco(lead.endereco, lead.cep);
  const bairroEndereco = endereco.find(([k]) => k === 'Bairro')?.[1];

  // Linhas do popover "Copiar dados" (cada uma copia sozinha; "Copiar tudo" junta).
  const localTrabalho = [lead.nomeEmpresa, lead.enderecoTrabalho || lead.bairroTrabalho].filter(Boolean).join(' — ');
  const linhasCopiar = [
    `Nome completo: ${lead.nome}`,
    `Cidade: ${lead.cidade}`,
    `Bairro: ${bairroEndereco || lead.bairroTrabalho || '—'}`,
    `Local de trabalho: ${localTrabalho || '—'}`,
    `Deve a alguém? ${lead.deveAlguem || ''}`.trim(),
  ];
  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      notify('Copiado.', 'success');
    } catch {
      notify('Não foi possível copiar.', 'error');
    }
  };

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
      {/* Visualização do cliente — oculta enquanto um modal de ação está aberto. */}
      {!algumModal && (
      <div className="flex max-h-[95vh] w-[min(1120px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        {/* Cabeçalho escuro: logo + título + fechar */}
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#111214] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <p className="text-[17px] font-extrabold tracking-tight text-white">
              <span className="text-[#F6C700]">SP</span> EMPRÉSTIMOS
            </p>
            <span className="h-5 w-px bg-white/25" />
            <p className="text-[13.5px] text-white/80">Visualização do cliente</p>
          </div>
          <button onClick={onClose} title="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 cursor-pointer">
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto bg-canvas p-3 lg:grid-cols-[390px_1fr]">
          {/* ───── Coluna esquerda ───── */}
          <div className="space-y-3">
            <div className="rounded-xl border border-line bg-surface p-3.5">
              {/* Foto + nome + WhatsApp */}
              <div className="flex items-center gap-3">
                <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-[22px] font-bold text-white ${avatarColor(lead.nome)}`}>
                  {initials(lead.nome)}
                  {photoUrl && (
                    <img src={photoUrl} alt={lead.nome} loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => e.currentTarget.remove()} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[20px] font-extrabold leading-tight text-ink [overflow-wrap:anywhere]">{lead.nome}</p>
                  {isInternalStatus(lead.status) ? (
                    <p className="mt-1 text-[14px] font-semibold text-ink-2">{lead.telefone}</p>
                  ) : (
                    <button onClick={() => onWhatsApp(lead)} title="Enviar WhatsApp"
                      className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-ink-2 hover:underline cursor-pointer">
                      <MessageCircle size={16} className="text-[#25D366]" /> {lead.telefone}
                    </button>
                  )}
                </div>
              </div>

              {/* Categoria • situação • data */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink" title={perfilLabel(lead.perfil)}>
                  <Briefcase size={15} className="text-ink-2" /> {perfilCurto(lead.perfil)}
                </span>
                <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide ${statusPill(lead.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> {statusPillLabel(lead.status)}
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] leading-tight text-subtle">
                  <Calendar size={15} className="text-ink-2" />
                  <span>{dateChipLabel(lead.status)}<br />{formatDateTime(lead.status === 'PENDENTE' ? lead.createdAt : lead.updatedAt)}</span>
                </span>
              </div>
            </div>

            {/* Cartão escuro: valor + total + condições */}
            <div className="rounded-xl bg-[#18191c] p-3.5 text-white shadow-md ring-1 ring-white/10">
              <div className="flex items-stretch">
                <div className="flex-1">
                  <p className="text-[12.5px] text-white/70">{lead.valorAprovado != null ? 'Valor aprovado' : 'Valor solicitado'}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[22px] font-extrabold">
                    {formatCurrency(lead.valorAprovado ?? lead.valorSolicitado)}
                    <button onClick={() => setAprovando(true)} title="Editar valor aprovado"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F6C700] text-[#111] transition-transform hover:scale-110 cursor-pointer">
                      <Pencil size={12} strokeWidth={2.6} />
                    </button>
                  </p>
                </div>
                <span className="mx-3 w-px bg-white/15" />
                <div className="flex-1">
                  <p className="text-[12.5px] text-white/70">Total a pagar</p>
                  <p className="mt-0.5 text-[22px] font-extrabold">{formatCurrency(lead.valorTotal)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-white/15 pt-2.5 text-[12px] text-white/75">
                <CreditCard size={14} />
                <span>{modalidadeTexto(lead)}</span>
                <span className="text-white/40">•</span>
                <span>Taxa: {lead.taxaJuros}%</span>
                <span className="text-white/40">•</span>
                <span>Prazo: {lead.prazo} dias</span>
              </div>
            </div>

            {/* Dados do cliente */}
            <div className="relative rounded-xl border border-line bg-surface p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-bold text-ink">
                  <UserRound size={17} /> Dados do cliente
                </p>
                <button onClick={() => setCopiarAberto((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-[12px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer">
                  <Copy size={13} /> Copiar
                </button>
              </div>

              {copiarAberto && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setCopiarAberto(false)} />
                  <div className="absolute left-[55%] top-2 z-30 w-[min(300px,80vw)] rounded-xl border border-line bg-surface p-3.5 shadow-2xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[15px] font-bold text-ink">Copiar dados</p>
                      <button onClick={() => setCopiarAberto(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-canvas cursor-pointer">
                        <X size={16} className="text-subtle" />
                      </button>
                    </div>
                    {linhasCopiar.map((l) => (
                      <button key={l} onClick={() => copiar(l)} title="Copiar esta linha"
                        className="block w-full rounded-lg px-1.5 py-2 text-left text-[13px] text-ink-2 hover:bg-canvas cursor-pointer">
                        {l}
                      </button>
                    ))}
                    <button onClick={() => { copiar(linhasCopiar.join('\n')); setCopiarAberto(false); }}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#111214] py-2 text-[12.5px] font-semibold text-white hover:brightness-125 cursor-pointer">
                      <Copy size={13} /> Copiar tudo
                    </button>
                  </div>
                </>
              )}

              <div className="divide-y divide-line">
                <DadoRow label="Renda mensal" value={formatMoney(lead.renda)} />
                {lead.valorAprovado != null && lead.valorAprovado !== lead.valorSolicitado && (
                  <DadoRow label="Valor solicitado" value={formatCurrency(lead.valorSolicitado)} />
                )}
                <DadoRow label={campos.empresa} value={lead.nomeEmpresa || '—'} />
                <DadoRow label={campos.local} value={lead.enderecoTrabalho || lead.bairroTrabalho || '—'} />
                {isServidor && (
                  <>
                    <DadoRow label="Vínculo" value={vinculoServidorLabel} />
                    <DadoRow label={matriculaCargoLabel} value={lead.matriculaCargo || '—'} />
                  </>
                )}
                {isMotorista && (
                  <>
                    <DadoRow label="Veículo" value={veiculoProprioLabel} />
                    <DadoRow label="Placa do veículo" value={lead.placaVeiculo || '—'} />
                  </>
                )}
                <DadoRow label="Cidade / Estado" value={lead.cidade} />
              </div>

              <div className="mt-3 space-y-2.5 border-t border-line pt-3">
                <IconRow icon={<InstagramIcon />} label="Instagram do cliente"
                  value={lead.instagram
                    ? <a href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace(/^@/, '')}`}
                        target="_blank" rel="noopener noreferrer" className="hover:underline">{lead.instagram}</a>
                    : '—'} />
                <IconRow icon={<MessageSquare size={18} className="text-ink-2" />} label="Como conheceu a SP"
                  value={lead.indicacao || origemOf(lead)} />
                <IconRow icon={<FileText size={18} className="text-ink-2" />} label="Observação do cliente"
                  value={observacaoCliente || <span className="font-normal text-subtle">Sem observações.</span>} />
              </div>
            </div>

            {/* Dados da recusa (só em recusados) */}
            {lead.status === 'RECUSADO' && <RecusaEditor lead={lead} onUpdateGroups={onUpdateGroups} />}

            {/* Histórico de mensagens */}
            {logs.length > 0 && (
              <details className="rounded-xl border border-line bg-surface p-3.5">
                <summary className="cursor-pointer text-[13px] font-bold text-ink-2">Mensagens enviadas ({logs.length})</summary>
                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-lg bg-canvas p-2.5">
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
              </details>
            )}
          </div>

          {/* ───── Coluna direita ───── */}
          <div className="min-w-0 space-y-3">
            {/* Documentos: abas + visualizador */}
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <p className="mb-2 flex items-center gap-2 text-[15px] font-bold text-ink">
                <FileText size={17} /> Documentos
              </p>
              <div className="grid grid-cols-4 border-b border-line">
                {DOC_TABS.map((t) => {
                  const idx = paginas.findIndex((p) => docGrupo(p[0]) === t.key);
                  const ativa = docAtual ? docGrupo(docAtual) === t.key : false;
                  return (
                    <button key={t.key} onClick={() => idx >= 0 && setDocIdx(idx)} disabled={idx < 0}
                      className={`-mb-px flex items-center justify-center gap-1.5 border-b-[3px] py-2 text-[13px] transition-colors
                        ${ativa ? 'border-[#F6C700] font-bold text-ink' : 'border-transparent text-muted hover:text-ink-2'}
                        ${idx < 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
                      {t.icon} {t.label}
                    </button>
                  );
                })}
              </div>

              {pagina && docAtual ? (
                <>
                  {pagina.length > 1 ? (
                    // Frente e verso lado a lado, cada um com seus botões.
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {pagina.map((doc) => (
                        <div key={doc.id} className="min-w-0">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" title={docDisplayLabel(doc)}
                            className="flex h-[240px] items-center justify-center overflow-hidden rounded-xl bg-canvas">
                            {renderMidia(doc)}
                          </a>
                          <p className="mt-2 truncate text-center text-[12.5px] font-semibold text-muted">{docDisplayLabel(doc)}</p>
                          <div className="mt-1.5 flex justify-center gap-2">{botoesDoc(doc)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <a href={docAtual.url} target="_blank" rel="noopener noreferrer" title={docDisplayLabel(docAtual)}
                        className="mt-3 flex h-[240px] items-center justify-center overflow-hidden rounded-xl bg-canvas">
                        {renderMidia(docAtual)}
                      </a>
                      <p className="mt-2 truncate text-center text-[12.5px] font-semibold text-muted">{docDisplayLabel(docAtual)}</p>
                    </>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ViewerBtn onClick={() => setDocIdx((i) => Math.max(0, i - 1))} disabled={docIdx === 0}>
                      <ChevronLeft size={16} /> Anterior
                    </ViewerBtn>
                    <span className="px-2 text-[12.5px] text-subtle">{Math.min(docIdx, paginas.length - 1) + 1} de {paginas.length}</span>
                    <ViewerBtn onClick={() => setDocIdx((i) => Math.min(paginas.length - 1, i + 1))} disabled={docIdx >= paginas.length - 1}>
                      Próximo <ChevronRight size={16} />
                    </ViewerBtn>
                    <span className="flex-1" />
                    {pagina.length === 1 && botoesDoc(docAtual)}
                  </div>
                </>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-subtle">
                  Nenhum documento enviado.
                </p>
              )}
            </div>

            {/* Bem em garantia (só para quem ofereceu) */}
            {temGarantia && (
              <div className="space-y-2.5">
                <GarantiaBar icon={<Shield size={16} className="text-amber-600" />}
                  title="Informações do bem como garantia" onClick={() => setModalBem('info')} />
                <GarantiaBar icon={<Camera size={16} className="text-purple-500" />}
                  title="Fotos e vídeo do bem como garantia" count={bemDocs.length} onClick={() => setModalBem('midia')} />
              </div>
            )}

            {/* Localização */}
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <p className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-ink">
                <MapPin size={17} /> {hasLocation ? 'Localização recebida' : 'Localização'}
                {hasLocation && <span className="h-2 w-2 rounded-full bg-success" />}
              </p>
              {hasLocation ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.15fr]">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="h-36 overflow-hidden rounded-xl border border-line">
                    <iframe title="Localização da solicitação" loading="lazy"
                      className="pointer-events-none h-full w-full border-0"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${lead.latitude},${lead.longitude}&z=15&output=embed`} />
                  </a>
                  <div className="flex flex-col">
                    <div className="divide-y divide-line rounded-xl border border-line text-[12.5px]">
                      {endereco.map(([k, v]) => (
                        <div key={k} className="flex gap-3 px-3 py-1.5">
                          <span className="w-20 shrink-0 text-subtle">{k}:</span>
                          <span className="font-semibold text-ink [overflow-wrap:anywhere]">{v}</span>
                        </div>
                      ))}
                    </div>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 self-end rounded-lg border border-[#F6C700] bg-[#F6C700]/10 px-3 py-1.5 text-[12px] font-semibold text-[#9a7a00] underline transition-colors hover:bg-[#F6C700]/20 dark:text-[#F6C700]">
                      <MapIcon size={14} /> Abrir no mapa
                    </a>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-line py-8 text-center text-[12.5px] text-subtle">
                  O cliente não compartilhou a localização.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Barra de ações */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-surface px-3 py-2.5">
          <FooterBtn className="bg-[#111214] text-white hover:brightness-125" onClick={() => setAprovando(true)}>
            <Check size={18} strokeWidth={2.6} /> Aprovar
          </FooterBtn>
          <FooterBtn className="border border-line text-ink hover:bg-canvas" onClick={() => setRecusando(true)}>
            <X size={18} /> Recusar
          </FooterBtn>
          <FooterBtn className="bg-slate-500 text-white hover:brightness-110" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
            {downloading ? 'Gerando...' : 'Backup'}
          </FooterBtn>
          <FooterBtn className="bg-slate-700 text-white hover:brightness-125" onClick={() => setCobrancaFacil(true)}>
            <Send size={17} /> Enviar ao Cobra Fácil
          </FooterBtn>

          <div className="relative">
            <FooterBtn className="border border-line bg-canvas text-ink hover:bg-line/60" onClick={() => setMenuMais((v) => !v)}>
              <MoreHorizontal size={18} /> Mais opções
              <ChevronDown size={16} className={`transition-transform ${menuMais ? 'rotate-180' : ''}`} />
            </FooterBtn>
            {menuMais && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuMais(false)} />
                <div className="absolute bottom-[calc(100%+8px)] right-0 z-30 w-[300px] space-y-1.5 rounded-xl border border-line bg-surface p-2.5 shadow-2xl">
                  <MaisAcaoRow icon={<Send size={17} />} label="Enviar status" descricao="Atualizar o cliente pelo WhatsApp"
                    onClick={isInternalStatus(lead.status) ? undefined : () => { setMenuMais(false); setEnviandoStatus(true); }} />
                  <MaisAcaoRow icon={<FolderInput size={17} />} label="Mover para a categoria" descricao="Trocar a situação do cliente"
                    onClick={() => { setMenuMais(false); setMoverCategoria(true); }} />
                  <MaisAcaoRow icon={<Users size={17} />} label="Enviar para o grupo" descricao="Compartilhar no grupo de análise"
                    onClick={() => { setMenuMais(false); setEnviandoGrupo(true); }} />
                  <MaisAcaoRow icon={<Shield size={17} />} label="Evitar golpes" ativo={lead.evitarGolpes} tint="purple"
                    onClick={() => onUpdateGroups(lead.id, { evitarGolpes: !lead.evitarGolpes })} />
                  <MaisAcaoRow icon={<Users size={17} />} label="Análise de clientes" ativo={lead.analiseCliente} tint="orange"
                    onClick={() => onUpdateGroups(lead.id, { analiseCliente: !lead.analiseCliente })} />
                </div>
              </>
            )}
          </div>

          <FooterBtn className="ml-auto border border-line text-ink hover:border-danger hover:text-danger" onClick={() => onDelete(lead.id)}>
            <Trash2 size={17} /> Excluir
          </FooterBtn>
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

/** Rótulo curto da categoria (chip ao lado da situação). */
const PERFIL_CURTO: Record<string, string> = {
  CARTEIRA_ASSINADA: 'CLT', CLT_SEM_REGISTRO: 'Informal', AUTONOMO: 'Autônomo',
  MOTORISTA_APP: 'Motorista de app', TRABALHO_JOB: 'Job (GP)', BENEFICIARIO: 'Beneficiário',
  ESTAGIARIO: 'Estagiário', SERVIDOR_PUBLICO: 'Servidor público', RECEBE_SEGURO: 'Recebe seguro',
  COM_GARANTIA: 'Com garantia', SEM_COMPROVACAO: 'Sem comprovação',
};
function perfilCurto(perfil: string): string {
  return PERFIL_CURTO[perfil] ?? perfilLabel(perfil);
}

/** Pílula da situação (fundo claro + texto da cor do status). */
function statusPill(status: string): string {
  switch (status) {
    case 'APROVADO': return 'bg-success/15 text-success';
    case 'RECUSADO': return 'bg-danger/15 text-danger';
    case 'PENDENTE': return 'bg-[#F6C700]/20 text-[#8a6d00] dark:text-[#F6C700]';
    default: return 'bg-info/15 text-info';
  }
}

/** Texto da pílula de situação (singular; a lista usa o nome da aba). */
function statusPillLabel(status: string): string {
  switch (status) {
    case 'PENDENTE': return 'Em análise';
    case 'APROVADO': return 'Aprovado';
    case 'RECUSADO': return 'Recusado';
    default: return statusLabel(status);
  }
}

/** "À vista" / "Parcelado (3x)" — a modalidade aprovada tem prioridade sobre a pedida. */
function modalidadeTexto(lead: Lead): string {
  if (lead.modalidadeAprovada === 'AVISTA') return 'À vista';
  if (lead.modalidadeAprovada === 'PARCELADO' || lead.parcelas > 1) return `Parcelado (${lead.parcelas}x)`;
  return 'À vista';
}

/** Abas do visualizador de documentos. */
type DocGrupo = 'documento' | 'rosto' | 'trabalho' | 'casa';
const DOC_TABS: { key: DocGrupo; label: string; icon: ReactNode }[] = [
  { key: 'documento', label: 'Documento', icon: <FileText size={16} /> },
  { key: 'rosto', label: 'Rosto', icon: <UserRound size={16} /> },
  { key: 'trabalho', label: 'Trabalho', icon: <Briefcase size={16} /> },
  { key: 'casa', label: 'Casa', icon: <House size={16} /> },
];
function docGrupo(doc: { tipo: string; filename: string }): DocGrupo {
  const l = docLabel(doc);
  if (/selfie|rosto/i.test(l)) return 'rosto';
  if (/\b(rg|cnh)\b|identidade|identifica/i.test(l)) return 'documento';
  if (/resid/i.test(l)) return 'casa';
  return 'trabalho';
}

/**
 * Quebra o endereço do app ("Rua, nº, Bairro, Cidade - UF") em linhas.
 * Formato diferente: mostra o texto inteiro numa linha só.
 */
function partesEndereco(endereco: string | null, cep: string | null): [string, string][] {
  const linhas: [string, string][] = [];
  const partes = (endereco || '').split(',').map((p) => p.trim()).filter(Boolean);
  const ultima = partes[partes.length - 1] || '';
  if (partes.length >= 3 && ultima.includes(' - ')) {
    const [cidade, uf] = ultima.split(' - ');
    linhas.push(['Rua', partes.slice(0, -2).join(', ')]);
    linhas.push(['Bairro', partes[partes.length - 2]]);
    linhas.push(['Cidade / UF', `${cidade} / ${ufSigla(uf)}`]);
  } else if (endereco) {
    linhas.push(['Endereço', endereco]);
  }
  if (cep) linhas.push(['CEP', cep]);
  if (linhas.length === 0) linhas.push(['Endereço', '—']);
  return linhas;
}

const UFS: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapá: 'AP', amazonas: 'AM', bahia: 'BA', ceará: 'CE', 'distrito federal': 'DF',
  'espírito santo': 'ES', goiás: 'GO', maranhão: 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
  'minas gerais': 'MG', pará: 'PA', paraíba: 'PB', paraná: 'PR', pernambuco: 'PE', piauí: 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondônia: 'RO',
  roraima: 'RR', 'santa catarina': 'SC', 'são paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};
/** "Bahia" → "BA" (o geocoder devolve o nome do estado). */
function ufSigla(uf: string): string {
  return UFS[uf.trim().toLowerCase()] ?? uf.trim();
}

/** Linha "rótulo à esquerda, valor à direita" de "Dados do cliente". */
function DadoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

/** Linha com ícone à esquerda (Instagram, origem, observação). */
function IconRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[22px_150px_1fr] items-start gap-2 text-[13px]">
      <span className="mt-0.5">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

/** Ícone do Instagram (o lucide desta versão não tem). */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="#e1306c" />
    </svg>
  );
}

/** Botão do visualizador de documentos (Anterior / Próximo / Baixar). */
function ViewerBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-canvas cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}

/** Botão da barra de ações do rodapé. */
function FooterBtn({ children, className, onClick, disabled }: {
  children: ReactNode; className: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13.5px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>
      {children}
    </button>
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
