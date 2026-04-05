import { useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { useSimulation } from '../hooks/useSimulation';
import { CITIES } from '../constants/cities';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';

export function Simulation() {
  const { state, dispatch } = useLoan();
  const { calculate } = useSimulation();
  const [inputValue, setInputValue] = useState('');
  const [rendaInput, setRendaInput] = useState('');

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
    const sim = calculate(state.valor, 1, state.categoria);
    if (sim) {
      dispatch({ type: 'SET_SIMULATION', payload: sim });
      dispatch({ type: 'SET_STEP', step: 3 });
    }
  };

  const rendaNum = rendaInput ? parseInt(rendaInput, 10) / 100 : 0;
  const valorMaiorQueRenda = state.valor > 0 && rendaNum > 0 && state.valor > rendaNum;
  const canCalc = state.valor > 0 && state.cidade && state.renda && !valorMaiorQueRenda;

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
          marginBottom: valorMaiorQueRenda ? 8 : 18,
        }}>
          <span style={{
            padding: '13px 14px', background: '#f0f3f8', fontWeight: 700,
            color: '#0d2b5e', fontSize: 16, borderRight: '2px solid #d1d9e6',
          }}>R$</span>
          <input
            type="text" inputMode="numeric" placeholder="Digite o valor desejado (R$)"
            value={displayValue}
            onChange={handleValueChange}
            style={{
              flex: 1, padding: '13px 12px', border: 'none', fontSize: 17,
              fontWeight: 600, color: '#1f2937', background: 'transparent',
            }}
          />
        </div>

        {/* Aviso valor > renda */}
        {valorMaiorQueRenda && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 18, padding: '4px 0',
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
              O valor solicitado deve ser menor que sua renda mensal
            </span>
          </div>
        )}

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

        {/* Renda Mensal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>💰</span>
          <label style={{ ...labelStyle, marginBottom: 0, fontWeight: 700 }}>Renda mensal</label>
        </div>
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
            type="text" inputMode="numeric" placeholder="Digite sua renda mensal (R$)"
            value={rendaInput
              ? (parseInt(rendaInput, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : ''}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '');
              if (raw.length > 9) return;
              setRendaInput(raw);
              const reais = parseInt(raw || '0', 10) / 100;
              dispatch({ type: 'SET_FIELD', field: 'renda', value: reais > 0 ? String(reais) : '' });
            }}
            style={{
              flex: 1, padding: '13px 12px', border: 'none', fontSize: 17,
              fontWeight: 600, color: '#1f2937', background: 'transparent',
            }}
          />
        </div>

        {/* Instagram */}
        <div style={{
          background: '#f0faf0', border: '2px solid #c8e6c9', borderRadius: 12,
          padding: '14px 16px', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#feda75"/>
                  <stop offset="25%" stopColor="#fa7e1e"/>
                  <stop offset="50%" stopColor="#d62976"/>
                  <stop offset="75%" stopColor="#962fbf"/>
                  <stop offset="100%" stopColor="#4f5bd5"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#igGrad)" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="5" stroke="url(#igGrad)" strokeWidth="2" fill="none"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="url(#igGrad)"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#374151' }}>Instagram</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>(opcional)</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#2e7d32' }}>Mais chances de aprovação!</span>
          </div>
          <input
            type="text" placeholder="@seuusuario (opcional)"
            value={state.instagram}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'instagram', value: e.target.value })}
            style={{
              width: '100%', padding: '12px 14px', border: '2px solid #d1d9e6',
              borderRadius: 10, fontSize: 16, fontWeight: 500, color: '#1f2937',
              background: '#fff', boxSizing: 'border-box',
            }}
          />
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
