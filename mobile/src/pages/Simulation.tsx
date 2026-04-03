import { useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { useSimulation } from '../hooks/useSimulation';
import { CITIES } from '../constants/cities';
import { PARCELAS, RENDAS, CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';

export function Simulation() {
  const { state, dispatch } = useLoan();
  const { calculate } = useSimulation();
  const [inputValue, setInputValue] = useState('');

  const catLabel = CATEGORIES.find(c => c.value === state.categoria)?.label || 'CLT';

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 9) return;
    setInputValue(raw);
    const cents = parseInt(raw || '0', 10);
    const reais = cents / 100;
    dispatch({ type: 'SET_FIELD', field: 'valor', value: reais });
  };

  const displayValue = inputValue
    ? (parseInt(inputValue, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  const handleCalc = () => {
    if (state.valor <= 0 || !state.cidade || !state.renda) return;
    const sim = calculate(state.valor, state.parcelas);
    if (sim) {
      dispatch({ type: 'SET_SIMULATION', payload: sim });
      dispatch({ type: 'SET_STEP', step: 3 });
    }
  };

  const canCalc = state.valor > 0 && state.cidade && state.renda;

  return (
    <div style={{ padding: '24px 20px 24px', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 20px 24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d2b5e' }}>Simulação para {catLabel}</h1>
        </div>

        {/* Valor Desejado */}
        <label style={labelStyle}>Valor Desejado:</label>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '2px solid #d1d9e6', borderRadius: 12, overflow: 'hidden',
          marginBottom: 18,
        }}>
          <span style={{
            padding: '13px 14px', background: '#f0f3f8', fontWeight: 700,
            color: '#0d2b5e', fontSize: 16, borderRight: '2px solid #d1d9e6',
          }}>R$</span>
          <input
            type="text" inputMode="numeric" placeholder="0,00"
            value={displayValue}
            onChange={handleValueChange}
            style={{
              flex: 1, padding: '13px 12px', border: 'none', fontSize: 17,
              fontWeight: 600, color: '#1f2937', background: 'transparent',
            }}
          />
        </div>

        {/* Quantidade de Parcelas */}
        <label style={labelStyle}>Quantidade de Parcelas:</label>
        <div style={selectWrapper}>
          <select value={state.parcelas} onChange={e => dispatch({ type: 'SET_FIELD', field: 'parcelas', value: Number(e.target.value) })}
            style={selectStyle}>
            {PARCELAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <ChevronDown />
        </div>

        {/* Cidade */}
        <label style={labelStyle}>Cidade:</label>
        <div style={selectWrapper}>
          <select value={state.cidade} onChange={e => dispatch({ type: 'SET_FIELD', field: 'cidade', value: e.target.value })}
            style={{ ...selectStyle, color: state.cidade ? '#1f2937' : '#9ca3af' }}>
            <option value="">Selecione sua cidade</option>
            {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown />
        </div>

        {/* Sua Renda */}
        <label style={labelStyle}>Sua Renda:</label>
        <div style={selectWrapper}>
          <select value={state.renda} onChange={e => dispatch({ type: 'SET_FIELD', field: 'renda', value: e.target.value })}
            style={{ ...selectStyle, color: state.renda ? '#1f2937' : '#9ca3af' }}>
            <option value="">Selecione sua renda</option>
            {RENDAS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown />
        </div>

        {/* Calcular */}
        <button onClick={handleCalc} style={{
          width: '100%', padding: '16px', borderRadius: 12, border: 'none',
          background: canCalc ? '#0d2b5e' : '#b0bec5',
          color: '#fff', fontWeight: 700, fontSize: 17, cursor: canCalc ? 'pointer' : 'not-allowed',
          marginTop: 8,
        }}>Calcular Simulação</button>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8,
};
const selectWrapper: React.CSSProperties = {
  position: 'relative', marginBottom: 18,
};
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '13px 40px 13px 16px', border: '2px solid #d1d9e6',
  borderRadius: 12, fontSize: 16, fontWeight: 600, background: '#fff',
  appearance: 'none', cursor: 'pointer',
};
