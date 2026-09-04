import { useEffect, useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { requestLocation, watchLocationPermission } from '../utils/geo';

// Número (DDI+DDD, só dígitos) e mensagem do botão de WhatsApp.
// TODO: trocar pelo número real de atendimento.
const WHATSAPP_ATENDIMENTO = '5571983067447';
const WHATSAPP_MSG = 'Olá! Tenho uma dúvida sobre o empréstimo.';

const BLUE = '#1a45e0';
const NAVY = '#0d1836';

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
      minHeight: '100vh',
      backgroundColor: '#e7ecf3',
      backgroundImage: 'repeating-linear-gradient(135deg, rgba(26,69,224,0.04) 0px, rgba(26,69,224,0.04) 1px, transparent 1px, transparent 12px)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* HERO: foto de fundo com cabeçalho, título e diferenciais por cima */}
      <div style={{
        position: 'relative', width: '100%',
        height: 'clamp(440px, 62vh, 580px)', overflow: 'hidden',
      }}>
        <img src="/hero-pix.jpg" alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 24%',
          // Zoom leve ancorado à esquerda: corta o ombro direito e mantém o lado do texto.
          transform: 'scale(1.12)', transformOrigin: 'left center',
        }} />
        {/* Clareia a esquerda pra os textos escuros destacarem */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(231,236,243,0.92) 0%, rgba(231,236,243,0.5) 34%, rgba(231,236,243,0.08) 62%, transparent 80%)',
        }} />
        {/* Clareia o topo pro cabeçalho */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, rgba(231,236,243,0.9) 0%, rgba(231,236,243,0) 100%)',
        }} />
        {/* Funde a base da foto com o fundo da página */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 110,
          background: 'linear-gradient(to top, #e7ecf3 0%, rgba(231,236,243,0) 100%)',
        }} />

        {/* Conteúdo sobre a foto */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '16px 18px 16px',
        }}>
          {/* Topo: marca + atendimento */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, lineHeight: 1 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: BLUE, letterSpacing: '-0.04em' }}>SP</span>
                <span style={{ fontSize: 25, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>EMPRÉSTIMO</span>
              </div>
              <div style={{
                marginTop: 5, fontSize: 10.5, fontWeight: 700, color: NAVY,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                — Crédito à vista e parcelado —
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
              padding: '8px 12px', borderRadius: 12,
              background: '#fff', border: `1.5px solid ${BLUE}`,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M12 21c4-4.5 6-7.7 6-10.5a6 6 0 10-12 0C6 13.3 8 16.5 12 21z"/>
                <circle cx="12" cy="10.5" r="2.2"/>
              </svg>
              <span style={{ fontSize: 10, fontWeight: 800, color: NAVY, lineHeight: 1.25, letterSpacing: '0.02em' }}>
                ATENDIMENTO<br/>NA SUA CIDADE
              </span>
            </div>
          </div>

          {/* Título + diferenciais agrupados na base do hero */}
          <div style={{ marginTop: 'auto' }}>
            <h1 className="hero-title" style={{
              margin: 0,
              fontSize: 'clamp(30px, 10vw, 46px)', lineHeight: 0.95,
              letterSpacing: '0', textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(231,236,243,0.75)',
            }}>
              <span style={{ color: NAVY, fontSize: '0.6em' }}>Empréstimo</span><br/>
              <span style={{ color: BLUE }}>no Pix</span>
            </h1>

            <div style={{ width: 120, height: 4, borderRadius: 2, background: BLUE, marginTop: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
              {['Liberação rápida', 'Liberamos para negativados'].map(txt => (
                <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8" fill="none"/>
                    <path d="M8 12.5l2.5 2.5L16 9" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{
                    fontSize: 15, fontWeight: 800, color: NAVY, textTransform: 'uppercase',
                    letterSpacing: '0.01em', textShadow: '0 1px 8px rgba(231,236,243,0.95)',
                  }}>
                    {txt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div style={{ flex: 1, padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {/* Solicitar empréstimo */}
        <button onClick={solicitarAgora} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          padding: '15px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: BLUE, boxShadow: '0 8px 22px rgba(26,69,224,0.35)',
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: '50%', background: NAVY,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 3h5l-1.2 3h-2.6z"/>
              <path d="M12 6c4 0 7 4.2 7 8.2 0 3.6-3 5.8-7 5.8s-7-2.2-7-5.8C5 10.2 8 6 12 6z"/>
              <path d="M13.6 11.6c-.4-.5-1-.8-1.7-.8-.9 0-1.6.5-1.6 1.2 0 1.7 3.4.9 3.4 2.6 0 .8-.7 1.3-1.7 1.3-.7 0-1.4-.3-1.8-.9M12 9.8v7"/>
            </svg>
          </span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Solicitar empréstimo
          </span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Tem alguma dúvida? (WhatsApp) */}
        <button onClick={abrirWhatsApp} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
          background: '#fff', border: '1.5px solid #d9e0ee',
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-1.3-.7-2.2-1.2-3.1-2.7-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1 0-.1-.2-.2-.4-.3z"/>
            </svg>
          </span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Tem alguma dúvida?
          </span>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Como funciona? */}
        <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: true })} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
          background: '#fff', border: '1.5px solid #d9e0ee',
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: 18, fontWeight: 900, color: '#fff',
          }}>?</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Como funciona?
          </span>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Sigilo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 'auto', paddingTop: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span style={{ fontSize: 12, color: '#5b647a' }}>
            <span style={{ fontWeight: 800, color: BLUE }}>SIGILO TOTAL.</span> Seus dados protegidos.
          </span>
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
