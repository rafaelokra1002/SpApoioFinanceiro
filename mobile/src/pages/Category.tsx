import { useLoan } from '../context/LoanContext';
import { CATEGORIES } from '../constants/categories';

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
  SEM_COMPROVACAO: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="12" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <text x="11" y="23" fontSize="14" fontWeight="bold" fill="#0d2b5e">R$</text>
      <line x1="8" y1="8" x2="28" y2="28" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  COM_GARANTIA: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="10" y="14" width="16" height="14" rx="3" stroke="#0d2b5e" strokeWidth="1.8" fill="#e8effc"/>
      <path d="M14 14V11a4 4 0 018 0v3" stroke="#0d2b5e" strokeWidth="1.8"/>
      <circle cx="18" cy="21" r="2" fill="#0d2b5e"/>
    </svg>
  ),
};

export function Category() {
  const { state, dispatch } = useLoan();

  return (
    <div style={{ padding: '100px 20px 24px', minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(135deg, #0b1a6e 0%, #2546f0 40%, #0b1a6e 100%)' }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '28px 20px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header with back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 0 })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d2b5e' }}>Escolha a Categoria</h1>
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CATEGORIES.map(cat => {
            const selected = state.categoria === cat.value;
            return (
              <button key={cat.value}
                onClick={() => {
                  dispatch({ type: 'SET_FIELD', field: 'categoria', value: cat.value });
                  dispatch({ type: 'SET_STEP', step: 2 });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                  background: '#fff',
                  border: selected ? '2.5px solid #c0392b' : '1.5px solid #e5e7eb',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#0d2b5e'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                <div style={{
                  minWidth: 46, height: 46, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {categoryIcons[cat.value]}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#1f2937' }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
