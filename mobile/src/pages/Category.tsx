import { useLoan } from '../context/LoanContext';
import { CATEGORIES } from '../constants/categories';
import { simular } from '../hooks/useSimulation';

const categoryIcons: Record<string, React.ReactNode> = {
  CARTEIRA_ASSINADA: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="12" r="5" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M8 30c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <rect x="14" y="17" width="8" height="4" rx="1" fill="#0d2b5e" opacity="0.15"/>
      <path d="M18 17v4" stroke="#c0392b" strokeWidth="1.5"/>
    </svg>
  ),
  CLT_SEM_REGISTRO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="6" y="8" width="24" height="20" rx="3" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M12 15h12M12 19h12M12 23h8" stroke="#0d2b5e" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="8" x2="28" y2="28" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  AUTONOMO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="12" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M14 18l3 3 5-6" stroke="#0d2b5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  BENEFICIARIO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="12" r="5" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M10 30c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M13 10c0 0-1-4 5-4s5 4 5 4" stroke="#0d2b5e" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  ESTAGIARIO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 6l14 8-14 8L4 14z" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M28 18v8c0 0-4 4-10 4s-10-4-10-4v-8" stroke="#0d2b5e" strokeWidth="1.8" fill="none"/>
      <line x1="32" y1="14" x2="32" y2="28" stroke="#0d2b5e" strokeWidth="1.8"/>
    </svg>
  ),
  SERVIDOR_PUBLICO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="5" y="8" width="26" height="20" rx="3" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <circle cx="13" cy="16" r="3" stroke="#0d2b5e" strokeWidth="1.6"/>
      <path d="M8.5 24c0-2.8 2-4.5 4.5-4.5S17.5 21.2 17.5 24" stroke="#0d2b5e" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M21 14h6M21 18h6M21 22h4" stroke="#0d2b5e" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  SEM_COMPROVACAO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M13 30V17l6-9a3 3 0 014 3l-1.5 5H29a2.5 2.5 0 012.4 3.2l-2.6 9A3 3 0 0126 30z"
        stroke="#2546f0" strokeWidth="1.8" fill="#e8effc" strokeLinejoin="round"/>
      <rect x="5" y="17" width="7" height="13" rx="2" stroke="#2546f0" strokeWidth="1.8" fill="#e8effc"/>
    </svg>
  ),
  COM_GARANTIA: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 5l11 4v9c0 7-5 11.5-11 13-6-1.5-11-6-11-13V9z" stroke="#128a4d" strokeWidth="1.8" fill="#dcf3e6"/>
      <path d="M13 18l3.5 3.5L23 15" stroke="#128a4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const highlightStyles = {
  verde: { card: '#f2fbf5', border: '#cdeada', icon: '#dcf3e6', badgeBg: '#dcf3e6', badgeFg: '#0f6b3d' },
  azul:  { card: '#f4f7ff', border: '#d5e0fb', icon: '#e8effc', badgeBg: '#e2eaff', badgeFg: '#2546f0' },
} as const;

export function Category() {
  const { state, dispatch } = useLoan();

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Faixa azul com o Voltar */}
      <div style={{
        background: 'linear-gradient(120deg, #123bd6 0%, #1a45e0 45%, #2551f0 100%)',
        padding: '18px 20px 46px',
      }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
          background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.5)',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Voltar
        </button>
      </div>

      {/* Cartão branco subindo sobre a faixa azul */}
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0', marginTop: -28,
        position: 'relative', minHeight: '60vh', padding: '26px 20px 24px',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0d2b5e', letterSpacing: '-0.02em' }}>
          Escolha a categoria
        </h1>
        <p style={{ marginTop: 6, marginBottom: 20, fontSize: 14, lineHeight: 1.45, color: '#6b7280' }}>
          Selecione a categoria que melhor se encaixa no seu perfil.
        </p>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CATEGORIES.map(cat => {
            const selected = state.categoria === cat.value;
            const hl = cat.highlight ? highlightStyles[cat.highlight] : null;
            const baseBorder = selected ? '#c0392b' : (hl ? hl.border : '#eef0f4');
            return (
              <button key={cat.value}
                onClick={() => {
                  dispatch({ type: 'SET_FIELD', field: 'categoria', value: cat.value });
                  // Recalcula a simulação com a categoria (a taxa muda p/ SEM_COMPROVACAO).
                  const sim = simular(state.valor, state.parcelas, cat.value);
                  if (sim) dispatch({ type: 'SET_SIMULATION', payload: sim });
                  // Algumas categorias têm uma etapa extra antes dos documentos:
                  // garantia (tipo de bem) e servidor público (vínculo).
                  const proximoStep = cat.value === 'COM_GARANTIA' ? 6
                    : cat.value === 'SERVIDOR_PUBLICO' ? 11
                    : 4;
                  dispatch({ type: 'SET_STEP', step: proximoStep });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  background: hl ? hl.card : '#fff',
                  border: `${selected ? '2.5px' : '1.5px'} solid ${baseBorder}`,
                  boxShadow: '0 1px 3px rgba(13,43,94,0.06)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#0d2b5e'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = baseBorder; }}
              >
                <div style={{
                  minWidth: 46, width: 46, height: 46, borderRadius: '50%',
                  background: hl ? hl.icon : '#eef3fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {categoryIcons[cat.value]}
                </div>

                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15.5, color: '#0d2b5e' }}>{cat.label}</span>
                    {cat.badge && hl && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: hl.badgeBg, color: hl.badgeFg,
                      }}>{cat.badge}</span>
                    )}
                  </div>
                  {cat.description && (
                    <p style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.4, color: '#6b7280' }}>
                      {cat.description}
                    </p>
                  )}
                </div>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#9aa3b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0 }}>
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
