import { useLoan } from '../context/LoanContext';
import { formatCurrency } from '../utils/formatCurrency';

export function Result() {
  const { state, dispatch } = useLoan();
  const sim = state.simulation;

  if (!sim) {
    dispatch({ type: 'SET_STEP', step: 2 });
    return null;
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Fiz uma simulação de empréstimo no valor de ${formatCurrency(sim.valorSolicitado)} ` +
      `em ${sim.parcelas}x de ${formatCurrency(sim.valorParcela)}. Gostaria de mais informações.`
    );
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  };

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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d2b5e' }}>Resultado da Simulação</h1>
        </div>

        {/* Result Card */}
        <div style={{
          border: '2px solid #d1d9e6', borderRadius: 16, padding: '22px 20px',
          marginBottom: 28, background: '#fafbfc',
        }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#0d2b5e', marginBottom: 18 }}>
            Você solicitou {formatCurrency(sim.valorSolicitado)}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Taxa aplice:" value={`${sim.taxaJuros}% ao mês.`} />
            <DetailRow label="Total a pagar:" value={formatCurrency(sim.valorTotal) + '.'} bold />
            <DetailRow label={`Em ${sim.parcelas} parcelas de`} value={formatCurrency(sim.valorParcela) + '.'} />
            <DetailRow label="1ª Parcela em:" value={sim.primeiraParcela + '.'} />
          </div>

          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
              * Observação: Sujeito à análise de crédito.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 4 })} style={{
            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
            color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer',
          }}>Enviar Dados</button>

          <button onClick={handleWhatsApp} style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: '#fff', border: '2px solid #25D366',
            color: '#25D366', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fillRule="evenodd"/>
            </svg>
            Falar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 14, color: '#374151' }}>•</span>
      <span style={{ fontSize: 15, color: '#374151' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: bold ? 800 : 700, color: '#0d2b5e', marginLeft: 'auto' }}>{value}</span>
    </div>
  );
}
