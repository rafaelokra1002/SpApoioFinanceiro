import { useMemo, useRef, useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { simular } from '../hooks/useSimulation';
import { CITIES } from '../constants/cities';
import { PARCELAS } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';

const MAX_PARCELAS = PARCELAS[PARCELAS.length - 1].value;

export function Simulation() {
  const { state, dispatch } = useLoan();
  const [inputValue, setInputValue] = useState('');
  const [rendaInput, setRendaInput] = useState('');
  // `parcelas` no contexto começa em 12; à vista é sempre 1 parcela.
  const [modalidade, setModalidade] = useState<'VISTA' | 'PARCELADO'>('VISTA');
  const valorRef = useRef<HTMLInputElement>(null);

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

  return (
    <div style={{ padding: '18px 16px 24px', minHeight: '100vh', background: '#f4f6fb' }}>
      <button onClick={() => dispatch({ type: 'SET_STEP', step: 0 })} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
        background: '#fff', border: '1.5px solid #2546f0',
        color: '#2546f0', fontWeight: 700, fontSize: 14, marginBottom: 18,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0d1836', letterSpacing: '-0.02em', marginBottom: 16 }}>
        Você precisa de <span style={{ color: '#2546f0' }}>quanto?</span>
      </h1>

      {/* Valor desejado */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <label style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 4 }}>Valor desejado</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#2546f0' }}>R$</span>
          <input
            ref={valorRef}
            type="text" inputMode="numeric" placeholder="0,00"
            value={displayValue}
            onChange={handleValueChange}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 30, fontWeight: 800, color: '#0d1836', letterSpacing: '-0.02em', padding: 0,
            }}
          />
          <button onClick={() => valorRef.current?.focus()} title="Editar valor" style={{
            minWidth: 42, width: 42, height: 42, borderRadius: 11, cursor: 'pointer',
            background: '#fff', border: '1.5px solid #c9d4f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20l4.5-1 10-10a2.1 2.1 0 00-3-3l-10 10z"/><path d="M14.5 6.5l3 3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Modalidade */}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d1836', marginBottom: 10 }}>Como deseja pagar?</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <ModalidadeCard
          ativo={modalidade === 'VISTA'} onClick={() => setModalidade('VISTA')}
          titulo="À vista" selo="Maior chance de aprovação"
        />
        <ModalidadeCard
          ativo={modalidade === 'PARCELADO'} onClick={() => setModalidade('PARCELADO')}
          titulo="Parcelado" selo={`Até ${MAX_PARCELAS}x`}
        />
      </div>

      {modalidade === 'PARCELADO' && (
        <div style={{
          display: 'flex', gap: 11, padding: '13px 15px', marginBottom: 18,
          background: '#f1f5fd', border: '1px solid #dde5f8', borderRadius: 14,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.9" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.5"/>
          </svg>
          <p style={{ fontSize: 13, color: '#41506e', lineHeight: 1.5, margin: 0 }}>
            Se o parcelado não for aprovado, você ainda pode ser aprovado no{' '}
            <strong style={{ color: '#2546f0' }}>crédito à vista</strong>, com uma análise mais flexível.
          </p>
        </div>
      )}

      {/* Cidade + renda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 12.5, color: '#6b7280', display: 'block', marginBottom: 4 }}>Cidade</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, position: 'relative' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" style={{ flexShrink: 0 }}>
              <path d="M12 21c4-4.5 6-7.7 6-10.5a6 6 0 10-12 0C6 13.3 8 16.5 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>
            </svg>
            <select value={state.cidade} onChange={e => dispatch({ type: 'SET_FIELD', field: 'cidade', value: e.target.value })}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14.5, fontWeight: 600, appearance: 'none', cursor: 'pointer',
                paddingRight: 18, color: state.cidade ? '#0d1836' : '#9ca3af',
              }}>
              <option value="">Selecione</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 12.5, color: '#6b7280', display: 'block', marginBottom: 4 }}>Renda mensal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#2546f0' }}>R$</span>
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
                fontSize: 15.5, fontWeight: 700, color: '#0d1836', padding: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Quantidade de parcelas */}
      {modalidade === 'PARCELADO' && (
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={{ fontSize: 12.5, color: '#6b7280', display: 'block', marginBottom: 4 }}>Em quantas parcelas?</label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select value={state.parcelas}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'parcelas', value: Number(e.target.value) })}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 16, fontWeight: 700, color: '#0d1836', appearance: 'none',
                cursor: 'pointer', paddingRight: 22,
              }}>
              {PARCELAS.map(p => (
                <option key={p.value} value={p.value}>
                  {p.value === 1 ? '1 parcela' : `${p.value} parcelas`}
                </option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      )}

      {/* Prévia */}
      {preview && (
        <div style={{
          background: '#fff', border: '1.5px solid #2546f0', borderRadius: 16,
          padding: '14px 16px 16px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: '#eef3fd',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>
              </svg>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#2546f0', letterSpacing: 0.4 }}>
              {modalidade === 'VISTA' ? 'EMPRÉSTIMO À VISTA' : 'EMPRÉSTIMO PARCELADO'}
            </span>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #eaedf4', paddingBottom: 12, marginBottom: 12 }}>
            <Resumo label="Valor solicitado" valor={formatCurrency(preview.valorSolicitado)} />
            <Resumo label="Taxa ao mês" valor={`${preview.taxaJuros}%`} divisor />
            <Resumo label="Prazo" valor={preview.parcelas === 1 ? '30 dias' : `${preview.parcelas} meses`} divisor />
          </div>

          <div style={{ display: 'flex' }}>
            {/* À vista, parcela e total são o mesmo valor — mostra só o total. */}
            {preview.parcelas > 1 && (
              <Destaque label="Valor da parcela" valor={formatCurrency(preview.valorParcela)} />
            )}
            <Destaque label="Valor total a pagar" valor={formatCurrency(preview.valorTotal)} />
          </div>
        </div>
      )}

      {/* CTA */}
      <button onClick={handleCalc} disabled={!canCalc} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '17px', borderRadius: 14, border: 'none',
        background: canCalc ? 'linear-gradient(135deg, #2546f0, #1a32c4)' : '#c3cbdd',
        color: '#fff', fontWeight: 800, fontSize: 17,
        cursor: canCalc ? 'pointer' : 'not-allowed',
        boxShadow: canCalc ? '0 6px 18px rgba(37,70,240,0.3)' : 'none',
      }}>
        <span style={{ flex: 1, textAlign: 'center', paddingLeft: 22 }}>Solicitar agora</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #e6e9f1', borderRadius: 14, padding: '12px 14px',
};

function ModalidadeCard({ ativo, onClick, titulo, selo }: {
  ativo: boolean; onClick: () => void; titulo: string; selo: string;
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer',
      background: ativo ? '#f5f8ff' : '#fff',
      border: `1.5px solid ${ativo ? '#2546f0' : '#e6e9f1'}`,
      borderRadius: 16, padding: '13px 13px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: ativo ? '#2546f0' : '#f0f2f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={ativo ? '#fff' : '#9aa3b2'} strokeWidth="1.8" strokeLinecap="round">
            <rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19"/>
          </svg>
        </div>
        {ativo ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#2546f0">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12.3l2.6 2.6 5.4-5.6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #d3d9e5' }} />
        )}
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0d1836', marginBottom: 6 }}>{titulo}</div>
      <span style={{
        display: 'inline-block', padding: '4px 9px', borderRadius: 7,
        background: ativo ? '#e2eaff' : '#f0f2f7',
        color: ativo ? '#2546f0' : '#6b7280',
        fontSize: 10.5, fontWeight: 600, lineHeight: 1.35,
      }}>{selo}</span>
    </button>
  );
}

function Resumo({ label, valor, divisor }: { label: string; valor: string; divisor?: boolean }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, textAlign: 'center',
      borderLeft: divisor ? '1px solid #eaedf4' : undefined,
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0d1836' }}>{valor}</div>
    </div>
  );
}

function Destaque({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
      <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#2546f0', letterSpacing: '-0.01em' }}>{valor}</div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}
