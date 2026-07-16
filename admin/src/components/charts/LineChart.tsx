import { MonthPoint } from '../../utils/analytics';
import { METRICS, MetricKey } from '../../constants/status';

export type ChartMode = 'quantidade' | 'percentual';

interface LineChartProps {
  points: MonthPoint[];
  series: MetricKey[];
  mode: ChartMode;
}

const W = 660;
const H = 220;
const M = { top: 20, right: 18, bottom: 28, left: 36 };

/** Escala "redonda" para o topo do eixo Y. */
function niceMax(max: number): number {
  if (max <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = pow / 2;
  return Math.ceil(max / step) * step;
}

export default function LineChart({ points, series, mode }: LineChartProps) {
  const percentual = mode === 'percentual';

  // Em percentual, a série "total" seria sempre 100% — não agrega nada.
  const visible = percentual ? series.filter((s) => s !== 'total') : series;

  const valueOf = (p: MonthPoint, key: MetricKey): number => {
    if (!percentual) return p.counts[key];
    return p.counts.total ? (p.counts[key] / p.counts.total) * 100 : 0;
  };

  const allValues = points.flatMap((p) => visible.map((s) => valueOf(p, s)));
  const yMax = percentual ? 100 : niceMax(Math.max(1, ...allValues));

  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const x = (i: number) =>
    M.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;

  const ticks = Array.from({ length: 6 }, (_, i) => (yMax / 5) * i);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img"
        aria-label={`Solicitações por mês em ${mode}`}>
        {/* Grade + eixo Y */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)}
              className="stroke-line" strokeWidth={1}
            />
            <text
              x={M.left - 8} y={y(t) + 3} textAnchor="end"
              className="fill-subtle" style={{ fontSize: 9.5 }}
            >
              {percentual ? `${Math.round(t)}%` : Math.round(t)}
            </text>
          </g>
        ))}

        {/* Eixo X */}
        {points.map((p, i) => (
          <text
            key={p.key} x={x(i)} y={H - 9} textAnchor="middle"
            className="fill-muted" style={{ fontSize: 9.5 }}
          >
            {p.label}
          </text>
        ))}

        {/* Séries */}
        {visible.map((key) => {
          const meta = METRICS[key];
          const coords = points.map((p, i) => [x(i), y(valueOf(p, key))] as const);
          const path = coords
            .map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
            .join(' ');

          return (
            <g key={key}>
              <path d={path} fill="none" stroke={meta.hex} strokeWidth={1.75}
                strokeLinecap="round" strokeLinejoin="round" />
              {coords.map(([px, py], i) => (
                <g key={points[i].key}>
                  <circle cx={px} cy={py} r={2.75} fill={meta.hex} />
                  <text
                    x={px} y={py - 8} textAnchor="middle"
                    fill={meta.hex} style={{ fontSize: 9, fontWeight: 600 }}
                  >
                    {percentual
                      ? `${Math.round(valueOf(points[i], key))}%`
                      : points[i].counts[key]}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
