import { X, type LucideIcon } from 'lucide-react';

/**
 * Select compacto usado nas barras de filtro (padrão da tela de Recusados):
 * ícone à esquerda, seta própria e altura igual à do campo de busca.
 */
export function SelectButton({ icon: Icon, value, onChange, options, className = '' }: {
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface py-3 pl-10 pr-9
          text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas focus:border-brand focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Botão de limpar filtros; só aparece quando há algum filtro ativo. */
export function LimparFiltros({ show, onClick, label = 'Limpar filtros' }: {
  show: boolean;
  onClick: () => void;
  label?: string;
}) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-3
        text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
    >
      <X size={15} strokeWidth={2.2} />
      {label}
    </button>
  );
}
