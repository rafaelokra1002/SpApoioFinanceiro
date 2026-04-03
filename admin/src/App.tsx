import React, { useState, useEffect, useCallback } from 'react';
import { Lead, Stats, Category, CategoryDocument } from './types';
import {
  fetchLeads, fetchStats, updateLeadStatus, deleteLead,
  fetchCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi,
  addCategoryDocument, updateCategoryDocument, deleteCategoryDocument,
  seedCategories,
} from './services/api';

const statusColors: Record<string, string> = {
  PENDENTE: '#F59E0B',
  EM_ANALISE: '#3B82F6',
  APROVADO: '#10B981',
  RECUSADO: '#EF4444',
};

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function App() {
  const [page, setPage] = useState<'leads' | 'categories'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ label: '', icon: '📋' });
  const [newDoc, setNewDoc] = useState<{ catId: string; key: string; label: string; description: string; icon: string } | null>(null);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetchCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setCatLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads(filter || undefined),
        fetchStats(),
      ]);
      if (leadsRes.success) setLeads(leadsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateLeadStatus(id, status);
    if (res.success) {
      loadData();
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    const res = await deleteLead(id);
    if (res.success) {
      setSelectedLead(null);
      loadData();
    }
  };

  const sendWhatsApp = (lead: Lead) => {
    const phone = lead.telefone.replace(/\D/g, '');
    const phoneFormatted = phone.startsWith('55') ? phone : `55${phone}`;
    const status = lead.status;
    const nome = lead.nome.split(' ')[0];
    const valor = formatCurrency(lead.valorSolicitado);

    const messages: Record<string, string> = {
      PENDENTE: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *${valor}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nFique tranquilo(a), assim que tivermos uma atualização, entraremos em contato por aqui mesmo.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      EM_ANALISE: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nPassando para informar que sua solicitação de crédito no valor de *${valor}* já está *em análise* pela nossa equipe.\n\nEstamos avaliando toda a documentação enviada e em breve teremos uma resposta para você.\n\nAgradecemos a confiança e a paciência!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      APROVADO: `Olá *${nome}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *${valor}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para agendar a assinatura do contrato e finalizar todo o processo.\n\nAgradecemos por escolher a *SP Apoio Financeiro*. Estamos felizes em poder ajudar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      RECUSADO: `Olá *${nome}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nApós análise criteriosa, infelizmente não foi possível aprovar sua solicitação de crédito no valor de *${valor}* neste momento.\n\nIsso não significa que não poderemos ajudá-lo(a) no futuro. Você pode realizar uma nova solicitação após 30 dias ou entrar em contato para avaliarmos outras opções.\n\nAgradecemos seu interesse e confiança.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
    };

    const msg = messages[status] || messages['PENDENTE'];
    const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.app}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #F5F7FA; color: #1F2937; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        button:hover { opacity: 0.85; }
        tr:hover { background: #F9FAFB !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontSize: 28 }}>💰</span>
          <div>
            <h2 style={{ fontSize: 16, color: '#fff', fontWeight: 800 }}>SP Apoio</h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Painel Admin</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, padding: '8px 12px 4px', letterSpacing: 1 }}>Leads</p>
          {[
            { key: '', label: '📊 Todos' },
            { key: 'PENDENTE', label: '⏳ Pendentes' },
            { key: 'APROVADO', label: '✅ Aprovados' },
            { key: 'RECUSADO', label: '❌ Recusados' },
          ].map((item) => (
            <button
              key={item.key}
              style={{
                ...styles.navItem,
                ...(page === 'leads' && filter === item.key ? styles.navItemActive : {}),
              }}
              onClick={() => { setPage('leads'); setFilter(item.key); }}
            >
              {item.label}
            </button>
          ))}

          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, padding: '16px 12px 4px', letterSpacing: 1 }}>Configurações</p>
          <button
            style={{
              ...styles.navItem,
              ...(page === 'categories' ? styles.navItemActive : {}),
            }}
            onClick={() => { setPage('categories'); loadCategories(); }}
          >
            📂 Categorias
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <button style={styles.navItem} onClick={loadData}>
            🔄 Atualizar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {page === 'leads' && (<>
        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsRow}>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
              <p style={styles.statLabel}>Total</p>
              <p style={styles.statValue}>{stats.total}</p>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
              <p style={styles.statLabel}>Pendentes</p>
              <p style={styles.statValue}>{stats.pendentes}</p>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
              <p style={styles.statLabel}>Aprovados</p>
              <p style={styles.statValue}>{stats.aprovados}</p>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
              <p style={styles.statLabel}>Recusados</p>
              <p style={styles.statValue}>{stats.recusados}</p>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #8B5CF6' }}>
              <p style={styles.statLabel}>Valor Total</p>
              <p style={{ ...styles.statValue, fontSize: 18 }}>
                {formatCurrency(stats.valorTotalSolicitado)}
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Leads Table */}
          <div style={styles.tableContainer}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Solicitações{filter ? ` — ${statusLabels[filter]}` : ''}
            </h2>

            {loading ? (
              <p style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                Carregando...
              </p>
            ) : leads.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                Nenhuma solicitação encontrada
              </p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nome</th>
                    <th style={styles.th}>Telefone</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Cidade</th>
                    <th style={styles.th}>Perfil</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      style={{
                        ...styles.tr,
                        ...(selectedLead?.id === lead.id ? { background: '#EFF6FF' } : {}),
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td style={styles.td}><strong>{lead.nome}</strong></td>
                      <td style={styles.td}>{lead.telefone}</td>
                      <td style={styles.td}>{formatCurrency(lead.valorSolicitado)}</td>
                      <td style={styles.td}>{lead.cidade}</td>
                      <td style={styles.td}>{lead.perfil}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: (statusColors[lead.status] || '#999') + '20',
                            color: statusColors[lead.status] || '#999',
                          }}
                        >
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(lead.createdAt)}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={styles.select}
                          >
                            <option value="PENDENTE">Pendente</option>
                            <option value="EM_ANALISE">Em Análise</option>
                            <option value="APROVADO">Aprovado</option>
                            <option value="RECUSADO">Recusado</option>
                          </select>
                          <button
                            title="Enviar status via WhatsApp"
                            onClick={(e) => { e.stopPropagation(); sendWhatsApp(lead); }}
                            style={{
                              background: '#25D366',
                              border: 'none',
                              borderRadius: 6,
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Lead Detail Panel */}
          {selectedLead && (
            <div style={styles.detailPanel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Detalhes</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
                >
                  ✕
                </button>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Nome:</span>
                <span>{selectedLead.nome}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Telefone:</span>
                <span>{selectedLead.telefone}</span>
              </div>
              {selectedLead.cpf && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>CPF:</span>
                  <span>{selectedLead.cpf}</span>
                </div>
              )}
              {selectedLead.email && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Email:</span>
                  <span>{selectedLead.email}</span>
                </div>
              )}
              {selectedLead.instagram && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Instagram:</span>
                  <span>{selectedLead.instagram}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Renda:</span>
                <span>{selectedLead.renda ? formatCurrency(Number(selectedLead.renda)) : '—'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Valor:</span>
                <span style={{ fontWeight: 700, color: '#1a56db' }}>
                  {formatCurrency(selectedLead.valorSolicitado)}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Total (c/ juros):</span>
                <span style={{ fontWeight: 700 }}>
                  {formatCurrency(selectedLead.valorTotal)}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Cidade:</span>
                <span>{selectedLead.cidade}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Perfil:</span>
                <span>{selectedLead.perfil}</span>
              </div>
              {selectedLead.nomeEmpresa && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Empresa:</span>
                  <span>{selectedLead.nomeEmpresa}</span>
                </div>
              )}
              {selectedLead.bairroTrabalho && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Bairro Trab.:</span>
                  <span>{selectedLead.bairroTrabalho}</span>
                </div>
              )}

              {/* Documents */}
              {selectedLead.documentos && selectedLead.documentos.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    📄 Documentos ({selectedLead.documentos.length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {selectedLead.documentos.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.docLink}
                      >
                        <img
                          src={doc.url}
                          alt={doc.tipo}
                          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                          {doc.tipo}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  onClick={() => handleStatusChange(selectedLead.id, 'APROVADO')}
                  style={{ ...styles.actionBtn, background: '#10B981', color: '#fff' }}
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => handleStatusChange(selectedLead.id, 'RECUSADO')}
                  style={{ ...styles.actionBtn, background: '#EF4444', color: '#fff' }}
                >
                  ❌ Recusar
                </button>
                <button
                  onClick={() => handleDelete(selectedLead.id)}
                  style={{ ...styles.actionBtn, background: '#F3F4F6', color: '#EF4444' }}
                >
                  🗑️
                </button>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={() => sendWhatsApp(selectedLead)}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#25D366',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar Status via WhatsApp
              </button>
            </div>
          )}
        </div>
        </>)}

        {page === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>📂 Categorias</h2>
              <button
                onClick={async () => {
                  if (!window.confirm('Isso vai popular as categorias padrão. Deseja continuar?')) return;
                  await seedCategories();
                  loadCategories();
                }}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                🌱 Seed Categorias Padrão
              </button>
            </div>

            {/* Add Category Form */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Adicionar Categoria</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Nome</label>
                  <input
                    value={newCat.label}
                    onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
                    placeholder="Ex: Carteira Assinada"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Ícone</label>
                  <input
                    value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, textAlign: 'center' }}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newCat.label.trim()) return;
                    const value = newCat.label.trim().toUpperCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    await createCategory({ value, label: newCat.label.trim(), icon: newCat.icon, order: categories.length });
                    setNewCat({ label: '', icon: '📋' });
                    loadCategories();
                  }}
                  style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#1a56db', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {catLoading ? (
              <p style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Carregando...</p>
            ) : categories.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                Nenhuma categoria encontrada. Clique em "Seed Categorias Padrão" para popular.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {/* Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{cat.icon}</span>
                        {editingCat?.id === cat.id ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              value={editingCat.label}
                              onChange={(e) => setEditingCat({ ...editingCat, label: e.target.value })}
                              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 14 }}
                            />
                            <input
                              value={editingCat.icon}
                              onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                              style={{ width: 50, padding: '4px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 14, textAlign: 'center' }}
                            />
                            <button
                              onClick={async () => {
                                await updateCategory(editingCat.id, { label: editingCat.label, icon: editingCat.icon, active: editingCat.active });
                                setEditingCat(null);
                                loadCategories();
                              }}
                              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#10B981', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingCat(null)}
                              style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{cat.label}</h3>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>Valor: {cat.value}</p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={async () => {
                            await updateCategory(cat.id, { active: !cat.active });
                            loadCategories();
                          }}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 20,
                            border: 'none',
                            background: cat.active ? '#10B98120' : '#EF444420',
                            color: cat.active ? '#10B981' : '#EF4444',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {cat.active ? '✅ Ativa' : '❌ Inativa'}
                        </button>
                        <button
                          onClick={() => setEditingCat({ ...cat })}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Excluir categoria "${cat.label}"?`)) return;
                            await deleteCategoryApi(cat.id);
                            loadCategories();
                          }}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#EF4444' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Documents */}
                    <div style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Documentos Necessários</h4>
                        <button
                          onClick={() => setNewDoc({ catId: cat.id, key: '', label: '', description: '', icon: '📄' })}
                          style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600, color: '#1a56db' }}
                        >
                          + Documento
                        </button>
                      </div>

                      {newDoc?.catId === cat.id && (
                        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 2 }}>Chave</label>
                            <input
                              value={newDoc.key}
                              onChange={(e) => setNewDoc({ ...newDoc, key: e.target.value })}
                              placeholder="Ex: RG"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13 }}
                            />
                          </div>
                          <div style={{ flex: 2, minWidth: 160 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 2 }}>Label</label>
                            <input
                              value={newDoc.label}
                              onChange={(e) => setNewDoc({ ...newDoc, label: e.target.value })}
                              placeholder="Ex: Documento de Identidade"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13 }}
                            />
                          </div>
                          <div style={{ flex: 3, minWidth: 200 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 2 }}>Descrição</label>
                            <input
                              value={newDoc.description}
                              onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                              placeholder="Ex: Frente e Verso"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13 }}
                            />
                          </div>
                          <div style={{ width: 50 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 2 }}>Ícone</label>
                            <input
                              value={newDoc.icon}
                              onChange={(e) => setNewDoc({ ...newDoc, icon: e.target.value })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13, textAlign: 'center' }}
                            />
                          </div>
                          <button
                            onClick={async () => {
                              if (!newDoc.key.trim() || !newDoc.label.trim()) return;
                              await addCategoryDocument(cat.id, {
                                key: newDoc.key.trim(),
                                label: newDoc.label.trim(),
                                description: newDoc.description.trim(),
                                icon: newDoc.icon,
                                order: cat.documents?.length || 0,
                              });
                              setNewDoc(null);
                              loadCategories();
                            }}
                            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#1a56db', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setNewDoc(null)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {(!cat.documents || cat.documents.length === 0) ? (
                        <p style={{ fontSize: 12, color: '#9CA3AF', padding: '8px 0' }}>Nenhum documento configurado</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {cat.documents.map((doc) => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                              <span style={{ fontSize: 16 }}>{doc.icon}</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>{doc.label}</p>
                                {doc.description && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{doc.description}</p>}
                                <p style={{ fontSize: 10, color: '#CBD5E1' }}>key: {doc.key}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Remover documento "${doc.label}"?`)) return;
                                  await deleteCategoryDocument(doc.id);
                                  loadCategories();
                                }}
                                style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 11, cursor: 'pointer', color: '#EF4444' }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 220,
    background: '#1a56db',
    color: '#fff',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20,
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 600,
  },
  main: {
    flex: 1,
    marginLeft: 220,
    padding: 24,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap' as const,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1F2937',
  },
  contentArea: {
    display: 'flex',
    gap: 20,
  },
  tableContainer: {
    flex: 1,
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '2px solid #E5E7EB',
    fontSize: 12,
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
  },
  td: {
    padding: '12px',
    fontSize: 13,
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  select: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #E5E7EB',
    fontSize: 12,
    cursor: 'pointer',
  },
  detailPanel: {
    width: 340,
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    alignSelf: 'flex-start' as const,
    position: 'sticky' as const,
    top: 24,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #F9FAFB',
    fontSize: 13,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontWeight: 500,
  },
  docLink: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#F9FAFB',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 4,
    textDecoration: 'none',
  },
  actionBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
