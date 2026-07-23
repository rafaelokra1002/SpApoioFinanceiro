import { ArrowUp } from 'lucide-react';
import { METRICS, MetricKey } from '../../constants/status';
import Sparkline from '../charts/Sparkline';

interface StatCardProps {
  metric: MetricKey;
  value: number;
  /** Quantos entraram nos últimos 7 dias (usado quando não há filtro de mês). */
  week: number;
  /** Se informado, substitui a linha "+N esta semana" (ex.: mês filtrado). */
  caption?: string;
  /** Série mensal da métrica, desenhada como mini-gráfico no canto do card. */
  trend?: number[];
  active?: boolean;
  onClick?: () => void;
}

export default function StatCard({ metric, value, week, caption, trend, active, onClick }: StatCardProps) {
  const meta = METRICS[metric];
  const Icon = meta.icon;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col rounded-2xl border bg-surface p-4 text-left shadow-sm transition-all
        hover:-translate-y-0.5 hover:shadow-md cursor-pointer
        ${active ? 'border-brand ring-2 ring-brand/15' : 'border-line'}`}
    >
      {/* Ícone à esquerda; rótulo e número empilhados ao lado. */}
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
          <Icon size={19} className={meta.iconFg} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-ink-2" title={meta.label}>{meta.label}</p>
          <p className="text-[28px] font-bold leading-tight text-ink">{value}</p>
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        {caption ? (
          <p className="min-w-0 truncate text-[12px] text-subtle">{caption}</p>
        ) : (
          <p className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] text-subtle">
            {week > 0 && <ArrowUp size={12} strokeWidth={2.6} style={{ color: meta.hex }} />}
            <span className="font-bold" style={{ color: week > 0 ? meta.hex : undefined }}>{week}</span>
            esta semana
          </p>
        )}

        <div className="flex min-w-0 flex-1 justify-end">
          <Sparkline values={trend ?? []} color={meta.hex} area dot className="h-auto w-full max-w-[130px]" />
        </div>
      </div>
    </button>
  );
}
