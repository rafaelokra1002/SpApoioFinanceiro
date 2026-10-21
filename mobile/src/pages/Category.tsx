import { useState } from 'react';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { CATEGORIES } from '../constants/categories';
import { simular } from '../hooks/useSimulation';
import { CategoryType } from '../types';

// Tema escuro com dourado (mesma paleta da Home e da Simulação).
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#f6c700';
const MUTED = '#9aa8bf';

export function Category() {
  const { state, dispatch } = useLoan();
  const [aberto, setAberto] = useState(false);

  const atual = CATEGORIES.find(c => c.value === state.categoria);

  const escolher = (valor: CategoryType) => {
    dispatch({ type: 'SET_FIELD', field: 'categoria', value: valor });
    // Recalcula a simulação com a categoria.
    const sim = simular(state.valor, state.parcelas, valor);
    if (sim) dispatch({ type: 'SET_SIMULATION', payload: sim });
    // Algumas categorias têm uma etapa extra antes dos documentos:
    // garantia (tipo de bem) e servidor público (vínculo).
    const proximoStep = valor === 'COM_GARANTIA' ? 6
      : valor === 'SERVIDOR_PUBLICO' ? 11
      : 4;
    setAberto(false);
    dispatch({ type: 'SET_STEP', step: proximoStep });
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '18px 16px 26px', colorScheme: 'dark' }}>
      {/* Topo: voltar */}
      <button onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 4px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#fff', fontWeight: 500, fontSize: 17,
      }}>
        <ArrowLeft size={22} strokeWidth={2.2} />
        Voltar
      </button>

      <h1 style={{
        margin: '22px 0 22px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800,
        lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff',
      }}>
        Qual é seu tipo de renda?
      </h1>

      {/* Seletor: mostra a categoria atual, toque abre a lista completa abaixo */}
      <button onClick={() => setAberto(v => !v)} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 14,
        background: CARD, border: `1.5px solid ${aberto ? GOLD : LINE}`,
      }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, color: MUTED }}>Tipo de renda</span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {atual ? atual.label : 'Selecione'}
          </span>
        </span>
        <ChevronDown size={22} color={GOLD} strokeWidth={2.4}
          style={{ flexShrink: 0, transition: 'transform 0.15s', transform: aberto ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Lista completa, com a categoria atual destacada e marcada */}
      {aberto && (
        <div style={{
          marginTop: 10, borderRadius: 14, border: `1.5px solid ${LINE}`,
          background: CARD, overflow: 'hidden',
        }}>
          {CATEGORIES.map((cat, i) => {
            const selecionado = cat.value === state.categoria;
            return (
              <button key={cat.value} onClick={() => escolher(cat.value)} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', border: 'none',
                borderTop: i > 0 ? `1px solid ${LINE}` : 'none',
                background: selecionado ? 'rgba(246,199,0,0.1)' : 'transparent',
              }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 16.5, fontWeight: selecionado ? 700 : 500, color: '#fff' }}>
                    {cat.label}
                  </span>
                  {cat.description && (
                    <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, lineHeight: 1.35, color: MUTED }}>
                      {cat.description}
                    </span>
                  )}
                </span>
                {selecionado && <Check size={20} color={GOLD} strokeWidth={3} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
