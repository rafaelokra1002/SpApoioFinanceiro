import { useEffect, useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { requestLocation, watchLocationPermission } from '../utils/geo';

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

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #ffffff 0%, #f4f7ff 55%, #eaf0ff 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Painel diagonal com o personagem (fundo claro p/ combinar com o recorte) */}
      <div style={{
        position: 'absolute', top: 92, right: 0, bottom: 0, width: '66%',
        clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
        background: 'linear-gradient(200deg, #ffffff 0%, #f4f7ff 55%, #eaf0ff 100%)',
      }}>
        <img src="/capa-personagem.jpg" alt="" style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: '18% 0%',
        }} />
        {/* Suaviza a emenda do painel com o fundo claro (sem cobrir o rosto) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(100deg, rgba(244,247,255,0.9) 0%, rgba(244,247,255,0.15) 12%, transparent 28%)',
        }} />
      </div>

      {/* Detalhe geométrico do canto inferior esquerdo */}
      <div style={{
        position: 'absolute', left: -40, bottom: -40, width: 180, height: 180,
        border: '1.5px solid rgba(37,70,240,0.14)', borderRadius: 28,
        transform: 'rotate(18deg)', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', flexDirection: 'column', padding: '22px 20px 26px',
      }}>
        {/* Topo: marca + atendimento */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
          {/* Monograma SP em texto, azul-marinho */}
          <span style={{
            fontSize: 44, fontWeight: 900, color: '#0d1836',
            letterSpacing: '-0.06em', lineHeight: 1, flexShrink: 0,
          }}>SP</span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d1836' }}>SP Apoio</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2546f0' }}>Financeiro</div>
          </div>
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.9)', border: '1.5px solid #d5e0fb',
            backdropFilter: 'blur(6px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.9" style={{ flexShrink: 0 }}>
              <path d="M12 21c4-4.5 6-7.7 6-10.5a6 6 0 10-12 0C6 13.3 8 16.5 12 21z"/>
              <circle cx="12" cy="10.5" r="2.2"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0d1836', lineHeight: 1.3 }}>
              Atendimento<br/><span style={{ color: '#2546f0' }}>na sua cidade</span>
            </span>
          </div>
        </div>

        {/* Chamada principal */}
        <div style={{ marginTop: 40 }}>
          <h1 style={{
            fontSize: 'clamp(36px, 12vw, 52px)', fontWeight: 900, lineHeight: 0.95,
            letterSpacing: '-0.04em', color: '#0d1836',
            // Halo claro forte: o texto passa por cima do casaco escuro do personagem.
            textShadow: '0 0 6px #fff, 0 0 14px rgba(255,255,255,0.95), 0 0 28px rgba(255,255,255,0.85)',
          }}>
            Dinheiro<br/><span style={{ color: '#2546f0' }}>rápido.</span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 22 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2546f0" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M13.5 2L4 14h6l-.5 8L19 10h-6z"/>
            </svg>
            <p style={{
              fontSize: 15, fontWeight: 600, color: '#0d1836', lineHeight: 1.35,
              textShadow: '0 0 5px #fff, 0 0 12px rgba(255,255,255,0.95), 0 0 22px rgba(255,255,255,0.9)',
            }}>
              Receba sua análise<br/>em <span style={{ color: '#2546f0' }}>minutos.</span>
            </p>
          </div>

          {/* Régua decorativa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24 }}>
            <span style={{ width: 34, height: 3, borderRadius: 2, background: '#2546f0' }} />
            <span style={{ width: 14, height: 3, borderRadius: 2, background: '#b9c6ee' }} />
            <span style={{ flex: 1, maxWidth: 90, height: 1, background: '#d9e1f7' }} />
          </div>
        </div>

        {/* Ações */}
        <div style={{ marginTop: 'auto', paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={solicitarAgora} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '14px 18px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #2546f0, #1a32c4)',
            boxShadow: '0 10px 26px rgba(37,70,240,0.35)',
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 3h5l-1.2 3h-2.6z"/>
                <path d="M12 6c4 0 7 4.2 7 8.2 0 3.6-3 5.8-7 5.8s-7-2.2-7-5.8C5 10.2 8 6 12 6z"/>
                <path d="M13.6 11.6c-.4-.5-1-.8-1.7-.8-.9 0-1.6.5-1.6 1.2 0 1.7 3.4.9 3.4 2.6 0 .8-.7 1.3-1.7 1.3-.7 0-1.4-.3-1.8-.9M12 9.8v7"/>
              </svg>
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 18, fontWeight: 700, color: '#fff' }}>
              Solicitar Agora
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>

          <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: true })} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '13px 18px', borderRadius: 16, cursor: 'pointer',
            background: 'rgba(255,255,255,0.94)', border: '1.5px solid #dde4f5',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{
              width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #d5e0fb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: 17, fontWeight: 800, color: '#0d1836',
            }}>?</span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 600, color: '#0d1836' }}>
              Como funciona
            </span>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>

          <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'duvidas', show: true })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            fontSize: 13.5, fontWeight: 600, color: '#59637a',
            textDecoration: 'underline', textUnderlineOffset: 3, alignSelf: 'center',
          }}>
            Dúvidas frequentes
          </button>
        </div>
      </div>

      {gateOpen && (
        <LocationGate
          status={state.geo}
          onRetry={() => requestLocation(dispatch)}
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
