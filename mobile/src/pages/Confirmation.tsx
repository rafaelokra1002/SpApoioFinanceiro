import { ArrowRight, Clock } from 'lucide-react';
import { useLoan } from '../context/LoanContext';

// Tema escuro com dourado (mesma paleta das outras telas).
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD_LIGHT = '#efd08a';
const MUTED = '#aeb9cc';

export function Confirmation() {
  const { dispatch } = useLoan();

  return (
    <div style={{ minHeight: '100vh', background: BG, colorScheme: 'dark' }}>
      <div style={{
        minHeight: '100vh', padding: 'clamp(56px, 14vh, 130px) 20px 28px', textAlign: 'center',
      }}>
        {/* Ícone: documento em análise, com anel dourado */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          border: '2px solid rgba(224,185,111,0.35)', background: 'rgba(224,185,111,0.05)',
          boxShadow: '0 0 40px rgba(224,185,111,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 30px', animation: 'pop 0.5s ease',
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', background: '#0a1524',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h7l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/>
              <path d="M13 3v5h5"/>
              <circle cx="11.5" cy="14" r="2.6"/>
              <path d="M13.6 16.1L16 18.5"/>
            </svg>
          </div>
        </div>

        <h1 style={{
          margin: '0 0 10px', fontSize: 'clamp(24px, 6.6vw, 34px)', fontWeight: 800,
          color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>
          Análise em andamento
        </h1>
        <p style={{ margin: '0 0 30px', fontSize: 17, color: MUTED, lineHeight: 1.4 }}>
          Recebemos sua solicitação.
        </p>

        {/* Prazo de retorno */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
          background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 16,
          marginBottom: 14, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 56, width: 56, height: 56, borderRadius: '50%', background: '#161f2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={30} color={GOLD_LIGHT} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 15, color: MUTED }}>Retorno em</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: GOLD_LIGHT, lineHeight: 1.2 }}>até 24 horas.</div>
          </div>
        </div>

        {/* Canal do resultado */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
          background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 16,
          marginBottom: 26, textAlign: 'left',
        }}>
          <div style={{
            minWidth: 56, width: 56, height: 56, borderRadius: '50%', background: '#0f2a22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#25d366">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#0f2a22"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, color: MUTED }}>Retorno será enviado pelo seu</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: GOLD_LIGHT, lineHeight: 1.2 }}>WhatsApp.</div>
          </div>
        </div>

        <button onClick={() => dispatch({ type: 'RESET' })} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '19px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(180deg, #e8c885 0%, #c9a05a 100%)',
          color: '#111827', fontWeight: 800, fontSize: 20,
        }}>
          Entendi
          <ArrowRight size={22} strokeWidth={2.4} />
        </button>
      </div>

      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
