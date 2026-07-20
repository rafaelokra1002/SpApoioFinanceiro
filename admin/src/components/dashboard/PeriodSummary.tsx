import { Award, BadgeCheck, MapPin, X } from 'lucide-react';
import { Summary, formatPercent, fullMonthLabel } from '../../utils/analytics';

interface PeriodSummaryProps {
  summary: Summary;
  /** '' = todos os meses; senão 'YYYY-MM'. */
  month: string;
  monthOptions: string[];
  onMonthChange: (month: string) => void;
}

interface Tile {
  title: string;
  value: string;
  caption: string;
  icon: typeof Award;
  big?: boolean;
}

export default function PeriodSummary({ summary, month, monthOptions, onMonthChange }: PeriodSummaryProps) {
  const { topCidade, topOrigem } = summary;

  const tiles: Tile[] = [
    {
      title: 'Taxa de aprovação',
      value: formatPercent(summary.taxaAprovacao),
      caption: `${summary.aprovados} de ${summary.totalClientes} clientes`,
      icon: BadgeCheck,
    },
    {
      title: 'Cidade com mais aprovados',
      value: topCidade?.label ?? '—',
      caption: topCidade
        ? `${topCidade.count} clientes (${Math.round(topCidade.pct)}%)`
        : 'Sem aprovados no período',
      icon: MapPin,
      big: true,
    },
    {
      title: 'Principal origem dos clientes',
      value: topOrigem?.label ?? '—',
      caption: topOrigem
        ? `${topOrigem.count} clientes (${Math.round(topOrigem.pct)}%)`
        : 'Sem dados no período',
      icon: Award,
      big: true,
    },
  ];

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[14px] font-bold text-ink">
          Resumo do período{' '}
          <span className="font-medium text-subtle">
            ({month ? fullMonthLabel(month) : 'Todo o período'})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {month && (
            <button
              onClick={() => onMonthChange('')}
              className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px]
                font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
            >
              <X size={13} strokeWidth={2.2} />
              Limpar filtros
            </button>
          )}
          <select
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px]
              font-medium text-ink-2 focus:border-brand focus:outline-none"
          >
            <option value="">Todos os meses</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{fullMonthLabel(m)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.title}
              className="flex flex-col items-center rounded-xl border border-line bg-canvas/60 px-3 py-4 text-center"
            >
              <p className="text-[11.5px] font-medium text-muted">{tile.title}</p>
              <p
                className={`mt-1.5 font-bold text-ink ${tile.big ? 'text-[16px] leading-snug' : 'text-[22px]'}`}
                title={tile.value}
              >
                {tile.value}
              </p>
              <p className="mt-1 text-[10.5px] text-subtle">{tile.caption}</p>
              <span className="mt-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                <Icon size={16} className="text-brand-deep" />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
