import { useEffect } from 'react';
import { LoanProvider, useLoan } from './context/LoanContext';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { Simulation } from './pages/Simulation';
import { Result } from './pages/Result';
import { Documents } from './pages/Documents';
import { Confirmation } from './pages/Confirmation';
import { Garantia } from './pages/Garantia';
import { Imovel } from './pages/Imovel';
import { Veiculo } from './pages/Veiculo';
import { Eletronico } from './pages/Eletronico';
import { OutroBem } from './pages/OutroBem';
import { VinculoServidor } from './pages/VinculoServidor';
import { DOCUMENT_TYPES, CATEGORIES } from './constants/categories';
import { requestLocation } from './utils/geo';


/* ─── Como Funciona Modal ─── */

const FLUXO = [
  { n: 1, title: 'Simule', desc: 'Informe o valor, parcelas e seus dados.',
    icon: <path d="M5 3h9l5 5v13H5zM14 3v5h5M9 13h6M9 17h4"/> },
  { n: 2, title: 'Análise', desc: 'Analisamos suas informações com segurança.',
    icon: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2"/></> },
  { n: 3, title: 'Resultado', desc: 'Em até 24 horas, entramos em contato pelo WhatsApp com o resultado.',
    icon: <path d="M4.5 6c0-1 .8-2 1.8-2h1.6c.7 0 1.3.5 1.5 1.2l.7 2.6c.2.6 0 1.3-.5 1.7l-1.2 1a12 12 0 005.1 5.1l1-1.2c.4-.5 1.1-.7 1.7-.5l2.6.7c.7.2 1.2.8 1.2 1.5v1.6c0 1-1 1.8-2 1.8A14.5 14.5 0 014.5 6z"/> },
  { n: 4, title: 'Aprovação', desc: 'Após aprovado, coletamos a chave Pix e a data de pagamento para finalizar.',
    icon: <><path d="M12 3l8 3v6c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></> },
  { n: 5, title: 'Pagamento', desc: 'Confirmamos os dados e realizamos o pagamento.',
    icon: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.3.7-2.3 1.8 0 2.5 5 1.3 5 3.9 0 1.2-1 1.9-2.5 1.9-1.1 0-2.1-.5-2.7-1.3M12 6.5v11"/></> },
];

const APOS_APROVACAO = [
  'Informamos que sua solicitação foi aprovada.',
  'Enviamos um número para você entrar em contato.',
  'Você informa a data em que fará o pagamento.',
  'Enviamos o relatório com os valores e as condições.',
  'Após sua confirmação, solicitamos sua chave Pix.',
  'O valor é enviado via Pix.',
];

function ComoFuncionaModal() {
  const { dispatch } = useLoan();
  const fechar = () => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: false });

  return (
    <Modal onClose={fechar}>
      <h2 style={{ ...modalTitle, textAlign: 'center', fontSize: 24 }}>Como funciona?</h2>
      <p style={{ ...modalSubtitle, textAlign: 'center' }}>
        Simule e solicite seu empréstimo de forma simples, rápida e segura.
      </p>

      {/* Linha do tempo */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
        {FLUXO.map((s, i) => (
          <div key={s.n} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: '#2546f0', color: '#fff',
              fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 8px',
            }}>{s.n}</div>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #c9d4f5',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 8px', position: 'relative', zIndex: 1,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0"
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
            </div>
            {i < FLUXO.length - 1 && (
              <div style={{
                position: 'absolute', top: 52, left: '50%', width: '100%',
                borderTop: '1.5px dashed #c9d4f5', zIndex: 0,
              }} />
            )}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0d1836' }}>{s.title}</div>
            <p style={{ fontSize: 9.5, color: '#6b7280', lineHeight: 1.35, marginTop: 3 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Formas de pagamento */}
      <div style={{ ...infoCard, background: '#f6f8fd' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ ...infoIcon, background: '#2546f0' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>
            </svg>
          </div>
          <div>
            <h3 style={infoTitle}>Formas de pagamento</h3>
            <p style={infoDesc}>Escolha a opção que melhor se adapta a você.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PagamentoCard titulo="Parcelado" cor="#2546f0" selo="Mais flexibilidade" seloBg="#e2eaff" seloCor="#2546f0"
            desc="Você escolhe o número de parcelas que melhor se encaixa no seu bolso." />
          <PagamentoCard titulo="Mensal" cor="#2546f0" selo="Mais chance de aprovação" seloBg="#e6f7ec" seloCor="#12804a"
            desc="Pagamento em até 30 dias após o recebimento do valor." />
        </div>
      </div>

      {/* Perguntas rápidas */}
      <InfoLinha
        icon={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}
        titulo="Em quanto tempo recebo o resultado?"
        desc="Em até 24 horas entraremos em contato com você pelo WhatsApp."
        selo="Até 24h" seloBg="#e6f7ec" seloCor="#12804a"
      />
      <InfoLinha
        iconBg="#25d366" iconStroke="#fff"
        icon={<path d="M20.5 11.7a8.4 8.4 0 01-12.3 7.4L4 20.5l1.4-4.1a8.4 8.4 0 1115.1-4.7zM9 9.5c0 3 2.5 5.5 5.5 5.5"/>}
        titulo="Por onde recebo o resultado?"
        desc="O resultado da análise será enviado para o número de WhatsApp que você informou no cadastro."
        selo="WhatsApp" seloBg="#e6f7ec" seloCor="#12804a"
      />

      {/* Quem pode solicitar */}
      <div style={infoCard}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ ...infoIcon, background: '#eef3fd' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>
              <path d="M16 5.5a3 3 0 010 5M17.5 14c2.4.7 4 2.9 4 5.5"/>
            </svg>
          </div>
          <h3 style={{ ...infoTitle, flex: 1 }}>Quem pode solicitar?</h3>
          <span style={{ ...seloBase, background: '#e2eaff', color: '#2546f0' }}>Simplificado</span>
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, padding: '12px 14px',
          background: '#f6f8fd', border: '1px solid #e2e8f8', borderRadius: 12,
        }}>
          <RequisitoItem icon={<><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></>} texto="Ser maior de 15 anos" />
          <RequisitoItem icon={<><path d="M3 11l9-7 9 7"/><path d="M5.5 11.5V20h13v-8.5"/></>} texto="Residir na Bahia" />
          <RequisitoItem icon={<><circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></>} texto="Simples, rápido e seguro" />
        </div>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#2546f0', textAlign: 'center', marginTop: 10 }}>
          Aqui, a gente atende todo mundo!
        </p>
      </div>

      {/* Após a aprovação */}
      <div style={infoCard}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ ...infoIcon, background: '#2546f0' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 12.2l2.4 2.4 4.6-4.8"/><circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <h3 style={{ ...infoTitle, flex: 1 }}>Após a aprovação, o que acontece?</h3>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {APOS_APROVACAO.map((t, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <span style={{
                minWidth: 18, width: 18, height: 18, borderRadius: '50%', background: '#2546f0',
                color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.45 }}>{t}</span>
            </li>
          ))}
        </ol>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
          padding: '10px 14px', background: '#eefaf2', borderRadius: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12804a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#12804a' }}>Simples, rápido e seguro.</span>
        </div>
      </div>

      {/* Segurança */}
      <div style={{ ...infoCard, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...infoIcon, background: '#2546f0' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9V6z"/>
            <rect x="9.5" y="11" width="5" height="4.5" rx="1"/><path d="M10.5 11V9.8a1.5 1.5 0 013 0V11"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={infoTitle}>Segurança em primeiro lugar</h3>
          <p style={infoDesc}>Suas informações estão protegidas com criptografia de ponta a ponta e total sigilo.</p>
        </div>
      </div>

      <button onClick={() => { fechar(); dispatch({ type: 'SET_STEP', step: 1 }); }}
        style={{ ...modalBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ flex: 1, textAlign: 'center', paddingLeft: 26 }}>Fazer minha simulação</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M9 12h6M12.5 9l3 3-3 3"/>
        </svg>
      </button>
    </Modal>
  );
}

/* Estilos e peças reaproveitados pelo modal "Como funciona?" */
const infoCard: React.CSSProperties = {
  background: '#fff', border: '1px solid #eaedf4', borderRadius: 16,
  padding: '16px 16px 15px', marginBottom: 12,
};

const infoIcon: React.CSSProperties = {
  minWidth: 40, width: 40, height: 40, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const infoTitle: React.CSSProperties = { fontSize: 14.5, fontWeight: 700, color: '#0d1836' };
const infoDesc: React.CSSProperties = { fontSize: 12.5, color: '#6b7280', lineHeight: 1.45, marginTop: 3 };
const seloBase: React.CSSProperties = {
  padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap',
};

function InfoLinha({ icon, iconBg = '#eef3fd', iconStroke = '#2546f0', titulo, desc, selo, seloBg, seloCor }: {
  icon: React.ReactNode; iconBg?: string; iconStroke?: string;
  titulo: string; desc: string; selo: string; seloBg: string; seloCor: string;
}) {
  return (
    <div style={{ ...infoCard, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ ...infoIcon, background: iconBg }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={infoTitle}>{titulo}</h3>
        <p style={infoDesc}>{desc}</p>
      </div>
      <span style={{ ...seloBase, background: seloBg, color: seloCor }}>{selo}</span>
    </div>
  );
}

function PagamentoCard({ titulo, cor, desc, selo, seloBg, seloCor }: {
  titulo: string; cor: string; desc: string; selo: string; seloBg: string; seloCor: string;
}) {
  return (
    <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f8', borderRadius: 12, padding: '12px 12px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>
        </svg>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: cor }}>{titulo}</span>
      </div>
      <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.4, marginBottom: 9 }}>{desc}</p>
      <span style={{ ...seloBase, background: seloBg, color: seloCor, fontSize: 10.5, padding: '4px 9px' }}>{selo}</span>
    </div>
  );
}

function RequisitoItem({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2546f0"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{texto}</span>
    </div>
  );
}

/* ─── Documentos Necessários Modal ─── */
function DocumentosInfoModal() {
  const { dispatch } = useLoan();
  return (
    <Modal onClose={() => dispatch({ type: 'SHOW_MODAL', modal: 'documentosInfo', show: false })}>
      <h2 style={modalTitle}>Documentos Necessários</h2>
      <p style={modalSubtitle}>Veja os documentos para cada categoria.</p>
      {CATEGORIES.map(cat => {
        const docs = DOCUMENT_TYPES[cat.value] || [];
        const extraItems = cat.value === 'SEM_COMPROVACAO'
          ? ['Dados de renda: Trabalha com quê atualmente?']
          : [];
        return (
          <div key={cat.value} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d2b5e', marginBottom: 6 }}>{cat.label}</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {docs.map(d => (
                <li key={d.key} style={{ fontSize: 13, color: '#4b5563', marginBottom: 3 }}>{d.label}</li>
              ))}
              {extraItems.map(item => (
                <li key={item} style={{ fontSize: 13, color: '#4b5563', marginBottom: 3 }}>{item}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'documentosInfo', show: false })}
        style={modalBtn}>Entendi</button>
    </Modal>
  );
}

/* ─── Dúvidas Frequentes Modal ─── */
function DuvidasModal() {
  const { dispatch } = useLoan();
  const faqs = [
    { q: 'Qual o valor mínimo de empréstimo?', a: 'Não há valor mínimo: você simula o valor que precisar.' },
    { q: 'Qual a taxa de juros?', a: 'A taxa é de 30% ao mês para todas as categorias.' },
    { q: 'Em quanto tempo recebo o dinheiro?', a: 'Análise em menos de 24h. Aprovou, caiu na conta em minutos.' },
    { q: 'Preciso ter nome limpo?', a: 'Não necessariamente. Cada caso é analisado individualmente.' },
  ];
  return (
    <Modal onClose={() => dispatch({ type: 'SHOW_MODAL', modal: 'duvidas', show: false })}>
      <h2 style={modalTitle}>Dúvidas Frequentes</h2>
      {faqs.map((f, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d2b5e', marginBottom: 4 }}>{f.q}</h3>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{f.a}</p>
        </div>
      ))}
      <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'duvidas', show: false })}
        style={modalBtn}>Fechar</button>
    </Modal>
  );
}

/* ─── Modal wrapper ─── */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
        maxHeight: '85vh', overflow: 'auto', padding: '28px 24px',
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ─── Router ─── */
function Router() {
  const { state } = useLoan();
  switch (state.step) {
    case 0: return <Home />;
    case 1: return <Simulation />;
    case 2: return <Category />;
    case 3: return <Result />;
    case 4: return <Documents />;
    case 5: return <Confirmation />;
    case 6: return <Garantia />;
    case 7: return <Imovel />;
    case 8: return <Veiculo />;
    case 9: return <Eletronico />;
    case 10: return <OutroBem />;
    case 11: return <VinculoServidor />;
    default: return <Home />;
  }
}

export default function App() {
  return (
    <LoanProvider>
      <AppContent />
    </LoanProvider>
  );
}

function AppContent() {
  const { state, dispatch } = useLoan();

  // Pede a localização assim que o cliente acessa. Sem a permissão ele não
  // avança na solicitação (ver bloqueio na Home e no envio).
  useEffect(() => {
    requestLocation(dispatch);
  }, [dispatch]);

  return (
    <>
      <Router />
      {state.showComoFunciona && <ComoFuncionaModal />}
      {state.showDocumentosInfo && <DocumentosInfoModal />}
      {state.showDuvidas && <DuvidasModal />}
    </>
  );
}

const modalTitle: React.CSSProperties = {
  fontSize: 22, fontWeight: 800, color: '#0d2b5e', textAlign: 'center', marginBottom: 6,
};
const modalSubtitle: React.CSSProperties = {
  fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24,
};
const modalBtn: React.CSSProperties = {
  width: '100%', padding: '15px', borderRadius: 12, border: 'none',
  background: '#1a45e0', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  marginTop: 8,
};
