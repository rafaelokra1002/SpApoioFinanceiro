import { METRICS, MetricKey } from '../../constants/status';

interface StatCardProps {
  metric: MetricKey;
  value: number;
  /** Quantos entraram nos últimos 7 dias. */
  week: number;
  active?: boolean;
  onClick?: () => void;
}

export default function StatCard({ metric, value, week, active, onClick }: StatCardProps) {
  const meta = METRICS[metric];
  const Icon = meta.icon;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col rounded-2xl border bg-surface p-4 text-left shadow-sm transition-all
        hover:-translate-y-0.5 hover:shadow-md cursor-pointer
        ${active ? 'border-brand ring-2 ring-brand/15' : 'border-line'}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}>
          <Icon size={17} className={meta.iconFg} strokeWidth={2.2} />
        </span>
        <span className="min-w-0 truncate text-[14px] font-semibold text-ink-2" title={meta.label}>
          {meta.label}
        </span>
      </div>

      <p className="mt-2.5 text-[26px] font-bold leading-none text-ink">{value}</p>

      <p className="mt-2 text-[12px] text-subtle">
        <span className="font-bold" style={{ color: week > 0 ? meta.hex : undefined }}>
          +{week}
        </span>{' '}
        esta semana
      </p>
    </button>
  );
}
