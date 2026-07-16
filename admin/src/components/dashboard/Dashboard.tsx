import { useMemo, useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { Lead } from '../../types';
import { CARD_ORDER, CHART_SERIES, METRICS, MetricKey, STATUS_ORDER } from '../../constants/status';
import {
  buildSummary, countLastDays, countMetrics, currentMonth, monthSeries, origemOf, rank,
} from '../../utils/analytics';
import LineChart, { ChartMode } from '../charts/LineChart';
import StatCard from './StatCard';
import RankingCard from './RankingCard';
import PeriodSummary from './PeriodSummary';

interface DashboardProps {
  leads: Lead[];
  loading: boolean;
  /** Clique num card leva para a listagem já filtrada por aquele status. */
  onDrillDown: (metric: MetricKey) => void;
}

const CHART_MONTHS = 6;

/**
 * O dashboard mostra o acumulado de todas as solicitações. Os gráficos continuam
 * recortados por mês (últimos 6/12), ancorados no mês corrente.
 */
export default function Dashboard({ leads, loading, onDrillDown }: DashboardProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('quantidade');
  const [cityStatus, setCityStatus] = useState<MetricKey>('APROVADO');

  const counts = useMemo(() => countMetrics(leads), [leads]);
  const weekCounts = useMemo(() => countLastDays(leads, 7), [leads]);

  const chartSeries = useMemo(() => monthSeries(leads, currentMonth(), CHART_MONTHS), [leads]);

  const cityRank = useMemo(
    () => rank(leads.filter((l) => l.status === cityStatus), (l) => l.cidade, 10),
    [leads, cityStatus],
  );
  const origemRank = useMemo(() => rank(leads, origemOf, 10), [leads]);
  const summary = useMemo(() => buildSummary(leads), [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-subtle">
        <Loader2 size={22} className="animate-spin text-brand" />
        <span className="ml-3 text-sm">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards — 3 por linha */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_ORDER.map((metric) => (
          <StatCard
            key={metric}
            metric={metric}
            value={counts[metric]}
            week={weekCounts[metric]}
            onClick={() => onDrillDown(metric)}
          />
        ))}
      </div>

      {/* Gráfico + ranking de cidades */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
              Solicitações por mês
              <Info size={13} className="text-subtle" aria-label={`Últimos ${CHART_MONTHS} meses`} />
            </h2>

            <div className="flex rounded-lg bg-line p-0.5">
              {(['quantidade', 'percentual'] as ChartMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`rounded-md px-3 py-1 text-[11.5px] font-semibold capitalize transition-colors cursor-pointer
                    ${chartMode === mode ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink-2'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </header>

          <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1.5">
            {/* No modo percentual a série "total" não é desenhada (seria sempre 100%),
                então também não entra na legenda. */}
            {CHART_SERIES
              .filter((key) => chartMode === 'quantidade' || key !== 'total')
              .map((key) => (
                <span key={key} className="flex items-center gap-1.5 text-[11.5px] text-muted">
                  <span className="h-0.5 w-3.5 rounded-full" style={{ background: METRICS[key].hex }} />
                  {METRICS[key].label}
                </span>
              ))}
          </div>

          <LineChart points={chartSeries} series={CHART_SERIES} mode={chartMode} />
        </section>

        <RankingCard
          title="Clientes por Cidade"
          labelHeader="Cidade"
          valueHeader={METRICS[cityStatus].label}
          rows={cityRank.rows}
          total={cityRank.total}
          numbered
          action={
            <select
              value={cityStatus}
              onChange={(e) => setCityStatus(e.target.value as MetricKey)}
              className="cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px]
                font-medium text-ink-2 focus:outline-none focus:border-brand"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{METRICS[s].label}</option>
              ))}
            </select>
          }
        />
      </div>

      {/* Origem + resumo */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        <RankingCard
          title="Origem dos clientes"
          hint="Derivada do campo “Quem indicou você?”"
          labelHeader="Origem"
          valueHeader="Clientes"
          rows={origemRank.rows}
          total={origemRank.total}
        />
        <PeriodSummary summary={summary} periodLabel="Todo o período" />
      </div>

      <p className="pb-2 text-center text-[12px] text-subtle">
        Os dados exibidos consideram todas as solicitações recebidas e podem sofrer alterações.
      </p>
    </div>
  );
}
