import { useLoan } from '../context/LoanContext';
import { VinculoServidor as VinculoType } from '../types';

interface Opcao {
  value: Exclude<VinculoType, ''>;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const OPCOES: Opcao[] = [
  {
    value: 'EFETIVO',
    label: 'Cargo efetivo',
    description: 'Servidor concursado e nomeado.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    value: 'COMISSIONADO',
    label: 'Cargo comissionado',
    description: 'Servidor nomeado para cargo de confiança.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      </svg>
    ),
  },
];

export function VinculoServidor() {
  const { dispatch } = useLoan();

  const escolher = (value: Exclude<VinculoType, ''>) => {
    dispatch({ type: 'SET_FIELD', field: 'vinculoServidor', value });
    // Segue para os documentos (a lista específica virá depois).
    dispatch({ type: 'SET_STEP', step: 4 });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Faixa azul com o Voltar */}
      <div style={{
        background: 'linear-gradient(120deg, #123bd6 0%, #1a45e0 45%, #2551f0 100%)',
        padding: '18px 20px 46px',
      }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 2 })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
          background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.5)',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      </div>

      {/* Cartão branco subindo sobre a faixa azul */}
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0', marginTop: -28,
        position: 'relative', minHeight: '60vh', padding: '26px 20px 24px',
      }}>
        {/* Selo da categoria escolhida */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 13px', borderRadius: 999, marginBottom: 16,
          background: '#eef0ff', color: '#4a45e0', fontWeight: 700, fontSize: 13,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M6 17c0-1.7 1.3-3 3-3s3 1.3 3 3" />
            <path d="M15 9h4M15 13h4" />
          </svg>
          Servidor público
        </span>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0d2b5e', letterSpacing: '-0.02em' }}>
          Qual é o seu vínculo?
        </h1>
        <p style={{ marginTop: 6, marginBottom: 20, fontSize: 14, lineHeight: 1.45, color: '#6b7280' }}>
          Escolha a opção que corresponde ao seu cargo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPCOES.map(op => (
            <button key={op.value}
              onClick={() => escolher(op.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px', borderRadius: 16, cursor: 'pointer',
                background: '#fff', border: '1.5px solid #eef0f4',
                boxShadow: '0 1px 3px rgba(13,43,94,0.06)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d2b5e'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#eef0f4'; }}
            >
              <div style={{
                minWidth: 46, width: 46, height: 46, borderRadius: '50%',
                background: '#eef3fd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {op.icon}
              </div>

              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15.5, color: '#0d2b5e' }}>{op.label}</span>
                <p style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.4, color: '#6b7280' }}>
                  {op.description}
                </p>
              </div>

              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#9aa3b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
