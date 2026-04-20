import { Lead } from '../types';
import { MessageCircle, Loader2, Eye } from 'lucide-react';

interface TableLeadsProps {
  leads: Lead[];
  loading: boolean;
  filter: string;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (id: string, status: string) => void;
  onWhatsApp: (lead: Lead) => void;
}

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
};

const statusStyles: Record<string, string> = {
  PENDENTE: 'bg-warning/10 text-warning',
  EM_ANALISE: 'bg-info/10 text-info',
  APROVADO: 'bg-success/10 text-success',
  RECUSADO: 'bg-danger/10 text-danger',
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TableLeads({
  leads, loading, filter, selectedLeadId,
  onSelectLead, onStatusChange, onWhatsApp,
}: TableLeadsProps) {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">
          Solicitações{filter ? ` — ${statusLabels[filter]}` : ''}
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-primary-light animate-spin" />
          <span className="ml-3 text-sm text-gray-400">Carregando...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Nenhuma solicitação encontrada
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                {['Nome', 'Telefone', 'Valor', 'Cidade', 'Perfil', 'Indicação', 'Status', 'Data', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors duration-150
                    ${selectedLeadId === lead.id ? 'bg-primary-light/5' : 'hover:bg-gray-50/80'}`}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-gray-900">{lead.nome}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{lead.telefone}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">
                    {formatCurrency(lead.valorSolicitado)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{lead.cidade}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{lead.perfil}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{lead.indicacao || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Ver detalhes"
                        onClick={() => onSelectLead(lead)}
                        className="w-8 h-8 rounded-lg bg-primary-light/10 flex items-center justify-center hover:bg-primary-light/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Eye size={14} className="text-primary-light" />
                      </button>
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light cursor-pointer"
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="EM_ANALISE">Em Análise</option>
                        <option value="APROVADO">Aprovado</option>
                        <option value="RECUSADO">Recusado</option>
                      </select>
                      <button
                        title="Enviar status via WhatsApp"
                        onClick={() => onWhatsApp(lead)}
                        className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageCircle size={14} className="text-white" fill="#fff" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
