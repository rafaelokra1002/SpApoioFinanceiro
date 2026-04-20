import { useState, useEffect } from 'react';
import { Lead } from '../types';
import { X, CheckCircle, XCircle, Trash2, MessageCircle, ExternalLink, Clock, Download, Loader2 } from 'lucide-react';
import { fetchMessageLogs } from '../services/api';
import { downloadLeadDossier } from '../utils/leadDossier';

interface MessageLog {
  id: string;
  mensagem: string;
  status: string;
  createdAt: string;
}

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (lead: Lead) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function LeadDetail({ lead, onClose, onStatusChange, onDelete, onWhatsApp }: LeadDetailProps) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [downloadingDossier, setDownloadingDossier] = useState(false);

  useEffect(() => {
    fetchMessageLogs(lead.id).then(res => {
      if (res.success) setLogs(res.data);
    }).catch(() => {});
  }, [lead.id]);

  const rows = [
    { label: 'Nome', value: lead.nome },
    { label: 'Telefone', value: lead.telefone },
    lead.cpf ? { label: 'CPF', value: lead.cpf } : null,
    lead.email ? { label: 'Email', value: lead.email } : null,
    lead.instagram ? { label: 'Instagram', value: lead.instagram } : null,
    { label: 'Renda', value: lead.renda ? formatCurrency(Number(lead.renda)) : '—' },
    { label: 'Valor Solicitado', value: formatCurrency(lead.valorSolicitado), highlight: true },
    { label: 'Total (c/ juros)', value: formatCurrency(lead.valorTotal), bold: true },
    { label: 'Cidade', value: lead.cidade },
    { label: 'Perfil', value: lead.perfil },
    lead.nomeEmpresa ? { label: 'Empresa', value: lead.nomeEmpresa } : null,
    lead.bairroTrabalho ? { label: 'Bairro Trab.', value: lead.bairroTrabalho } : null,
    lead.indicacao ? { label: 'Quem Indicou', value: lead.indicacao } : null,
  ].filter(Boolean) as { label: string; value: string; highlight?: boolean; bold?: boolean }[];

  const handleDownloadDossier = async () => {
    try {
      setDownloadingDossier(true);
      await downloadLeadDossier(lead, logs);
    } catch (error) {
      console.error('Erro ao gerar dossiê:', error);
      alert('Não foi possível gerar o dossiê deste lead.');
    } finally {
      setDownloadingDossier(false);
    }
  };

  return (
    <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 self-start sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-[15px] font-bold text-gray-900">Detalhes do Lead</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-0">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-xs font-medium text-gray-400">{row.label}</span>
            <span className={`text-[13px] ${row.highlight ? 'text-primary-light font-bold' : row.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Documents */}
      {lead.documentos && lead.documentos.length > 0 && (
        <div className="px-5 pb-4">
          <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            📄 Documentos ({lead.documentos.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {lead.documentos.map((doc) => {
              const isPdf = doc.url?.toLowerCase().endsWith('.pdf') || doc.filename?.toLowerCase().endsWith('.pdf');
              return (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  {isPdf ? (
                    <div className="w-full h-20 flex flex-col items-center justify-center bg-red-50 text-red-500">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="5" y="3" width="14" height="18" rx="2" />
                        <path d="M9 8h6M9 12h6M9 16h3" />
                      </svg>
                      <span className="text-[10px] font-bold mt-1">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={doc.url}
                      alt={doc.tipo}
                      className="w-full h-20 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-[10px] text-gray-500 truncate">{doc.tipo}</span>
                    <ExternalLink size={10} className="text-gray-300 group-hover:text-primary-light" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Message History */}
      {logs.length > 0 && (
        <div className="px-5 pb-4">
          <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <Clock size={12} /> Mensagens ({logs.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    log.status === 'ENVIADO'
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-3 whitespace-pre-line">{log.mensagem}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={handleDownloadDossier}
          disabled={downloadingDossier}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-light text-white text-[13px] font-bold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-wait disabled:opacity-70"
        >
          {downloadingDossier ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloadingDossier ? 'Gerando dossiê...' : 'Baixar Dossiê para Análise'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange(lead.id, 'APROVADO')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-success text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle size={14} /> Aprovar
          </button>
          <button
            onClick={() => onStatusChange(lead.id, 'RECUSADO')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-danger text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <XCircle size={14} /> Recusar
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="w-10 flex items-center justify-center rounded-xl bg-gray-100 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
        <button
          onClick={() => onWhatsApp(lead)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-[13px] font-bold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <MessageCircle size={16} fill="#fff" />
          Enviar Status via WhatsApp
        </button>
      </div>
    </div>
  );
}
