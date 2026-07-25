import { ArrowLeft, ChevronRight, House, Car, Bike, Smartphone, Laptop, Package, Info, ShieldCheck } from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { BemGarantiaType } from '../types';

type BemCard = {
  value: BemGarantiaType;
  label: string;
  description: string;
  iconBg: string;
  icon: React.ReactNode;
};

const BENS: BemCard[] = [
  {
    value: 'IMOVEL',
    label: 'Imóvel',
    description: 'Casa, apartamento, sala comercial, terreno e outros imóveis.',
    iconBg: '#e6f6ec',
    icon: <House size={26} color="#128a4d" strokeWidth={1.8} />,
  },
  {
    value: 'VEICULO',
    label: 'Veículo e Moto',
    description: 'Carro de passeio, utilitário, caminhão, moto e outros.',
    iconBg: '#e8effc',
    icon: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Car size={22} color="#2546f0" strokeWidth={1.8} />
        <Bike size={16} color="#2546f0" strokeWidth={1.8} style={{ marginLeft: -3, marginBottom: -4 }} />
      </div>
    ),
  },
  {
    value: 'ELETRONICO',
    label: 'Eletrônicos e Celulares',
    description: 'Celulares, smartphones, notebooks, tablets, TVs, videogames e outros eletrônicos.',
    iconBg: '#f2eafc',
    icon: (
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Smartphone size={18} color="#7c3aed" strokeWidth={1.8} />
        <Laptop size={20} color="#7c3aed" strokeWidth={1.8} style={{ marginLeft: -2 }} />
      </div>
    ),
  },
  {
    value: 'OUTRO',
    label: 'Outros bens de valor',
    description: 'Obras de arte, equipamentos, maquinários, coleções e outros bens de valor não listados acima.',
    iconBg: '#f1f3f7',
    icon: <Package size={26} color="#4b5563" strokeWidth={1.8} />,
  },
];

export function Garantia() {
  const { state, dispatch } = useLoan();

  const escolher = (value: BemGarantiaType) => {
    dispatch({ type: 'SET_FIELD', field: 'bemGarantia', value });
    // Cada bem com tela própria de detalhes; os demais vão direto para documentos
    // (telas específicas serão plugadas aqui quando forem definidas).
    const steps: Partial<Record<BemGarantiaType, number>> = { IMOVEL: 7, VEICULO: 8, ELETRONICO: 9, OUTRO: 10 };
    dispatch({ type: 'SET_STEP', step: steps[value] ?? 4 });
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
          <ArrowLeft size={17} strokeWidth={2.5} />
          Voltar
        </button>
      </div>

      {/* Cartão branco subindo sobre a faixa azul */}
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0', marginTop: -28,
        position: 'relative', minHeight: '70vh', padding: '26px 20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: '#0d2b5e', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Qual bem você deseja oferecer como garantia?
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45, color: '#6b7280' }}>
              Selecione uma categoria para continuar.
            </p>
          </div>
          {/* Ilustração: escudo com os bens em garantia */}
          <img
            src="/garantia-hero.png"
            alt="Bens que podem ser oferecidos como garantia"
            style={{
              flexShrink: 0, width: 150, height: 'auto', display: 'block', marginTop: 2,
              filter: 'drop-shadow(0 8px 12px rgba(13,43,94,0.18))',
            }}
          />
        </div>

        {/* Lista de bens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {BENS.map(bem => {
            const selected = state.bemGarantia === bem.value;
            return (
              <button key={bem.value}
                onClick={() => escolher(bem.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  background: '#fff',
                  border: `${selected ? '2.5px' : '1.5px'} solid ${selected ? '#2546f0' : '#eef0f4'}`,
                  boxShadow: '0 1px 3px rgba(13,43,94,0.06)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#0d2b5e'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#eef0f4'; }}
              >
                <div style={{
                  minWidth: 52, width: 52, height: 52, borderRadius: '50%',
                  background: bem.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bem.icon}
                </div>

                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#0d2b5e' }}>{bem.label}</span>
                  <p style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.4, color: '#6b7280' }}>
                    {bem.description}
                  </p>
                </div>

                <ChevronRight size={20} color="#9aa3b2" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {/* Aviso do valor / retenção */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          marginTop: 16, padding: '14px 16px', borderRadius: 14,
          background: '#eef3fd', border: '1px solid #d5e0fb',
        }}>
          <Info size={20} color="#2546f0" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, lineHeight: 1.5, color: '#1e3a8a' }}>
            Empréstimo de até <strong>50% do valor do bem</strong>, com <strong>taxa reduzida</strong>.
            <br />O bem ficará <strong>retido como garantia</strong>.
          </p>
        </div>

        {/* Segurança dos documentos */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
          marginTop: 16, padding: '13px 16px', borderRadius: 14,
          background: '#f6f8fd', border: '1px solid #e8effc',
        }}>
          <ShieldCheck size={20} color="#2546f0" strokeWidth={1.9} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, lineHeight: 1.45, color: '#4b5563', textAlign: 'center' }}>
            Seus documentos são utilizados apenas para análise de crédito e estão protegidos com segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
