import { useEffect, useMemo, useState } from 'react';
import {
  Banknote, CheckCircle2, CreditCard, MapPin, MessageCircle, UserRound, Wallet, X,
} from 'lucide-react';
import { Lead } from '../../types';
import { formatCurrency, modalidade } from '../../utils/analytics';
import Avatar from '../Avatar';

/** Nº de parcelas usado só para ilustrar a simulação no painel (não é persistido). */
const PARCELAS = 12;

interface Opcao {
  titulo: string;
  destaque: string;
  desc: string;
  modalidade: 'PARCELADO' | 'AVISTA';
}

const OPCOES: Opcao[] = [
  { titulo: 'Aprovar na modalidade', destaque: 'Parcelado', desc: 'O cliente receberá o crédito em parcelas.', modalidade: 'PARCELADO' },
  { titulo: 'Aprovar na modalidade', destaque: 'À vista', desc: 'O cliente receberá o valor total à vista.', modalidade: 'AVISTA' },
  { titulo: 'Solicitado parcelado', destaque: 'Aprovado à vista', desc: 'O cliente solicitou parcelado, mas será aprovado à vista.', modalidade: 'AVISTA' },
];

interface AprovarModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: (data: { valorAprovado: number; valorTotal: number; modalidadeAprovada: 'PARCELADO' | 'AVISTA' }) => void;
}

function formatMoney(value: string | null): string {
  const n = Number(value);
  return value && !Number.isNaN(n) ? formatCurrency(n) : '—';
}

/** Valor em reais como texto pt-BR sem símbolo (ex.: 600 → "600,00"). */
function reaisText(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AprovarModal({ lead, onClose, onConfirm }: AprovarModalProps) {
  const [centavos, setCentavos] = useState(() => Math.round(lead.valorSolicitado * 100));
  const [opcaoIdx, setOpcaoIdx] = useState(() => (modalidade(lead.prazo) === 'À vista' ? 1 : 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const taxa = lead.taxaJuros || 30;
  const valorAprovado = centavos / 100;
  const valorTotal = useMemo(() => Math.round(valorAprovado * (1 + taxa / 100) * 100) / 100, [valorAprovado, taxa]);
  const parcela = valorTotal / PARCELAS;
  const opcao = OPCOES[opcaoIdx];
  const parcelado = opcao.modalidade === 'PARCELADO';

  const onValorChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setCentavos(digits ? Number(digits) : 0);
  };

  const confirmar = () => {
    if (valorAprovado <= 0) return;
    onConfirm({ valorAprovado, valorTotal, modalidadeAprovada: opcao.modalidade });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-[min(1000px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 size={22} className="text-success" />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">Aprovar cliente</h3>
              <p className="text-[12.5px] text-muted">Defina o valor aprovado e a modalidade de crédito</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[260px_1fr]">
          {/* Coluna esquerda: identidade */}
          <div>
            <Avatar name={lead.nome} documentos={lead.documentos} rounded="rounded-2xl" className="h-40 w-full text-[40px]" />
            <p className="mt-3 text-center text-[16px] font-bold text-ink">{lead.nome}</p>
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
              <InfoRow icon={UserRound} label="Indicado por">{lead.indicacao || '—'}</InfoRow>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-5">
            {/* 1. Valor */}
            <div>
              <p className="text-[14px] font-bold text-ink">1. Valor aprovado para o cliente</p>
              <p className="mb-3 text-[12.5px] text-muted">Defina o valor que será aprovado para este cliente</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="flex-1">
                  <label className="mb-1 block text-[12px] font-medium text-muted">Valor aprovado</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                    <span className="px-3 text-[13px] font-semibold text-subtle">R$</span>
                    <input
                      value={reaisText(valorAprovado)}
                      onChange={(e) => onValorChange(e.target.value)}
                      inputMode="numeric"
                      className="w-full bg-transparent py-3 pr-3 text-[15px] font-semibold text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 sm:w-56">
                  <p className="text-[11.5px] font-medium text-muted">Total a pagar com juros</p>
                  <p className="text-[22px] font-bold leading-tight text-success">{formatCurrency(valorTotal)}</p>
                  <p className="text-[11px] text-subtle">
                    {parcelado ? `em até ${PARCELAS}x de ${formatCurrency(parcela)}` : 'pagamento à vista'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Modalidade */}
            <div>
              <p className="text-[14px] font-bold text-ink">2. Modalidade de aprovação</p>
              <p className="mb-3 text-[12.5px] text-muted">Selecione a modalidade que será aprovada para o cliente</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {OPCOES.map((o, idx) => {
                  const ativo = idx === opcaoIdx;
                  return (
                    <button
                      key={o.titulo + o.destaque}
                      onClick={() => setOpcaoIdx(idx)}
                      className={`flex flex-col rounded-xl border p-3 text-left transition-colors cursor-pointer
                        ${ativo ? 'border-success bg-success/5' : 'border-line hover:bg-canvas'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2
                          ${ativo ? 'border-success bg-success' : 'border-line'}`}>
                          {ativo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-[11.5px] text-muted">{o.titulo}</span>
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
                        {o.modalidade === 'PARCELADO' ? <CreditCard size={15} className="text-success" /> : <Banknote size={15} className="text-success" />}
                        {o.destaque}
                      </span>
                      <span className="mt-1 text-[12px] text-muted">{o.desc}</span>
                      {ativo && (
                        <span className="mt-2 inline-block w-fit rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                          Selecionado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumo */}
            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="mb-2 text-[12.5px] font-bold text-ink">Resumo da aprovação</p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                <ResumoRow label="Valor aprovado" value={formatCurrency(valorAprovado)} />
                <ResumoRow label="Total a pagar" value={formatCurrency(valorTotal)} />
                <ResumoRow label="Modalidade" value={parcelado ? 'Parcelado' : 'À vista'} />
                <ResumoRow label="Parcelas" value={parcelado ? `${PARCELAS}x de ${formatCurrency(parcela)}` : 'À vista'} />
              </div>
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
            disabled={valorAprovado <= 0}
            className="rounded-xl bg-success px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aprovar cliente
          </button>
        </div>
      </div>
    </div>
  );
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

function ResumoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-muted">{label}:</span>
      <span className="text-[13px] font-bold text-ink">{value}</span>
    </div>
  );
}
