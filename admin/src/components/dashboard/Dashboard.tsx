import { useMemo, useState } from 'react';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { Lead } from '../../types';
import { CARD_ORDER, METRICS, MetricKey } from '../../constants/status';
import {
  afterDashboardStart, countLastDays, countMetrics, currentMonth, fullMonthLabel,
  monthKey, monthSeries, rank,
} from '../../utils/analytics';
import StatCard from './StatCard';
import RankingCard from './RankingCard';

interface DashboardProps {
  leads: Lead[];
  loading: boolean;
  /** Clique num card leva para a listagem já filtrada por aquele status. */
  onDrillDown: (metric: MetricKey) => void;
}

const CHART_MONTHS = 6;

export default function Dashboard({ leads: allLeads, loading, onDrillDown }: DashboardProps) {
  // Data de corte (ver DASHBOARD_START_DATE): os gráficos e rankings de baixo só
  // consideram solicitações a partir dela — "começam do zero". Os cards do topo,
  // porém, seguem mostrando os totais reais de todo o histórico (allLeads).
  const leads = useMemo(() => allLeads.filter(afterDashboardStart), [allLeads]);

  // '' = todos os meses; senão 'YYYY-MM'.
  const [month, setMonth] = useState<string>('');

  // Meses disponíveis (de todo o histórico + mês atual), mais recentes primeiro.
  const monthOptions = useMemo(() => {
    const set = new Set(allLeads.map((l) => monthKey(new Date(l.createdAt))));
    set.add(currentMonth());
    return [...set].sort().reverse();
  }, [allLeads]);

  /* --- Cards do topo: totais reais (todo o histórico), com o filtro de mês. --- */
  const scopedAll = useMemo(
    () => (month ? allLeads.filter((l) => monthKey(new Date(l.createdAt)) === month) : allLeads),
    [allLeads, month],
  );
  const counts = useMemo(() => countMetrics(scopedAll), [scopedAll]);
  const weekCounts = useMemo(() => countLastDays(allLeads, 7), [allLeads]);
  // A mini-tendência dos cards acompanha os números reais.
  const cardSeries = useMemo(
    () => monthSeries(allLeads, month || currentMonth(), CHART_MONTHS),
    [allLeads, month],
  );

  // Clientes por Cidade tem o seu próprio seletor de período, independente do filtro geral.
  const [cityMonth, setCityMonth] = useState<string>('');
  const cityScoped = useMemo(
    () => (cityMonth ? leads.filter((l) => monthKey(new Date(l.createdAt)) === cityMonth) : leads),
    [leads, cityMonth],
  );
  const cityRank = useMemo(
    () => rank(cityScoped.filter((l) => l.status === 'APROVADO'), (l) => l.cidade, 10),
    [cityScoped],
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
    <div className="space-y-4 lg:-mt-[56px]">
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
            trend={cardSeries.map((p) => p.counts[metric])}
            onClick={() => onDrillDown(metric)}
          />
        ))}
      </div>

      {/* Ranking de cidades (recortado pela data de corte do dashboard) */}
      <RankingCard
          title="Clientes por Cidade"
          labelHeader="Cidade"
          valueHeader={METRICS.APROVADO.label}
          rows={cityRank.rows}
          total={cityRank.total}
          numbered
          action={(
            <div className="flex items-center gap-2">
              {cityMonth && (
                <button
                  onClick={() => setCityMonth('')}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px]
                    font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
                >
                  <X size={13} strokeWidth={2.2} />
                  Limpar filtros
                </button>
              )}
              <select
                value={cityMonth}
                onChange={(e) => setCityMonth(e.target.value)}
                className="cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px]
                  font-medium text-ink-2 focus:border-brand focus:outline-none"
              >
                <option value="">Todo o período</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>{fullMonthLabel(m)}</option>
                ))}
              </select>
            </div>
          )}
        />
      <p className="pb-2 text-center text-[12px] text-subtle">
        {month
          ? `Dados referentes a ${periodLabel}.`
          : 'Os dados exibidos consideram todas as solicitações recebidas e podem sofrer alterações.'}
      </p>
    </div>
  );
}
