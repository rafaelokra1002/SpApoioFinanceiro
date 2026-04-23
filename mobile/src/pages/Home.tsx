import { useLoan } from '../context/LoanContext';

export function Home() {
  const { dispatch } = useLoan();

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #2546f0 0%, #4169E1 40%, #2546f0 100%)',
    }}>
      {/* Background image - full screen */}
      <img
        src="/personagem.png"
        alt=""
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '60%',
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
      />
      {/* Dark overlay gradient - only fades bottom of image */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, transparent 0%, transparent 30%, #1a3260 58%)',
        pointerEvents: 'none',
      }} />

      {/* Content on top */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px 20px',
        paddingTop: '30vh',
      }}>
        {/* Title */}
        <h1 style={{
          color: '#fff', fontSize: 28, fontWeight: 900,
          textAlign: 'center', marginBottom: 16,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          letterSpacing: 0.5,
        }}>
          SP Apoio Financeiro
        </h1>

        {/* Menu Buttons */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          width: '100%', marginBottom: 10,
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
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Dúvidas Frequentes"
          onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'duvidas', show: true })}
        />
      </div>

        {/* Bottom text */}
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center',
          lineHeight: 1.5, paddingBottom: 8, paddingTop: 8,
          fontStyle: 'italic',
        }}>
          Simule & descubra as melhores<br/>condições para você!
        </p>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, highlight }: { icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      padding: '11px 16px', borderRadius: 14,
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
