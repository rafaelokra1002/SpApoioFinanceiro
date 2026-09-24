import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { simular } from '../hooks/useSimulation';
import { useCities } from '../hooks/useCities';
import { PARCELAS } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';

const MAX_PARCELAS = PARCELAS[PARCELAS.length - 1].value;

// Tema escuro com dourado (mesma paleta da Home).
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#e0b96f';
const GOLD_DEEP = '#c9a05a';
const MUTED = '#9aa8bf';

export function Simulation() {
  const { state, dispatch } = useLoan();
  const cities = useCities();
  const [inputValue, setInputValue] = useState('');
  const [rendaInput, setRendaInput] = useState('');
  // `parcelas` no contexto começa com um valor padrão; à vista é sempre 1 parcela.
  const [modalidade, setModalidade] = useState<'VISTA' | 'PARCELADO'>('VISTA');
  const [modalidadeAberta, setModalidadeAberta] = useState(false);

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

  const numParcelas = modalidade === 'VISTA' ? 1 : state.parcelas;

  // Prévia recalculada a cada mudança; o mesmo cálculo é reaproveitado no envio.
  const preview = useMemo(
    () => (state.valor > 0 ? simular(state.valor, numParcelas, state.categoria) : null),
    [state.valor, numParcelas, state.categoria],
  );

  const handleCalc = () => {
    if (!canCalc || !preview) return;
    dispatch({ type: 'SET_FIELD', field: 'parcelas', value: numParcelas });
    dispatch({ type: 'SET_SIMULATION', payload: preview });
    // Simulação primeiro; agora o cliente escolhe a categoria.
    dispatch({ type: 'SET_STEP', step: 2 });
  };

  const canCalc = state.valor > 0 && !!state.cidade && !!state.renda;

  const MODALIDADES = [
    { value: 'VISTA' as const, titulo: 'À vista', sub: 'Mais chance de aprovação' },
    { value: 'PARCELADO' as const, titulo: 'Parcelado', sub: `Até ${MAX_PARCELAS}x` },
  ];
  const modalidadeAtual = MODALIDADES.find(m => m.value === modalidade)!;

  return (
    <div style={{ padding: '18px 16px 26px', minHeight: '100vh', background: BG, colorScheme: 'dark' }}>
      {/* Topo: voltar */}
      <button onClick={() => dispatch({ type: 'SET_STEP', step: 0 })} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 4px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#fff', fontWeight: 500, fontSize: 17,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>

      <h1 style={{
        margin: '22px 0 20px', fontSize: 'clamp(26px, 7.6vw, 38px)', fontWeight: 800,
        lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
      }}>
        Quanto você precisa?
      </h1>

      {/* Valor desejado */}
      <div style={{ ...cardStyle, padding: '14px 18px 16px', marginBottom: 22 }}>
        <label style={{ fontSize: 14, color: MUTED, display: 'block', marginBottom: 2 }}>Valor desejado</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>R$</span>
          <input
            type="text" inputMode="numeric" placeholder="0,00"
            value={displayValue}
            onChange={handleValueChange}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', padding: 0,
            }}
          />
        </div>
      </div>

      {/* Modalidade: seletor único (estilo dropdown) — toque abre a outra opção */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Como deseja pagar?</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setModalidadeAberta(v => !v)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
          padding: '14px 16px', borderRadius: 14,
          background: 'rgba(224,185,111,0.07)', border: `1.5px solid ${GOLD}`,
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: GOLD,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#111827',
          }}>$</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: '#fff' }}>{modalidadeAtual.titulo}</span>
            <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, lineHeight: 1.3, color: MUTED }}>{modalidadeAtual.sub}</span>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transition: 'transform 0.15s', transform: modalidadeAberta ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {modalidadeAberta && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODALIDADES.filter(m => m.value !== modalidade).map(m => (
              <button key={m.value}
                onClick={() => { setModalidade(m.value); setModalidadeAberta(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: 14, background: CARD, border: `1.5px solid ${LINE}`,
                }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  border: '2px solid #3a4863', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: MUTED,
                }}>$</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: '#fff' }}>{m.titulo}</span>
                  <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, lineHeight: 1.3, color: MUTED }}>{m.sub}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cidade + renda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
          <label style={fieldLabel}>Cidade</label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select value={state.cidade} onChange={e => dispatch({ type: 'SET_FIELD', field: 'cidade', value: e.target.value })}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: CARD,
                fontSize: 18, fontWeight: 500, appearance: 'none', cursor: 'pointer',
                padding: '0 24px 0 0', color: state.cidade ? '#fff' : '#c4cee0',
              }}>
              <option value="" style={optionStyle}>Selecione</option>
              {cities.map(c => <option key={c.value} value={c.value} style={optionStyle}>{c.label}</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
          <label style={fieldLabel}>Renda mensal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>R$</span>
            <input
              type="text" inputMode="numeric" placeholder="0,00"
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
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 18, fontWeight: 500, color: '#fff', padding: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Quantidade de parcelas */}
      {modalidade === 'PARCELADO' && (
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={fieldLabel}>Parcelas</label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select value={state.parcelas}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'parcelas', value: Number(e.target.value) })}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: CARD,
                fontSize: 18, fontWeight: 500, color: '#fff', appearance: 'none',
                cursor: 'pointer', padding: '0 26px 0 0',
              }}>
              {PARCELAS.map(p => (
                <option key={p.value} value={p.value} style={optionStyle}>{p.value}x</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      )}

      {/* Resumo do empréstimo */}
      {preview && (
        <div style={{
          background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 16,
          padding: '18px 18px 16px', marginBottom: 14,
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 700, color: '#fff' }}>Resumo</h3>

          <Linha label="Valor solicitado" valor={formatCurrency(preview.valorSolicitado)} />
          <Linha label="Taxa" valor={`${preview.taxaJuros}%`} />
          <Linha
            label={preview.parcelas === 1 ? 'Prazo' : 'Parcelas'}
            valor={preview.parcelas === 1 ? '30 dias' : `${preview.parcelas}x`}
          />
          {/* À vista, parcela e total são o mesmo valor — só mostra a parcela no parcelado. */}
          {preview.parcelas > 1 && (
            <Linha label="Valor da parcela" valor={formatCurrency(preview.valorParcela)} />
          )}

          <div style={{ height: 1, background: LINE, margin: '12px 0 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: GOLD }}>Total a pagar</span>
            <span style={{ fontSize: 23, fontWeight: 800, color: GOLD, letterSpacing: '-0.01em' }}>
              {formatCurrency(preview.valorTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Aviso do à vista */}
      {modalidade === 'VISTA' && (
        <Aviso
          titulo="Sem o valor total no vencimento?"
          texto="Pague os juros e renove por mais 30 dias."
        />
      )}

      {/* CTA */}
      <button onClick={handleCalc} disabled={!canCalc} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '19px', borderRadius: 14, border: 'none',
        background: `linear-gradient(180deg, #e8c885 0%, ${GOLD_DEEP} 100%)`,
        color: '#111827', fontWeight: 800, fontSize: 19,
        cursor: canCalc ? 'pointer' : 'not-allowed', opacity: canCalc ? 1 : 0.45,
      }}>
        Solicitar empréstimo
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '12px 16px 14px',
};

/** Opções das listas: fundo escuro e texto branco (a lista nativa abria branca, com texto claro). */
const optionStyle: React.CSSProperties = { background: CARD, color: '#fff' };

const fieldLabel: React.CSSProperties = {
  fontSize: 14, color: MUTED, display: 'block', marginBottom: 4,
};

/**
 * Caixa de aviso dourada: "!" + título na primeira linha e o texto embaixo, na largura
 * toda, sempre em UMA linha. A fonte do texto acompanha a largura do aviso (cqw) para
 * não quebrar nem estourar — o divisor 34 é a largura do texto em "em" (~32,5 com folga).
 */
function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div style={{ containerType: 'inline-size', marginBottom: 18 }}>
      <div style={{
        padding: '12px 14px 13px',
        background: 'rgba(224,185,111,0.06)', border: '1.5px solid rgba(224,185,111,0.45)', borderRadius: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${GOLD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={13} color={GOLD} strokeWidth={2.2} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{titulo}</span>
        </div>
        <div style={{
          marginTop: 7, whiteSpace: 'nowrap', color: '#d4dcea', lineHeight: 1.3,
          fontSize: 'clamp(8px, calc((100cqw - 36px) / 34), 13px)',
        }}>
          {texto}
        </div>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '5px 0' }}>
      <span style={{ fontSize: 16, color: '#c4cee0' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{valor}</span>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}
