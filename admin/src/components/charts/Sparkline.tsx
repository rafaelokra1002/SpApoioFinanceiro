import { useId } from 'react';

interface SparklineProps {
  values: number[];
  /** Cor da linha. 'currentColor' herda a cor de texto do container. */
  color?: string;
  /** Preenche a área sob a curva com um degradê da mesma cor. */
  area?: boolean;
  /** Marca o último valor com um ponto. */
  dot?: boolean;
  /** Estica para preencher o container em vez de manter a proporção. */
  stretch?: boolean;
  className?: string;
}

const W = 130;
const H = 36;
const PAD_Y = 4;

/**
 * Mini-gráfico de tendência. Suaviza a curva com quadráticas que passam pelos
 * pontos médios de cada segmento — barato e suficiente nesse tamanho.
 */
export default function Sparkline({
  values, color = 'currentColor', area, dot, stretch, className,
}: SparklineProps) {
  const gradId = useId();
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  // Sem ponto final a linha encosta nas bordas; com ponto, sobra espaço para o raio.
  const padX = dot ? 4 : 0;

  const pts = values.map((v, i) => [
    padX + (i / (values.length - 1)) * (W - padX * 2),
    PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2),
  ] as const);

  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${((cx + nx) / 2).toFixed(1)},${((cy + ny) / 2).toFixed(1)}`;
  }
  const [lastX, lastY] = pts[pts.length - 1];
  d += ` L${lastX.toFixed(1)},${lastY.toFixed(1)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={stretch ? 'none' : 'xMaxYMid meet'}
      className={className}
      aria-hidden="true"
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${d} L${lastX.toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`}
            fill={`url(#${gradId})`} stroke="none" />
        </>
      )}

      <path d={d} fill="none" stroke={color} strokeWidth={1.75}
        strokeLinecap="round" strokeLinejoin="round"
        vectorEffect={stretch ? 'non-scaling-stroke' : undefined} />

      {dot && <circle cx={lastX} cy={lastY} r={3} fill={color} />}
    </svg>
  );
}
