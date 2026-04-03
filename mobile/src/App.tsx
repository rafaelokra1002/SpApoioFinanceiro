import { LoanProvider, useLoan } from './context/LoanContext';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { Simulation } from './pages/Simulation';
import { Result } from './pages/Result';
import { Documents } from './pages/Documents';
import { Confirmation } from './pages/Confirmation';
import { DOCUMENT_TYPES, CATEGORIES } from './constants/categories';

/* ─── Shared Header ─── */
function Header() {
  const { state } = useLoan();
  // On home page the header is part of the blue gradient, so skip it
  if (state.step === 0) return null;

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0a1f4a 0%, #0d2b5e 50%, #163a7a 100%)',
      color: '#fff', padding: '14px 18px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="18" width="5" height="10" rx="1" fill="#fff" opacity="0.7"/>
          <rect x="10" y="12" width="5" height="16" rx="1" fill="#fff" opacity="0.85"/>
          <rect x="17" y="6" width="5" height="22" rx="1" fill="#fff"/>
          <path d="M5 16L12 10L19 5L26 2" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>SP Apoio</div>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Financeiro</div>
        </div>
      </div>
      <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </header>
  );
}

/* ─── Home Header (blue gradient, integrated) ─── */
function HomeHeader() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #0a1f4a 0%, #0d2b5e 80%)',
      color: '#fff', padding: '14px 18px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="18" width="5" height="10" rx="1" fill="#fff" opacity="0.7"/>
          <rect x="10" y="12" width="5" height="16" rx="1" fill="#fff" opacity="0.85"/>
          <rect x="17" y="6" width="5" height="22" rx="1" fill="#fff"/>
          <path d="M5 16L12 10L19 5L26 2" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>SP Apoio</div>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Financeiro</div>
        </div>
      </div>
      <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </header>
  );
}

/* ─── Como Funciona Modal ─── */
function ComoFuncionaModal() {
  const { dispatch } = useLoan();
  const steps = [
    { n: 1, title: 'Escolha sua Categoria', desc: 'Selecione o tipo de empréstimo que melhor se encaixa no seu perfil.' },
    { n: 2, title: 'Simule seu Empréstimo', desc: 'Informe o valor, parcelas, cidade e renda para ver as condições.' },
    { n: 3, title: 'Envie seus Dados', desc: 'Se estiver de acordo, envie seus documentos e aguarde nossa análise.' },
  ];
  return (
    <Modal onClose={() => dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: false })}>
      <h2 style={modalTitle}>Como Funciona</h2>
      <p style={modalSubtitle}>Veja como é fácil simular e solicitar um empréstimo.</p>
      {steps.map(s => (
        <div key={s.n} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={stepCircle}>{s.n}</div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d2b5e', marginBottom: 3 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        </div>
      ))}
      <button onClick={() => { dispatch({ type: 'SHOW_MODAL', modal: 'comoFunciona', show: false }); dispatch({ type: 'SET_STEP', step: 1 }); }}
        style={modalBtn}>Fazer Simulação</button>
    </Modal>
  );
}

/* ─── Documentos Necessários Modal ─── */
function DocumentosInfoModal() {
  const { dispatch } = useLoan();
  return (
    <Modal onClose={() => dispatch({ type: 'SHOW_MODAL', modal: 'documentosInfo', show: false })}>
      <h2 style={modalTitle}>Documentos Necessários</h2>
      <p style={modalSubtitle}>Veja os documentos para cada categoria.</p>
      {CATEGORIES.slice(0, 5).map(cat => {
        const docs = DOCUMENT_TYPES[cat.value] || [];
        return (
          <div key={cat.value} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d2b5e', marginBottom: 6 }}>{cat.label}</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {docs.map(d => (
                <li key={d.key} style={{ fontSize: 13, color: '#4b5563', marginBottom: 3 }}>{d.label}</li>
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
    { q: 'Qual o valor mínimo de empréstimo?', a: 'O valor mínimo é de R$ 300,00.' },
    { q: 'Qual a taxa de juros?', a: 'A taxa é de 30% ao mês sobre o valor solicitado.' },
    { q: 'Em quanto tempo recebo o dinheiro?', a: 'Após aprovação, o dinheiro é liberado em até 24 horas.' },
    { q: 'Preciso ter nome limpo?', a: 'Não necessariamente. Cada caso é analisado individualmente.' },
    { q: 'Como faço para renovar?', a: 'Selecione a categoria "Renovação" e faça uma nova simulação.' },
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
    case 1: return <Category />;
    case 2: return <Simulation />;
    case 3: return <Result />;
    case 4: return <Documents />;
    case 5: return <Confirmation />;
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
  const { state } = useLoan();
  return (
    <>
      {state.step === 0 ? <HomeHeader /> : <Header />}
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
const stepCircle: React.CSSProperties = {
  minWidth: 34, height: 34, borderRadius: '50%',
  background: '#0d2b5e', color: '#fff', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15,
};
const modalBtn: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
  background: '#0d2b5e', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  marginTop: 8,
};
