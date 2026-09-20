import {
  ArrowLeft, Briefcase, ChevronRight, FileText, GraduationCap, HandCoins, Landmark,
  ShieldCheck, Store, User, type LucideIcon,
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { CATEGORIES } from '../constants/categories';
import { simular } from '../hooks/useSimulation';

// Tema escuro com dourado (mesma paleta da Home e da Simulação).
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#e0b96f';
const MUTED = '#9aa8bf';

/** Ícone de cada categoria (linha dourada). Inclui as categorias hoje ocultas, p/ quando forem reativadas. */
const categoryIcons: Record<string, LucideIcon> = {
  CARTEIRA_ASSINADA: Briefcase,
  CLT_SEM_REGISTRO: Store,
  AUTONOMO: User,
  BENEFICIARIO: HandCoins,
  ESTAGIARIO: GraduationCap,
  SERVIDOR_PUBLICO: Landmark,
  COM_GARANTIA: ShieldCheck,
  SEM_COMPROVACAO: FileText,
};

export function Category() {
  const { state, dispatch } = useLoan();

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '18px 16px 26px', colorScheme: 'dark' }}>
      {/* Topo: voltar + progresso (2ª etapa) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#fff', fontWeight: 500, fontSize: 17,
        }}>
          <ArrowLeft size={22} strokeWidth={2.2} />
          Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: MUTED }}>2 de 3</span>
          <span style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 28, height: 5, borderRadius: 3, background: GOLD }} />
            <span style={{ width: 28, height: 5, borderRadius: 3, background: GOLD }} />
            <span style={{ width: 28, height: 5, borderRadius: 3, background: LINE }} />
          </span>
        </div>
      </div>

      <h1 style={{
        margin: '22px 0 8px', fontSize: 'clamp(24px, 6.6vw, 36px)', fontWeight: 800,
        lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff',
      }}>
        Qual é seu tipo de renda?
      </h1>
      <p style={{ margin: '0 0 22px', fontSize: 15.5, lineHeight: 1.4, color: MUTED }}>
        Selecione a categoria que melhor se encaixa no seu perfil.
      </p>

      {/* Category List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CATEGORIES.map(cat => {
          const Icon = categoryIcons[cat.value] ?? Briefcase;
          return (
            <button key={cat.value}
              onClick={() => {
                dispatch({ type: 'SET_FIELD', field: 'categoria', value: cat.value });
                // Recalcula a simulação com a categoria.
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
                padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
                background: CARD, border: `1.5px solid ${LINE}`, textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.background = 'rgba(224,185,111,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = LINE;
                e.currentTarget.style.background = CARD;
              }}
            >
              <span style={{
                minWidth: 46, width: 46, height: 46, borderRadius: '50%', background: '#131d2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={23} color={GOLD} strokeWidth={1.7} />
              </span>

              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 16.5, color: '#fff' }}>{cat.label}</span>
                  {cat.badge && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: 'rgba(224,185,111,0.16)', color: GOLD,
                    }}>{cat.badge}</span>
                  )}
                </span>
                {cat.description && (
                  <span style={{ display: 'block', marginTop: 2, fontSize: 13, lineHeight: 1.35, color: MUTED }}>
                    {cat.description}
                  </span>
                )}
              </span>

              <ChevronRight size={20} color="#7d8aa0" strokeWidth={2.4} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
