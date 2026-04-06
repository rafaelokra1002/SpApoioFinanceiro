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
    <div style={{ padding: '24px 20px 24px', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 20px 24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 2 })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d2b5e' }}>Simulação de Empréstimo</h1>
        </div>

        {/* Result Card */}
        <div style={{
          border: '2px solid #d1d9e6', borderRadius: 16, padding: '0',
          marginBottom: 28, background: '#fafbfc', overflow: 'hidden',
        }}>
          {/* Valor Solicitado */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Valor Solicitado:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{formatCurrency(sim.valorSolicitado)}</span>
          </div>

          {/* Taxa de Juros */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Taxa de Juros:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{sim.taxaJuros}%</span>
          </div>

          {/* Valor Total a Pagar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="14" rx="3"/>
                <path d="M3 10h18"/>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Valor Total a Pagar:</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>{formatCurrency(sim.valorTotal)}</span>
          </div>

          {/* Prazo */}
          <div style={{
            padding: '16px 20px', textAlign: 'center',
          }}>
            <span style={{ fontSize: 16, color: '#374151' }}>Pague em até </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0d2b5e' }}>30 dias</span>
          </div>
        </div>

        {/* Benefícios */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 12,
          marginBottom: 28,
        }}>
          {/* Seguro e Confiável */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#eef2f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l7 4v5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V7l7-4z" stroke="#0d2b5e" strokeWidth="1.8" fill="#dbe4f3"/>
                <path d="M9 12l2 2 4-4" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>Seguro e Confiável</span>
          </div>

          {/* Análise em até 24 horas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#eef2f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#0d2b5e" strokeWidth="1.8" fill="#dbe4f3"/>
                <path d="M12 7v5l3 3" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>Análise em até 24 horas</span>
          </div>

          {/* Dinheiro rápido na sua conta */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#eef2f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="3" stroke="#0d2b5e" strokeWidth="1.8" fill="#dbe4f3"/>
                <circle cx="12" cy="12" r="3" stroke="#0d2b5e" strokeWidth="1.5"/>
                <text x="10.5" y="14" fontSize="6" fontWeight="bold" fill="#0d2b5e">$</text>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>Dinheiro rápido na sua conta</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 4 })} style={{
            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
            color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer',
          }}>Enviar Dados</button>
        </div>
      </div>
    </div>
  );
}

