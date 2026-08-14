import { useEffect, useMemo, useState, ReactNode } from 'react';
import {
  Calculator, Check, CheckCircle2, ChevronDown, Copy, CreditCard, DollarSign, Eye,
  FolderInput, Info, MessageCircle, MessageSquareText, Pencil, Phone, RefreshCw,
  UserRound, Wallet, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade } from '../../utils/analytics';
import { METRICS, STATUS_ORDER } from '../../constants/status';
import { getAprovacaoTemplate, renderAprovacaoTemplate, type ModalidadeAprovacao } from '../../utils/localTemplates';
import { abrirWhatsApp } from '../../utils/whatsapp';
import { avatarColor, clientPhotoUrl, initials } from '../../utils/avatar';
import { notify } from '../Notice';

interface Opcao {
  titulo: string;
  modalidade: 'PARCELADO' | 'AVISTA';
  /** Qual mensagem para o cliente esta opção usa (ver localTemplates). */
  tpl: ModalidadeAprovacao;
  icon: ReactNode;
  /** Opção 3 (pediu parcelado, aprovado à vista) tem destaque laranja. */
  destaque?: 'orange';
}

const OPCOES: Opcao[] = [
  { titulo: 'Aprovar na modalidade parcelada', modalidade: 'PARCELADO', tpl: 'PARCELADO', icon: <CreditCard size={17} /> },
  { titulo: 'Aprovar na modalidade à vista', modalidade: 'AVISTA', tpl: 'AVISTA', icon: <Wallet size={17} /> },
  { titulo: 'Cliente pediu parcelado, mas será aprovado à vista', modalidade: 'AVISTA', tpl: 'AVISTA_DE_PARCELADO', icon: <RefreshCw size={17} />, destaque: 'orange' },
];

const PARCELAS_OPCOES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface AprovarModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: (data: { valorAprovado: number; valorTotal: number; modalidadeAprovada: 'PARCELADO' | 'AVISTA' }) => void;
  /** Opcional: "Mover para a categoria" (troca de status) direto do modal. */
  onStatusChange?: (status: string) => void;
}

/** Valor em reais como texto pt-BR sem símbolo (ex.: 600 → "600,00"). */
function reaisText(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Mensagem pronta para o cliente (WhatsApp), a partir do template editável
 * em Edição de Mensagens e dos valores escolhidos aqui no modal.
 */
function montarMensagem(
  nome: string, valor: number, total: number, tpl: ModalidadeAprovacao,
  numParcelas: number, valorParcela: number,
): string {
  const parcelado = tpl === 'PARCELADO';
  return renderAprovacaoTemplate(getAprovacaoTemplate(tpl), {
    nome,
    valor: formatCurrency(valor),
    total: formatCurrency(total),
    modalidade: parcelado ? 'Parcelado' : 'À vista',
    parcelas: parcelado ? `${numParcelas}x de ${formatCurrency(valorParcela)}` : 'à vista',
  });
}

export default function AprovarModal({ lead, onClose, onConfirm, onStatusChange }: AprovarModalProps) {
  const [centavos, setCentavos] = useState(() => Math.round(lead.valorSolicitado * 100));
  const [opcaoIdx, setOpcaoIdx] = useState(() => (modalidade(lead.parcelas) === 'À vista' ? 1 : 0));
  const [numParcelas, setNumParcelas] = useState(2);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const valorAprovado = centavos / 100;
  const opcao = OPCOES[opcaoIdx];
  const parcelado = opcao.modalidade === 'PARCELADO';
  const parcelas = parcelado ? numParcelas : 1;
  // Juros pela Tabela Price (mesmo cálculo do app): parcela fixa; n=1 = à vista.
  //   parcela = valor * i / (1 - (1 + i)^-n)   e   total = parcela * n
  const taxa = lead.taxaJuros || 30;
  const i = taxa / 100;
  const parcelaExata = valorAprovado > 0 ? (valorAprovado * i) / (1 - Math.pow(1 + i, -parcelas)) : 0;
  const valorParcela = Math.round(parcelaExata * 100) / 100;
  const totalReceber = Math.round(valorParcela * parcelas * 100) / 100;
  const photoUrl = clientPhotoUrl(lead.documentos);

  const onValorChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setCentavos(digits ? Number(digits) : 0);
  };

  const mensagemDoCliente = useMemo(
    () => montarMensagem(lead.nome, valorAprovado, totalReceber, opcao.tpl, parcelas, valorParcela),
    [lead.nome, valorAprovado, totalReceber, opcao.tpl, parcelas, valorParcela],
  );

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagemDoCliente);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      notify('Não foi possível copiar a mensagem.', 'error');
    }
  };

  const confirmar = () => {
    if (valorAprovado <= 0) return;
    onConfirm({ valorAprovado, valorTotal: totalReceber, modalidadeAprovada: opcao.modalidade });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Moldura com borda em gradiente verde. */}
      <div className="relative z-10 rounded-[26px] bg-gradient-to-br from-emerald-500 to-teal-600 p-[3px] shadow-2xl">
        <div className="flex max-h-[94vh] w-[min(1000px,94vw)] flex-col overflow-hidden rounded-3xl bg-canvas">
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <h3 className="text-[18px] font-extrabold leading-tight text-ink">Aprovação</h3>
                <p className="text-[12px] text-subtle">Análise pendente de aprovação</p>
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-muted"><UserRound size={17} /></span>
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

            {/* Modalidade de aprovação */}
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <UserRound size={16} className="text-ink" /> Modalidade de aprovação
              </p>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                {OPCOES.map((o, idx) => {
                  const ativo = idx === opcaoIdx;
                  const laranja = o.destaque === 'orange';
                  return (
                    <button key={o.titulo} onClick={() => setOpcaoIdx(idx)}
                      className={`flex flex-col gap-1.5 rounded-xl border p-2.5 text-left transition-colors cursor-pointer
                        ${laranja ? 'bg-orange/5' : 'bg-surface'}
                        ${ativo
                          ? (laranja ? 'border-orange' : 'border-brand')
                          : (laranja ? 'border-orange/30' : 'border-line hover:bg-canvas')}`}>
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                          ${ativo ? (laranja ? 'border-orange' : 'border-brand') : 'border-subtle/50'}`}>
                          {ativo && <span className={`h-2.5 w-2.5 rounded-full ${laranja ? 'bg-orange' : 'bg-brand'}`} />}
                        </span>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                          ${laranja ? 'bg-orange/10 text-orange' : 'bg-brand/10 text-brand-deep'}`}>{o.icon}</span>
                        <span className="text-[13px] font-bold leading-snug text-ink">{o.titulo}</span>
                      </div>

                      {idx === 0 && ativo && (
                        <div onClick={(e) => e.stopPropagation()} className="mt-1 border-t border-line pt-2">
                          <label className="text-[11.5px] text-muted">Número de parcelas a aprovar</label>
                          <div className="relative mt-1">
                            <select value={numParcelas} onChange={(e) => setNumParcelas(Number(e.target.value))}
                              className="w-full cursor-pointer appearance-none rounded-lg border border-line bg-canvas px-3 py-2 pr-8 text-[13px] font-semibold text-ink focus:border-brand focus:outline-none">
                              {PARCELAS_OPCOES.map((n) => <option key={n} value={n}>{n} {n === 1 ? 'parcela' : 'parcelas'}</option>)}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Valor aprovado + parcelamento estimado */}
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded-2xl border border-line bg-surface p-3">
                <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success"><DollarSign size={16} /></span>
                  Valor aprovado
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/5 px-3 py-2">
                  <span className="text-[14px] font-semibold text-success">R$</span>
                  <input value={reaisText(valorAprovado)} onChange={(e) => onValorChange(e.target.value)} inputMode="numeric"
                    className="w-full bg-transparent text-[19px] font-bold text-success focus:outline-none" />
                  <Pencil size={16} className="shrink-0 text-success/70" />
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-3">
                <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info"><Calculator size={16} /></span>
                  Parcelamento estimado
                  <Info size={14} className="text-subtle" />
                </p>
                <div className="grid grid-cols-3 divide-x divide-line">
                  <div className="pr-3">
                    <p className="text-[11px] text-muted">Valor total a receber</p>
                    <p className="text-[16px] font-bold text-info">{formatCurrency(totalReceber)}</p>
                    <p className="text-[10.5px] text-subtle">Soma das parcelas</p>
                  </div>
                  <div className="px-3">
                    <p className="text-[11px] text-muted">Quantidade de parcelas</p>
                    <p className="text-[16px] font-bold text-info">{parcelas}x</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[11px] text-muted">Valor de cada parcela</p>
                    <p className="text-[16px] font-bold text-info">{formatCurrency(valorParcela)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagem para o cliente */}
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
                <MessageSquareText size={16} className="text-info" /> Mensagem para o cliente
              </p>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-line bg-canvas/40 p-3">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{mensagemDoCliente}</p>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
                <button onClick={copiarMensagem} disabled={valorAprovado <= 0}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                  {copiado ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  {copiado ? 'Copiado' : 'Copiar mensagem'}
                </button>
                <button onClick={() => abrirWhatsApp(lead.telefone, mensagemDoCliente)} disabled={valorAprovado <= 0}
                  className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-[12.5px] font-bold text-white transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                  <MessageCircle size={14} fill="currentColor" /> Enviar via WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé: aprovar + mover para categoria */}
          <div className="flex shrink-0 flex-col gap-2.5 border-t border-line bg-surface p-3 sm:flex-row">
            <button onClick={confirmar} disabled={valorAprovado <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-2.5 text-[15px] font-bold text-white shadow-md transition-all hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
              <CheckCircle2 size={18} /> Aprovar
            </button>
            {onStatusChange && (
              <div className="relative flex-1">
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) onStatusChange(e.target.value); }}
                  className="h-full w-full cursor-pointer appearance-none rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 pl-11 pr-10 text-[15px] font-bold text-white shadow-md focus:outline-none"
                >
                  <option value="" disabled className="bg-surface text-subtle">Mover para categoria</option>
                  {STATUS_ORDER.map((s) => <option key={s} value={s} className="bg-surface text-ink">{METRICS[s].label}</option>)}
                </select>
                <FolderInput size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white" />
                <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
