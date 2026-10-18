import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { simular } from '../hooks/useSimulation';
import { useModalidadePagamento } from '../hooks/useModalidadePagamento';
import { PARCELAS } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';

const MAX_PARCELAS = PARCELAS[PARCELAS.length - 1].value;

// Tema preto + amarelo.
const BG = '#0b0b0d';
const CARD = '#1b1b1f';
const LINE = '#333338';
const GOLD = '#f6c700';
const MUTED = '#9a9aa1';

export function Simulation() {
  const { state, dispatch } = useLoan();
  const [inputValue, setInputValue] = useState('');
  const [rendaInput, setRendaInput] = useState('');

  // O admin decide se o parcelamento fica disponível (painel → Configurações).
  // Indisponível: o campo "Como deseja pagar?" some e tudo roda em à vista, forçado.
  // Disponível: o seletor volta e o cliente escolhe entre à vista e parcelado, como antes.
  const parceladoDisponivel = useModalidadePagamento() === 'PARCELADO';
  const [modalidadeEscolhida, setModalidadeEscolhida] = useState<'VISTA' | 'PARCELADO'>('VISTA');
  const [modalidadeAberta, setModalidadeAberta] = useState(false);
  const modalidade = parceladoDisponivel ? modalidadeEscolhida : 'VISTA';

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

  const canCalc = state.valor > 0 && !!state.cidade.trim() && !!state.renda;

  const MODALIDADES = [
    { value: 'VISTA' as const, titulo: 'À vista', sub: 'Mais chance de aprovação' },
    { value: 'PARCELADO' as const, titulo: 'Parcelado', sub: `Até ${MAX_PARCELAS}x` },
  ];
  const modalidadeAtual = MODALIDADES.find(m => m.value === modalidade)!;

  // Linha de resumo: "Taxa: 30% • Prazo: até 30 dias" (à vista) ou com o valor da parcela (parcelado).
  const resumoLinha = preview && (
    preview.parcelas === 1
      ? `Taxa: ${preview.taxaJuros}% • Prazo: até 30 dias`
      : `Taxa: ${preview.taxaJuros}% • ${preview.parcelas}x de ${formatCurrency(preview.valorParcela)}`
  );

  return (
    <div style={{ padding: '18px 16px 26px', minHeight: '100vh', background: BG, colorScheme: 'dark' }}>
      {/* Topo: voltar + marca */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: 20 }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 0 })} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, flexShrink: 0, borderRadius: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
        }}>
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', marginLeft: -34 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: GOLD, letterSpacing: '-0.02em' }}>SP</span>{' '}
          <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '0.12em' }}>EMPRÉSTIMOS</span>
        </div>
      </div>

      <h1 style={{
        margin: '0 0 22px', fontSize: 'clamp(24px, 7.4vw, 32px)', fontWeight: 800,
        lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff', textAlign: 'center',
      }}>
        Você precisa de quanto?
      </h1>

      {/* Valor do empréstimo */}
      <label style={fieldLabel}>Valor do empréstimo</label>
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>R$</span>
          <span style={{ width: 1, height: 22, background: LINE, flexShrink: 0 }} />
          <input
            type="text" inputMode="numeric" placeholder="Digite o valor" spellCheck={false}
            value={displayValue}
            onChange={handleValueChange}
            className="dk-input"
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 17, fontWeight: 500, color: '#fff', padding: 0,
            }}
          />
        </div>
      </div>

      {/* Como deseja pagar: só aparece quando o admin habilita o parcelamento. Com
          parcelado indisponível, o campo some e tudo roda em à vista, forçado. */}
      {parceladoDisponivel && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Como deseja pagar?</h2>
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setModalidadeAberta(v => !v)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
              padding: '14px 16px', borderRadius: 14,
              background: 'rgba(246,199,0,0.08)', border: `1.5px solid ${GOLD}`,
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: GOLD,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: '#111',
              }}>$</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: '#fff' }}>{modalidadeAtual.titulo}</span>
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
                    onClick={() => { setModalidadeEscolhida(m.value); setModalidadeAberta(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
                      padding: '14px 16px', borderRadius: 14, background: CARD, border: `1.5px solid ${LINE}`,
                    }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      border: '2px solid #46464c', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: MUTED,
                    }}>$</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: '#fff' }}>{m.titulo}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, lineHeight: 1.3, color: MUTED }}>{m.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Cidade + renda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={fieldLabel}>Cidade</label>
          <div style={cardStyle}>
            <input type="text" placeholder="Digite sua cidade" autoComplete="address-level2"
              className="dk-input" maxLength={80}
              value={state.cidade}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'cidade', value: e.target.value })}
              onBlur={e => dispatch({ type: 'SET_FIELD', field: 'cidade', value: e.target.value.trim() })}
              style={{
                width: '100%', minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, fontWeight: 500, color: '#fff', padding: 0,
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={fieldLabel}>Renda mensal</label>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>R$</span>
              <span style={{ width: 1, height: 18, background: LINE, flexShrink: 0 }} />
              <input
                type="text" inputMode="numeric" placeholder="Sua renda" spellCheck={false}
                className="dk-input"
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
                  fontSize: 15, fontWeight: 500, color: '#fff', padding: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quantidade de parcelas */}
      {modalidade === 'PARCELADO' && (
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabel}>Parcelas</label>
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select value={state.parcelas}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'parcelas', value: Number(e.target.value) })}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, fontWeight: 500, color: '#fff', appearance: 'none',
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

      {/* Total a pagar */}
      {preview && (
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <p style={{ margin: 0, fontSize: 15, color: MUTED }}>Total a pagar</p>
          <p style={{
            margin: '2px 0 0', fontSize: 'clamp(30px, 9vw, 38px)', fontWeight: 800,
            color: GOLD, letterSpacing: '-0.01em',
          }}>
            {formatCurrency(preview.valorTotal)}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: MUTED }}>{resumoLinha}</p>
        </div>
      )}

      {/* Avisos por modalidade */}
      {modalidade === 'VISTA' && (
        <Aviso
          titulo="Precisa de mais prazo?"
          texto={preview
            ? `Pague ${formatCurrency(preview.valorTotal - preview.valorSolicitado)} de juros e renove por mais 30 dias.`
            : 'Pague os juros e renove por mais 30 dias.'}
        />
      )}
      {modalidade === 'PARCELADO' && (
        <Aviso
          titulo="Não aprovou no parcelado?"
          texto="Você ainda pode ser aprovado no à vista."
        />
      )}

      {/* CTA */}
      <button onClick={handleCalc} disabled={!canCalc} style={{
        width: '100%', padding: '18px', borderRadius: 14, border: 'none',
        background: GOLD, color: '#111', fontWeight: 800, fontSize: 17,
        cursor: canCalc ? 'pointer' : 'not-allowed', opacity: canCalc ? 1 : 0.4,
      }}>
        Solicitar empréstimo
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '13px 16px',
};

/** Opções das listas: fundo escuro e texto branco (a lista nativa abria branca, com texto claro). */
const optionStyle: React.CSSProperties = { background: CARD, color: '#fff' };

const fieldLabel: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 8,
};

/** Caixa de aviso: barra dourada à esquerda, título em branco e texto em cinza. */
function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 18, paddingLeft: 14,
      borderLeft: `3px solid ${GOLD}`,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: '#fff' }}>{titulo}</p>
        <p style={{ margin: '2px 0 0', fontSize: 13.5, lineHeight: 1.4, color: MUTED }}>{texto}</p>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}
