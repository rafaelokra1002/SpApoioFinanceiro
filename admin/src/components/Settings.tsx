import { useEffect, useState } from 'react';
import { Banknote, Check, CreditCard, Loader2, Palette, Wallet } from 'lucide-react';
import { SIDEBAR_COLORS, SidebarColorId } from '../hooks/useSidebarColor';
import { fetchModalidadePagamento, updateModalidadePagamento } from '../services/api';
import { notify } from './Notice';

interface SettingsProps {
  colorId: SidebarColorId;
  onColorChange: (id: SidebarColorId) => void;
}

type Modalidade = 'VISTA' | 'PARCELADO';

const MODALIDADES: { value: Modalidade; label: string; desc: string; icon: typeof Wallet }[] = [
  { value: 'VISTA', label: 'À vista', desc: 'O cliente simula só o pagamento à vista.', icon: Banknote },
  { value: 'PARCELADO', label: 'Parcelado', desc: 'O cliente simula só o pagamento parcelado.', icon: CreditCard },
];

export default function Settings({ colorId, onColorChange }: SettingsProps) {
  return (
    <div className="max-w-3xl space-y-5">
      <PaymentModeSection />

      <section className="rounded-2xl border border-brand/30 bg-surface p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <Palette size={19} className="text-brand-deep" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[15.5px] font-bold text-ink">Aparência</h2>
            <p className="text-[12.5px] text-muted">Cor do menu lateral do sistema</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          {SIDEBAR_COLORS.map((cor) => {
            const ativo = cor.id === colorId;
            return (
              <button
                key={cor.id}
                onClick={() => onColorChange(cor.id)}
                aria-pressed={ativo}
                className="flex w-[72px] flex-col items-center gap-1.5 cursor-pointer"
              >
                <span
                  style={{ backgroundImage: `linear-gradient(to bottom, ${cor.from}, ${cor.to})` }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform
                    ${ativo ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : 'hover:scale-105'}`}
                >
                  {ativo && <Check size={19} className="text-white" strokeWidth={3} />}
                </span>
                <span className={`text-center text-[11.5px] leading-tight
                  ${ativo ? 'font-bold text-ink' : 'text-muted'}`}>
                  {cor.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11.5px] text-subtle">
          A escolha fica salva neste navegador e vale só para você.
        </p>
      </section>
    </div>
  );
}

/**
 * Forma de pagamento oferecida no app: o campo "Como deseja pagar?" fica oculto
 * para o cliente — é o admin quem decide aqui se o app simula à vista ou parcelado.
 */
function PaymentModeSection() {
  const [modalidade, setModalidadeState] = useState<Modalidade | null>(null);
  const [salvando, setSalvando] = useState<Modalidade | null>(null);

  useEffect(() => {
    let vivo = true;
    fetchModalidadePagamento()
      .then((res) => { if (vivo && res.success) setModalidadeState(res.data.modalidade); })
      .catch(() => { if (vivo) setModalidadeState('VISTA'); });
    return () => { vivo = false; };
  }, []);

  const escolher = async (valor: Modalidade) => {
    if (valor === modalidade || salvando) return;
    setSalvando(valor);
    const anterior = modalidade;
    setModalidadeState(valor); // otimista
    const res = await updateModalidadePagamento(valor).catch(() => null);
    setSalvando(null);
    if (!res?.success) {
      setModalidadeState(anterior);
      notify('Não foi possível salvar a forma de pagamento. Tente novamente.', 'error');
    }
  };

  return (
    <section className="rounded-2xl border border-brand/30 bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Wallet size={19} className="text-brand-deep" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-[15.5px] font-bold text-ink">Forma de pagamento</h2>
          <p className="text-[12.5px] text-muted">Como o app simula o empréstimo para o cliente</p>
        </div>
      </div>

      {modalidade === null ? (
        <div className="mt-5 flex items-center gap-2 text-[13px] text-subtle">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODALIDADES.map((op) => {
            const ativo = op.value === modalidade;
            const Icon = op.icon;
            return (
              <button
                key={op.value}
                onClick={() => escolher(op.value)}
                disabled={salvando !== null}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer disabled:cursor-wait
                  ${ativo ? 'border-brand bg-brand/5' : 'border-line hover:bg-canvas/60'}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                  ${ativo ? 'bg-brand text-white' : 'bg-canvas text-muted'}`}>
                  {salvando === op.value ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} strokeWidth={2} />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
                    {op.label}
                    {ativo && <Check size={14} className="text-brand-deep" strokeWidth={3} />}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{op.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[11.5px] text-subtle">
        O campo "Como deseja pagar?" fica oculto para o cliente — o app usa direto a opção escolhida aqui.
      </p>
    </section>
  );
}
