import { useLoan } from '../context/LoanContext';

export function Home() {
  const { dispatch } = useLoan();

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: 'linear-gradient(180deg, #0d2b5e 0%, #163a7a 60%, #1e4d99 100%)',
      padding: '32px 24px 28px',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Welcome */}
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Bem-Vindo ao</h1>
      <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 24 }}>SP Empréstimos</h2>

      {/* Handshake illustration */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: 28,
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="70" height="70" viewBox="0 0 64 64" fill="none">
            <path d="M12 40 L28 28 L22 34 L36 26 L30 32 L44 24" stroke="#e8b84b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M10 42 C10 42 18 36 24 38 C30 40 28 42 34 40 C40 38 44 36 50 40" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M14 46 C14 46 20 42 26 44 C32 46 36 44 42 46" stroke="#d4a843" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="48" cy="22" r="3" fill="#e8b84b" opacity="0.6"/>
            <circle cx="16" cy="20" r="2" fill="#e8b84b" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* Menu Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        <MenuButton
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
          label="Fazer Simulação"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
        />
        <MenuButton
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          label="Como Funciona"
          onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: true })}
        />
        <MenuButton
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>}
          label="Documentos Necessários"
          onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'documentosInfo', show: true })}
        />
        <MenuButton
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Dúvidas Frequentes"
          onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'duvidas', show: true })}
        />
      </div>

      {/* Bottom text */}
      <p style={{
        color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center',
        lineHeight: 1.5, marginTop: 'auto',
      }}>
        Simule e descubra as melhores<br/>condições para você!
      </p>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      padding: '15px 18px', borderRadius: 14,
      background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)',
      color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
      backdropFilter: 'blur(4px)',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      {label}
    </button>
  );
}
