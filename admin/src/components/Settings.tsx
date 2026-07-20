import { Check, Palette } from 'lucide-react';
import { SIDEBAR_COLORS, SidebarColorId } from '../hooks/useSidebarColor';

interface SettingsProps {
  colorId: SidebarColorId;
  onColorChange: (id: SidebarColorId) => void;
}

export default function Settings({ colorId, onColorChange }: SettingsProps) {
  return (
    <div className="max-w-3xl space-y-5">
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
