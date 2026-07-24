import { useMemo, useState } from 'react';
import { CalendarDays, Info, Loader2, X } from 'lucide-react';
import { Lead } from '../../types';
import { CARD_ORDER, CHART_SERIES, METRICS, MetricKey, STATUS_ORDER } from '../../constants/status';
import {
  buildSummary, countLastDays, countMetrics, currentMonth, fullMonthLabel,
  monthKey, monthSeries, origemOf, rank,
} from '../../utils/analytics';
import LineChart, { ChartMode } from '../charts/LineChart';
import StatCard from './StatCard';
import RankingCard from './RankingCard';
import PeriodSummary from './PeriodSummary';
import OrigemIcon from './OrigemIcon';

interface DashboardProps {
  leads: Lead[];
  loading: boolean;
  /** Clique num card leva para a listagem já filtrada por aquele status. */
  onDrillDown: (metric: MetricKey) => void;
}

const CHART_MONTHS = 6;

export default function Dashboard({ leads, loading, onDrillDown }: DashboardProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('quantidade');
  const [cityStatus, setCityStatus] = useState<MetricKey>('APROVADO');
  // '' = todos os meses; senão 'YYYY-MM'.
  const [month, setMonth] = useState<string>('');

  // Meses disponíveis (dos leads + mês atual), mais recentes primeiro.
  const monthOptions = useMemo(() => {
    const set = new Set(leads.map((l) => monthKey(new Date(l.createdAt))));
    set.add(currentMonth());
    return [...set].sort().reverse();
  }, [leads]);

  // Recorte pelo mês selecionado (ou todos).
  const scoped = useMemo(
    () => (month ? leads.filter((l) => monthKey(new Date(l.createdAt)) === month) : leads),
    [leads, month],
  );

  const counts = useMemo(() => countMetrics(scoped), [scoped]);
  const weekCounts = useMemo(() => countLastDays(leads, 7), [leads]);

  // O gráfico mostra a tendência dos últimos 6 meses até o mês selecionado.
  const chartSeries = useMemo(
    () => monthSeries(leads, month || currentMonth(), CHART_MONTHS),
    [leads, month],
  );

  const cityRank = useMemo(
    () => rank(scoped.filter((l) => l.status === cityStatus), (l) => l.cidade, 10),
    [scoped, cityStatus],
  );
  const origemRank = useMemo(() => rank(scoped, origemOf, 10), [scoped]);

  // O Resumo do período tem o seu próprio seletor de mês, independente do filtro geral.
  const [summaryMonth, setSummaryMonth] = useState<string>('');
  const summaryScoped = useMemo(
    () => (summaryMonth ? leads.filter((l) => monthKey(new Date(l.createdAt)) === summaryMonth) : leads),
    [leads, summaryMonth],
  );
  const summary = useMemo(() => buildSummary(summaryScoped), [summaryScoped]);

  // Taxa de aprovação mês a mês, para o gráfico do tile. Diferente do tile, que
  // olha só o mês filtrado, a janela aqui é a série até esse mês.
  const taxaTrend = useMemo(
    () => monthSeries(leads, summaryMonth || currentMonth(), CHART_MONTHS)
      .map((p) => (p.counts.total ? (p.counts.APROVADO / p.counts.total) * 100 : 0)),
    [leads, summaryMonth],
  );

  const periodLabel = month ? fullMonthLabel(month) : 'Todo o período';
  const cardCaption = month ? `em ${periodLabel}` : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-subtle">
        <Loader2 size={22} className="animate-spin text-brand" />
        <span className="ml-3 text-sm">Carregando dados...</span>
      </div>
    );
  }

  return (
    // Em telas largas o filtro sobe para a faixa do título (há espaço vazio à
    // direita da legenda), aproximando os cards do cabeçalho "Dashboard".
    <div className="space-y-4 lg:-mt-[92px]">
      {/* Filtro por mês */}
      <div className="flex items-center justify-end gap-2">
        {month && (
          <button
            onClick={() => setMonth('')}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px]
              font-semibold text-ink-2 shadow-sm transition-colors hover:bg-canvas cursor-pointer"
          >
            <X size={14} strokeWidth={2.2} />
            Limpar filtros
          </button>
        )}
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 shadow-sm">
          <CalendarDays size={16} className="text-muted" />
          <span className="text-[12.5px] font-medium text-muted">Mês:</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="cursor-pointer bg-transparent text-[13px] font-semibold text-ink focus:outline-none"
          >
            <option value="">Todos</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{fullMonthLabel(m)}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Cards — 3 por linha */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_ORDER.map((metric) => (
          <StatCard
            key={metric}
            metric={metric}
            value={counts[metric]}
            week={weekCounts[metric]}
            caption={cardCaption}
            trend={chartSeries.map((p) => p.counts[metric])}
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
          iconFor={(label) => <OrigemIcon label={label} />}
        />
        <PeriodSummary
          summary={summary}
          month={summaryMonth}
          monthOptions={monthOptions}
          onMonthChange={setSummaryMonth}
          taxaTrend={taxaTrend}
        />
      </div>

      <p className="pb-2 text-center text-[12px] text-subtle">
        {month
          ? `Dados referentes a ${periodLabel}. O gráfico mostra os últimos ${CHART_MONTHS} meses.`
          : 'Os dados exibidos consideram todas as solicitações recebidas e podem sofrer alterações.'}
      </p>
    </div>
  );
}
