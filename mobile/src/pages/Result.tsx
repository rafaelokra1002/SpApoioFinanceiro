import { useLoan } from '../context/LoanContext';
import { formatCurrency } from '../utils/formatCurrency';

export function Result() {
  const { state, dispatch } = useLoan();
  const sim = state.simulation;

  if (!sim) {
    dispatch({ type: 'SET_STEP', step: 2 });
    return null;
  }

  return (
    <div style={{ padding: '24px 20px 24px', minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(135deg, #1e1040 0%, #2d1b69 40%, #1e1040 100%)' }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '28px 20px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 2 })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Simulação de Empréstimo</h1>
        </div>
        <p style={{ fontSize: 14, color: '#7c7c9a', marginBottom: 24, paddingLeft: 40, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Selecione uma opção para continuar</p>

        {/* Result Card */}
        <div style={{
          border: '2px solid #d1d9e6', borderRadius: 16, padding: '0',
          marginBottom: 20, background: '#fafbfc', overflow: 'hidden',
        }}>
          {/* Valor Solicitado */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>💲</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Valor Solicitado:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{formatCurrency(sim.valorSolicitado)}</span>
          </div>

          {/* Taxa mensal */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0d2b5e' }}>%</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Taxa mensal:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{sim.taxaJuros}%</span>
          </div>

          {/* Total para pagar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>💰</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Total para pagar:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{formatCurrency(sim.valorTotal)}</span>
          </div>

          {/* Prazo */}
          <div style={{ padding: '16px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <span style={{ fontSize: 15, color: '#374151' }}>Pagamento em até </span>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#0d2b5e' }}>30 dias</span>
          </div>
        </div>

        {/* Benefícios Card */}
        <div style={{
          border: '2px solid #d1d9e6', borderRadius: 16, padding: '18px 20px',
          marginBottom: 24, background: '#fafbfc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#16a34a"/>
              <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 15, color: '#374151' }}><strong>Análise</strong> em menos de <strong>24h</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#16a34a"/>
              <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 15, color: '#374151' }}><strong>Pix rápido</strong> após aprovação</span>
          </div>
        </div>

        {/* Action Button */}
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 4 })} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
          color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(46,139,87,0.3)',
        }}>Solicitar Análise Agora</button>
      </div>
    </div>
  );
}

