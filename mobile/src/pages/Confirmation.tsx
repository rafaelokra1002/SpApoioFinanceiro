import { useLoan } from '../context/LoanContext';

export function Confirmation() {
  const { dispatch } = useLoan();

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{
        background: '#fff', minHeight: '100vh', padding: '40px 24px 28px',
        textAlign: 'center',
      }}>
        {/* Ícone: documento em análise */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', background: '#e8effc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px', animation: 'pop 0.5s ease',
        }}>
          <div style={{
            width: 66, height: 66, borderRadius: '50%', background: '#1a45e0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h7l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/>
              <path d="M13 3v5h5"/>
              <circle cx="11.5" cy="14" r="2.6"/>
              <path d="M13.6 16.1L16 18.5"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0d1836', marginBottom: 10, lineHeight: 1.2 }}>
          Análise em andamento
        </h1>
        <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.6, marginBottom: 22 }}>
          Recebemos seus dados com sucesso.<br/>
          Nossa equipe já está <strong style={{ color: '#1a45e0' }}>analisando sua solicitação.</strong>
        </p>

        {/* Prazo de retorno */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px',
          background: '#eef3fd', borderRadius: 16, marginBottom: 12, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 46, width: 46, height: 46, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a45e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#41506e' }}>Você receberá um retorno em</div>
            <div style={{ fontWeight: 800, fontSize: 19, color: '#1a45e0' }}>até 24 horas.</div>
          </div>
        </div>

        {/* Canal do resultado */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px',
          background: '#effbf3', borderRadius: 16, marginBottom: 18, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 46, width: 46, height: 46, borderRadius: '50%', background: '#25d366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25d366"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#41506e' }}>O resultado da análise</div>
            <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0d1836' }}>
              será enviado no seu <span style={{ color: '#12804a' }}>WhatsApp.</span>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9V6z"/>
          </svg>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Seus dados estão seguros e protegidos.</span>
        </div>

        <button onClick={() => dispatch({ type: 'RESET' })} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: '#1a45e0', color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>
          </svg>
          Entendi
        </button>

        {/* Rodapé */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          borderTop: '1px solid #eaedf4', marginTop: 20, paddingTop: 18,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a45e0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 3l8 3v6c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>
          </svg>
          <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.5, textAlign: 'left', margin: 0 }}>
            Agradecemos sua confiança!<br/>
            Estamos aqui para te ajudar a <strong style={{ color: '#1a45e0' }}>conquistar mais.</strong>
          </p>
        </div>
      </div>

      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
