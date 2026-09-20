import { useEffect, useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { requestLocation, watchLocationPermission } from '../utils/geo';

// Número (DDI+DDD, só dígitos) e mensagem do botão de WhatsApp.
// TODO: trocar pelo número real de atendimento.
const WHATSAPP_ATENDIMENTO = '5571983067447';
const WHATSAPP_MSG = 'Olá! Tenho uma dúvida sobre o empréstimo.';

const BG = '#060c15';
const GOLD = '#c9a05a';

/** Botão secundário escuro com borda: ícone + rótulo centralizados e seta à direita. */
const outlineBtn: React.CSSProperties = {
  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
  width: '100%', padding: '16px 46px', borderRadius: 12, cursor: 'pointer',
  background: 'rgba(255,255,255,0.03)', border: '1.5px solid #2a3850',
};

const outlineLabel: React.CSSProperties = { fontSize: 17, fontWeight: 600, color: '#fff' };

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7d8aa0" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }}>
      <path d="M9 6l6 6-6 6"/>
    </svg>
  );
}

export function Home() {
  const { state, dispatch } = useLoan();
  // Overlay de localização: só é aberto quando o cliente tenta iniciar sem a
  // permissão concedida. Sem localização não há continuidade da solicitação.
  const [gateOpen, setGateOpen] = useState(false);

  // Enquanto o overlay estiver aberto, assim que a permissão for concedida o
  // cliente entra direto no fluxo (não precisa clicar de novo).
  useEffect(() => {
    if (gateOpen && state.geo === 'granted') {
      setGateOpen(false);
      dispatch({ type: 'SET_STEP', step: 1 });
    }
  }, [gateOpen, state.geo, dispatch]);

  // Com o bloqueio aberto, observa a permissão do navegador: quando o cliente
  // libera nas configurações (mesmo sem clicar em "Tentar novamente"), pedimos a
  // posição na hora — o navegador não deixa reabrir o balão só com o botão.
  useEffect(() => {
    if (!gateOpen) return undefined;
    return watchLocationPermission((permState) => {
      if (permState !== 'denied') requestLocation(dispatch);
    });
  }, [gateOpen, dispatch]);

  const solicitarAgora = () => {
    if (state.geo === 'granted') {
      dispatch({ type: 'SET_STEP', step: 1 });
      return;
    }
    // Sem permissão: abre o bloqueio e (re)pede a localização.
    setGateOpen(true);
    requestLocation(dispatch);
  };

  const abrirWhatsApp = () => window.open(
    `https://wa.me/${WHATSAPP_ATENDIMENTO}?text=${encodeURIComponent(WHATSAPP_MSG)}`,
    '_blank', 'noopener,noreferrer',
  );

  return (
    <div style={{
      minHeight: '100vh', background: BG, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Foto do personagem com o logo SP (já na arte). Proporção que reproduz o recorte
          da referência: a foto escala pela largura, alinhada ao topo, e esmaece na base. */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '100 / 92', flexShrink: 0, overflow: 'hidden' }}>
        <img
          src="/hero-sp-dark.jpg" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, rgba(6,12,21,0) 58%, ${BG} 100%)`,
        }} />
        {/* "CRED FINANCEIRA" sob o logo da foto (posição em % da própria foto) */}
        <div style={{
          position: 'absolute', left: '6.5%', top: '51.5%', width: '40%',
          paddingBottom: 6, textAlign: 'center', color: '#fff',
          fontSize: 'clamp(9px, 2.9vw, 14px)', fontWeight: 500, letterSpacing: '0.3em',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          borderBottom: '1px solid rgba(255,255,255,0.55)',
        }}>
          Cred Financeira
        </div>
      </div>

      <div style={{
        position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 20px 34px',
      }}>
        {/* Chamada */}
        <div style={{ marginTop: -22, textAlign: 'center' }}>
          <h1 style={{
            margin: 0, fontSize: 'clamp(30px, 9.4vw, 44px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
          }}>
            Empréstimo no Pix
          </h1>
          <p style={{
            margin: '4px 0 0', fontSize: 'clamp(22px, 6.6vw, 30px)', fontWeight: 700,
            lineHeight: 1.2, color: '#e6ebf3',
          }}>
            À vista e parcelado
          </p>
          <p style={{
            margin: '2px 0 0', fontSize: 'clamp(16px, 4.8vw, 21px)', fontWeight: 500,
            lineHeight: 1.3, color: '#9db0c9',
          }}>
            Negativado? A gente analisa.
          </p>
        </div>

        {/* Ações */}
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={solicitarAgora} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '18px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: GOLD, color: '#111827', fontSize: 18, fontWeight: 700,
          }}>
            Solicitar empréstimo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </button>

          <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: true })} style={outlineBtn}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h9l4 4v14H6z"/>
              <path d="M15 3v4h4M9 12h6M9 16h6"/>
            </svg>
            <span style={outlineLabel}>Como funciona</span>
            <Chevron />
          </button>

          <button onClick={abrirWhatsApp} style={outlineBtn}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#25d366">
              <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-1.3-.7-2.2-1.2-3.1-2.7-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1 0-.1-.2-.2-.4-.3z"/>
            </svg>
            <span style={outlineLabel}>Tirar dúvidas</span>
            <Chevron />
          </button>
        </div>
      </div>

      {gateOpen && (
        <LocationGate
          status={state.geo}
          onRetry={() => window.location.reload()}
          onClose={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Bloqueio de localização. Aparece quando o cliente tenta iniciar a solicitação
 * sem conceder a permissão. Sem localização não há como continuar.
 */
function LocationGate({ status, onRetry, onClose }: {
  status: 'pending' | 'granted' | 'denied';
  onRetry: () => void;
  onClose: () => void;
}) {
  const negado = status === 'denied';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(9,16,40,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20,
        padding: '26px 22px 22px', boxShadow: '0 20px 50px rgba(9,16,40,0.35)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#eef3fd',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21c4-4.5 6-7.7 6-10.5a6 6 0 10-12 0C6 13.3 8 16.5 12 21z"/>
            <circle cx="12" cy="10.5" r="2.2"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d1836', margin: 0 }}>
          Ative sua localização
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, marginTop: 8 }}>
          {negado
            ? 'Você não permitiu o acesso à localização. Ela é obrigatória para continuar a solicitação. Libere a localização nas permissões do navegador e tente novamente.'
            : 'Precisamos da sua localização para continuar com a solicitação. Toque em "Permitir" quando o navegador pedir.'}
        </p>

        {negado && (
          <div style={{
            background: '#fff4e5', border: '1px solid #fadcae', borderRadius: 12,
            padding: '11px 13px', marginTop: 14, textAlign: 'left',
          }}>
            <p style={{ fontSize: 12.5, color: '#8a5a00', margin: 0, lineHeight: 1.5 }}>
              Toque no cadeado/ícone ao lado do endereço no navegador → Permissões → Localização → Permitir. Depois volte e toque em "Tentar novamente".
            </p>
          </div>
        )}

        <button onClick={onRetry} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #2546f0, #1a32c4)',
          color: '#fff', fontWeight: 800, fontSize: 16, marginTop: 18,
          boxShadow: '0 6px 18px rgba(37,70,240,0.3)',
        }}>
          {status === 'pending' ? 'Aguardando permissão...' : 'Tentar novamente'}
        </button>

        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 2px',
          fontSize: 13.5, fontWeight: 600, color: '#59637a', width: '100%',
        }}>
          Voltar
        </button>
      </div>
    </div>
  );
}
