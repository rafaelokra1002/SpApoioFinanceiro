import { ReactNode } from 'react';
import { RankRow } from '../../utils/analytics';

interface RankingCardProps {
  title: string;
  hint?: string;
  /** Cabeçalho da coluna de rótulo (ex.: "Cidade", "Origem"). */
  labelHeader: string;
  valueHeader: string;
  rows: RankRow[];
  total: number;
  /** Numeração 1., 2., 3.… à esquerda (usado no ranking de cidades). */
  numbered?: boolean;
  /** Ação no canto superior direito (ex.: seletor de status). */
  action?: ReactNode;
  emptyLabel?: string;
}

export default function RankingCard({
  title, hint, labelHeader, valueHeader, rows, total,
  numbered, action, emptyLabel = 'Sem dados no período',
}: RankingCardProps) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-ink" title={hint}>{title}</h2>
        {action}
      </header>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">{emptyLabel}</p>
      ) : (
        <div className="flex flex-1 flex-col">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="pb-2 text-left text-[11px] font-semibold text-subtle" colSpan={2}>
                  {labelHeader}
                </th>
                <th className="pb-2 text-right text-[11px] font-semibold text-subtle">{valueHeader}</th>
                <th className="w-12 pb-2 text-right text-[11px] font-semibold text-subtle">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  {numbered ? (
                    <td className="w-6 py-3 align-middle text-[13px] text-subtle">{i + 1}</td>
                  ) : (
                    <td className="w-6 py-3" />
                  )}
                  <td className="py-3 pr-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-2"
                        title={row.label}>
                        {row.label}
                      </span>
                      <span className="hidden h-2 w-[38%] shrink-0 overflow-hidden rounded-full bg-line sm:block">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${(row.count / max) * 100}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-[13px] font-semibold text-ink">{row.count}</td>
                  <td className="py-3 text-right text-[13px] text-muted">{Math.round(row.pct)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[13px] font-bold text-ink">
            <span>Total</span>
            <span className="flex gap-6">
              <span>{total}</span>
              <span className="w-12 text-right">100%</span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
