import { Award, BadgeCheck, MapPin, Users } from 'lucide-react';
import { Summary, formatPercent } from '../../utils/analytics';

interface PeriodSummaryProps {
  summary: Summary;
  periodLabel: string;
}

interface Tile {
  title: string;
  value: string;
  caption: string;
  icon: typeof Award;
  big?: boolean;
}

export default function PeriodSummary({ summary, periodLabel }: PeriodSummaryProps) {
  const { topCidade, topOrigem } = summary;

  const tiles: Tile[] = [
    {
      title: 'Taxa de aprovação',
      value: formatPercent(summary.taxaAprovacao),
      caption: `${summary.aprovados} de ${summary.totalClientes} clientes`,
      icon: BadgeCheck,
    },
    {
      title: 'Taxa de contratação',
      value: summary.decididos ? formatPercent(summary.taxaContratacao) : '—',
      caption: summary.decididos
        ? `${summary.contratados} de ${summary.decididos} aprovados`
        : 'Sem aprovados com desfecho',
      icon: Users,
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
      <h2 className="mb-3 text-[14px] font-bold text-ink">
        Resumo do período <span className="font-medium text-subtle">({periodLabel})</span>
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
