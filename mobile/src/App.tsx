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
