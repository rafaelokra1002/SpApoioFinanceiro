import { useLoan } from '../context/LoanContext';

// Tema escuro com amarelo (mesma paleta das outras telas).
const BG = '#060c15';
const GOLD = '#f6c700';

export function Confirmation() {
  const { dispatch } = useLoan();

  return (
    <div style={{
      minHeight: '100vh', background: BG, colorScheme: 'dark',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        {/* Círculo amarelo com ✓ */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', border: `4px solid ${GOLD}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px', animation: 'pop 0.5s ease',
        }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>

        <h1 style={{
          margin: '0 0 18px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800,
          color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>
          Solicitação recebida!
        </h1>

        <p style={{ margin: '0 0 30px', fontSize: 'clamp(16px, 4.6vw, 19px)', color: '#fff', lineHeight: 1.45 }}>
          Você receberá a resposta<br />
          <span style={{ display: 'inline-block', margin: '4px 0', fontSize: 'clamp(22px, 6.4vw, 27px)', fontWeight: 800, color: GOLD }}>
            em até 24 horas
          </span><br />
          pelo WhatsApp informado<br />no cadastro.
        </p>

        <button onClick={() => dispatch({ type: 'RESET' })} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: GOLD, color: '#111827', fontWeight: 800, fontSize: 17,
        }}>
          Entendi
        </button>
      </div>

      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
