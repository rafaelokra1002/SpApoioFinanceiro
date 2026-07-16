import {
  Users, Clock, CheckCircle2, XCircle, UserX, UserRoundCheck,
  type LucideIcon,
} from 'lucide-react';

/** Status persistidos no campo `Lead.status`. */
export type StatusKey =
  | 'PENDENTE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'NAO_CONTRATOU'
  | 'PASSEI_COLABORADOR';

/** Chaves das métricas dos cards do topo (status + o total agregado). */
export type MetricKey = 'total' | StatusKey;

interface MetricMeta {
  key: MetricKey;
  label: string;
  icon: LucideIcon;
  /** Hex usado nos SVGs (sparkline / gráfico de linha). */
  hex: string;
  /** Classes do ícone no card. */
  iconBg: string;
  iconFg: string;
  /** Classes da badge de status na tabela. */
  badge: string;
}

export const METRICS: Record<MetricKey, MetricMeta> = {
  total: {
    key: 'total',
    label: 'Total de clientes',
    icon: Users,
    hex: '#16a34a',
    iconBg: 'bg-success/10',
    iconFg: 'text-success',
    badge: 'bg-success/10 text-success',
  },
  PENDENTE: {
    key: 'PENDENTE',
    label: 'Pendentes',
    icon: Clock,
    hex: '#f59e0b',
    iconBg: 'bg-warning/10',
    iconFg: 'text-warning',
    badge: 'bg-warning/10 text-warning',
  },
  APROVADO: {
    key: 'APROVADO',
    label: 'Aprovados',
    icon: CheckCircle2,
    hex: '#3b82f6',
    iconBg: 'bg-success/10',
    iconFg: 'text-success',
    badge: 'bg-success/10 text-success',
  },
  RECUSADO: {
    key: 'RECUSADO',
    label: 'Recusados',
    icon: XCircle,
    hex: '#ef4444',
    iconBg: 'bg-danger/10',
    iconFg: 'text-danger',
    badge: 'bg-danger/10 text-danger',
  },
  NAO_CONTRATOU: {
    key: 'NAO_CONTRATOU',
    label: 'Não contrataram',
    icon: UserX,
    hex: '#fb923c',
    iconBg: 'bg-orange/10',
    iconFg: 'text-orange',
    badge: 'bg-orange/10 text-orange',
  },
  PASSEI_COLABORADOR: {
    key: 'PASSEI_COLABORADOR',
    label: 'Passei para colaborador',
    icon: UserRoundCheck,
    hex: '#3b82f6',
    iconBg: 'bg-info/10',
    iconFg: 'text-info',
    badge: 'bg-info/10 text-info',
  },
};

/** Ordem dos 6 cards do topo do dashboard. */
export const CARD_ORDER: MetricKey[] = [
  'total', 'PENDENTE', 'APROVADO', 'RECUSADO', 'NAO_CONTRATOU', 'PASSEI_COLABORADOR',
];

/** Status atribuíveis a um lead (usado nos selects). */
export const STATUS_ORDER: StatusKey[] = [
  'PENDENTE', 'APROVADO', 'RECUSADO', 'NAO_CONTRATOU', 'PASSEI_COLABORADOR',
];

/**
 * Status de controle interno: o backend recusa disparo de WhatsApp para eles,
 * porque não existe template voltado ao cliente.
 */
export const INTERNAL_STATUSES: StatusKey[] = ['NAO_CONTRATOU', 'PASSEI_COLABORADOR'];

export function isInternalStatus(status: string): boolean {
  return INTERNAL_STATUSES.includes(status as StatusKey);
}

/** Status antigo que ainda pode existir em leads gravados antes desta versão. */
const LEGACY_LABELS: Record<string, string> = { EM_ANALISE: 'Em Análise' };

export function statusLabel(status: string): string {
  return METRICS[status as MetricKey]?.label ?? LEGACY_LABELS[status] ?? status;
}

export function statusBadge(status: string): string {
  return METRICS[status as MetricKey]?.badge ?? 'bg-gray-100 text-gray-500';
}

/** Séries do gráfico "Solicitações por mês". */
export const CHART_SERIES: MetricKey[] = ['total', 'APROVADO', 'RECUSADO', 'NAO_CONTRATOU'];
