import { useLoan } from '../context/LoanContext';

export function Home() {
  const { dispatch } = useLoan();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #091e42 0%, #0d2b5e 40%, #163a7a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Character Image */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'center',
        marginBottom: 0, position: 'relative',
      }}>
        <div style={{
          width: '75%', maxWidth: 320, marginTop: 10,
          borderRadius: 20,
          background: 'radial-gradient(ellipse at center, rgba(15,35,80,0.9) 0%, rgba(10,25,60,0.95) 60%, transparent 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <img
            src="/personagem.png"
            alt="SP Empréstimos"
            style={{
              width: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h1 style={{
        color: '#fff', fontSize: 30, fontWeight: 900,
        textAlign: 'center', marginBottom: 20,
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        letterSpacing: 0.5,
      }}>
        SP Empréstimos
      </h1>

      {/* Menu Buttons */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        width: '100%', padding: '0 20px', marginBottom: 20,
      }}>
        <MenuButton
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h5"/><circle cx="15" cy="16" r="3"/><path d="M15 14v4M13 16h4"/></svg>}
          label="Simulação de Empréstimo"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
          highlight
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
        color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center',
        lineHeight: 1.5, marginTop: 'auto', paddingBottom: 24,
        fontStyle: 'italic',
      }}>
        Simule & descubra as melhores<br/>condições para você!
      </p>
    </div>
  );
}

function MenuButton({ icon, label, onClick, highlight }: { icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      padding: '14px 16px', borderRadius: 14,
      background: highlight
        ? 'linear-gradient(135deg, #1a4fc9 0%, #2563eb 50%, #3b82f6 100%)'
        : 'rgba(255,255,255,0.10)',
      border: highlight ? '1.5px solid rgba(100,160,255,0.4)' : '1.5px solid rgba(255,255,255,0.18)',
      color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
      backdropFilter: 'blur(4px)',
      transition: 'background 0.15s, transform 0.1s',
      boxShadow: highlight ? '0 4px 15px rgba(37,99,235,0.3)' : 'none',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = highlight ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = highlight ? 'linear-gradient(135deg, #1a4fc9 0%, #2563eb 50%, #3b82f6 100%)' : 'rgba(255,255,255,0.10)'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
}
