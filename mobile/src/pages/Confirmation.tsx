import { useLoan } from '../context/LoanContext';

export function Confirmation() {
  const { dispatch } = useLoan();

  return (
    <div style={{ padding: '24px 20px 24px', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 24px 36px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', textAlign: 'center',
      }}>
        {/* Checkmark */}
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%)',
          border: '4px solid #2e8b57',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', animation: 'pop 0.5s ease',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0d2b5e', marginBottom: 10, lineHeight: 1.2 }}>
          Análise em<br/>andamento
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
          Seus dados foram <strong>enviados com sucesso.</strong><br/>
          Nossa equipe já está <strong>analisando sua solicitação.</strong>
        </p>

        {/* 24h card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e5e7eb',
          marginBottom: 10, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 40, height: 40, borderRadius: '50%', background: '#e8effc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 14, color: '#374151' }}>Você receberá um retorno em</span>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#0d2b5e' }}>até 24 horas.</div>
          </div>
        </div>

        {/* WhatsApp card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          background: '#f0fdf4', borderRadius: 14, border: '1.5px solid #bbf7d0',
          marginBottom: 14, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 40, height: 40, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fillRule="evenodd"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#166534' }}>Fique atento ao seu WhatsApp.</div>
            <span style={{ fontSize: 12, color: '#4b5563' }}>Entraremos em contato para dar continuidade ao seu processo.</span>
          </div>
        </div>

        {/* Security */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Seus dados estão <strong>seguros e protegidos.</strong></span>
        </div>

        <button onClick={() => dispatch({ type: 'RESET' })} style={{
          width: '100%', padding: '15px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
          color: '#fff', fontWeight: 800, fontSize: 17, cursor: 'pointer', letterSpacing: 1,
        }}>OK, ENTENDI</button>
      </div>

      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
