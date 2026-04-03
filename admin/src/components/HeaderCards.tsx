import { Users, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Stats } from '../types';

interface HeaderCardsProps {
  stats: Stats | null;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const cards = [
  { key: 'total', label: 'Total', icon: Users, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  { key: 'pendentes', label: 'Pendentes', icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  { key: 'aprovados', label: 'Aprovados', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  { key: 'recusados', label: 'Recusados', icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
] as const;

export default function HeaderCards({ stats }: HeaderCardsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key as keyof Stats];
        return (
          <div
            key={card.key}
            className={`bg-white rounded-2xl p-5 shadow-sm border ${card.border} hover:shadow-md transition-shadow duration-200`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={card.color} strokeWidth={2} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-1">{card.label}</p>
          </div>
        );
      })}

      {/* Valor Total - special card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple/20 hover:shadow-md transition-shadow duration-200">
        <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center mb-3">
          <DollarSign size={20} className="text-purple" strokeWidth={2} />
        </div>
        <p className="text-lg font-extrabold text-gray-900">
          {formatCurrency(stats.valorTotalSolicitado)}
        </p>
        <p className="text-xs font-medium text-gray-400 mt-1">Valor Total</p>
      </div>
    </div>
  );
}
