import React, { useState, useRef } from 'react';
import { useLoan } from '../context/LoanContext';
import { CATEGORIES, DOCUMENT_TYPES } from '../constants/categories';
import { submitLeadWithDocuments } from '../services/api';
import { UploadedFile } from '../types';

type OrigemKey = 'PANFLETO' | 'INSTAGRAM' | 'INDICACAO';

/**
 * Opções de "Como você conheceu a SP?".
 * `toIndicacao` monta o texto salvo no campo livre `indicacao` — o admin classifica
 * a origem por palavra-chave, então "Instagram"/"Panfleto" precisam aparecer no texto.
 */
const ORIGENS: {
  key: OrigemKey; label: string; description: string;
  pedeNome: boolean; iconBg: string; icon: React.ReactNode;
  toIndicacao: (nome: string) => string;
}[] = [
  {
    key: 'PANFLETO', label: 'Panfleto',
    description: 'Você conheceu a SP por meio de panfleto.',
    pedeNome: false, iconBg: '#eef3fd',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" strokeLinecap="round">
        <rect x="5" y="3" width="14" height="18" rx="2" fill="#e8effc"/>
        <path d="M9 8h6M9 12h6M9 16h3"/>
      </svg>
    ),
    toIndicacao: () => 'Panfleto',
  },
  {
    key: 'INSTAGRAM', label: 'Instagram, página ou blogueira',
    description: 'Digite o nome do perfil, página ou blogueira.',
    pedeNome: true, iconBg: '#fdeef5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="igGradOrigem" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75"/><stop offset="25%" stopColor="#fa7e1e"/>
            <stop offset="50%" stopColor="#d62976"/><stop offset="75%" stopColor="#962fbf"/>
            <stop offset="100%" stopColor="#4f5bd5"/>
          </linearGradient>
        </defs>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#igGradOrigem)" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="4.5" stroke="url(#igGradOrigem)" strokeWidth="2" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.4" fill="url(#igGradOrigem)"/>
      </svg>
    ),
    toIndicacao: nome => `Instagram: ${nome}`,
  },
  {
    key: 'INDICACAO', label: 'Indicação de amigo ou colega',
    description: 'Digite o nome da pessoa que indicou.',
    pedeNome: true, iconBg: '#e6f6ec',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#128a4d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.2"/>
        <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>
        <path d="M16 5.5a3.2 3.2 0 010 5.4M17.5 14c2.4.7 4 2.9 4 5.5"/>
      </svg>
    ),
    toIndicacao: nome => nome,
  },
];

const backButtonStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
  background: '#fff', border: '1.5px solid #2546f0',
  color: '#2546f0', fontWeight: 700, fontSize: 14, marginBottom: 18,
};

const docCardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: '16px 16px 15px',
  boxShadow: '0 2px 10px rgba(13,43,94,0.07)',
};

const docActionStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
  background: '#fff', border: '1.5px solid', fontWeight: 700, fontSize: 14,
};

/** Campo complementar do passo 2: ícone à esquerda, rótulo e input à direita. */
function ExtraField({ icon, iconBg, label, optional, placeholder, value, onChange }: {
  icon: React.ReactNode; iconBg: string; label: string; optional?: boolean;
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        minWidth: 40, width: 40, height: 40, borderRadius: 12, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 18,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#4b5563', marginBottom: 5 }}>
          {label}{optional && <span style={{ color: '#9aa3b2', fontWeight: 500 }}> (opcional)</span>}
        </label>
        <input type="text" placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '11px 13px', borderRadius: 10,
            border: '1.5px solid #e5e7eb', fontSize: 14, color: '#1f2937',
            background: '#fff', boxSizing: 'border-box', outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#2546f0')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
};

const fieldBox: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '13px 14px', borderRadius: 12,
  border: '1.5px solid #e5e7eb', background: '#fff',
};

const fieldInput: React.CSSProperties = {
  flex: 1, minWidth: 0, border: 'none', fontSize: 15,
  color: '#1f2937', background: 'transparent', outline: 'none',
};

/** Aba do topo no formato de seta (a ativa "aponta" para a próxima). */
function StepTab({ n, label, active, arrow }: {
  n: number; label: string; active: boolean; arrow?: boolean;
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
      padding: '16px 14px 16px 20px',
      background: active ? '#2546f0' : '#f1f4f9',
      clipPath: arrow ? 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)' : undefined,
      marginRight: arrow ? -8 : 0,
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 26, width: 26, height: 26, borderRadius: '50%',
        background: active ? '#fff' : '#dfe4ee',
        color: active ? '#2546f0' : '#8a93a5',
        fontSize: 13, fontWeight: 800,
      }}>{n}</span>
      <span style={{
        fontSize: 13.5, fontWeight: 700,
        color: active ? '#fff' : '#8a93a5',
      }}>{label}</span>
    </div>
  );
}

export function Documents() {
  const { state, dispatch } = useLoan();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [docStep, setDocStep] = useState(1); // 1 = dados pessoais, 2 = documentos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState('');
  const [showTip, setShowTip] = useState<string | null>(null);
  const [origem, setOrigem] = useState<OrigemKey>('PANFLETO');
  const [origemNome, setOrigemNome] = useState('');

  const docs = DOCUMENT_TYPES[state.categoria] || DOCUMENT_TYPES['CARTEIRA_ASSINADA'];
  const categoriaLabel = CATEGORIES.find(c => c.value === state.categoria)?.label || '';

  // O rótulo do campo de renda muda conforme a categoria escolhida.
  const rendaLabel = state.categoria === 'AUTONOMO' ? 'Dados da atividade'
    : state.categoria === 'BENEFICIARIO' ? 'Informações do benefício'
    : state.categoria === 'ESTAGIARIO' ? 'Dados do estágio'
    : state.categoria === 'SEM_COMPROVACAO' ? 'Dados de renda'
    : 'Dados do trabalho';
  const rendaPlaceholder = state.categoria === 'AUTONOMO' ? 'Profissão ou tipo de serviço'
    : state.categoria === 'BENEFICIARIO' ? 'Tipo de benefício recebido'
    : state.categoria === 'SEM_COMPROVACAO' ? 'Você trabalha com o quê?'
    : 'Nome da empresa e bairro onde trabalha';

  const openFilePicker = (docKey: string) => {
    setCurrentDocKey(docKey);
    fileInputRef.current?.click();
  };

  const openGallery = (docKey: string) => {
    setCurrentDocKey(docKey);
    galleryInputRef.current?.click();
  };

  const openPdfPicker = (docKey: string) => {
    setCurrentDocKey(docKey);
    pdfInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = '';
    if (!raw || !currentDocKey) return;
    // Comprime fotos antes de guardar (evita "File too large" e agiliza o upload).
    const file = await compressImage(raw);
    const preview = file.type === 'application/pdf' ? '' : URL.createObjectURL(file);
    dispatch({ type: 'SET_DOCUMENT', key: currentDocKey, file: { file, preview } });
  };

  const handleSubmit = async () => {
    if (!state.nome || !state.telefone) {
      setError('Preencha nome e telefone.');
      return;
    }
    const missing = docs.filter(d => !state.documents[d.key]);
    if (missing.length > 0) {
      setError('Envie todos os documentos obrigatórios.');
      return;
    }
    setError('');
    setSubmitting(true);

    const leadData = {
      nome: state.nome,
      telefone: state.telefone.replace(/\D/g, ''),
      cpf: state.cpf || undefined,
      email: state.email || undefined,
      instagram: state.instagram || undefined,
      valorSolicitado: state.valor,
      valorTotal: state.simulation?.valorTotal || state.valor * 1.3,
      parcelas: state.parcelas,
      valorParcela: state.simulation?.valorParcela || 0,
      cidade: state.cidade,
      perfil: state.categoria,
      renda: state.renda,
      nomeEmpresa: state.nomeEmpresa || undefined,
      bairroTrabalho: state.bairroTrabalho || undefined,
      indicacao: state.indicacao || undefined,
      endereco: state.endereco || undefined,
      cep: state.cep || undefined,
      enderecoTrabalho: state.enderecoTrabalho || undefined,
      observacao: state.observacao || undefined,
      latitude: state.latitude ?? undefined,
      longitude: state.longitude ?? undefined,
    };

    const docFiles = Object.entries(state.documents)
      .filter(([, v]) => v !== null)
      .map(([tipo, v]) => ({ tipo, file: (v as UploadedFile).file }));

    const res = await submitLeadWithDocuments(leadData, docFiles);
    setSubmitting(false);
    if (res.success) {
      dispatch({ type: 'SET_STEP', step: 5 });
    } else {
      setError(res.error || 'Erro ao enviar. Tente novamente.');
    }
  };

  const docIcons: Record<string, React.ReactNode> = {
    '🪪': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" fill="#e8effc"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 13h3"/></svg>,
    '📷': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.5"><rect x="2" y="6" width="20" height="14" rx="2" fill="#e8effc"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1-3h6l1 3"/></svg>,
    '🏠': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.5"><path d="M3 12l9-8 9 8" fill="#e8effc"/><path d="M5 12v8h14v-8"/></svg>,
    '💼': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.5"><rect x="3" y="8" width="18" height="12" rx="2" fill="#e8effc"/><path d="M8 8V6a4 4 0 018 0v2"/></svg>,
    '📄': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2" fill="#e8effc"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>,
  };

  const voltar = () => { if (docStep === 2) setDocStep(1); else dispatch({ type: 'SET_STEP', step: 2 }); };

  return (
    <div style={{
      padding: docStep === 1 ? '45px 20px 24px' : 0,
      minHeight: '100vh',
      background: docStep === 1
        ? 'linear-gradient(135deg, #cce0ff 0%, #ddeaff 40%, #cce0ff 100%)'
        : '#f4f6fb',
    }}>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" capture="environment"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={galleryInputRef} type="file" accept="image/*,.pdf,application/pdf"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf"
        onChange={handleFileSelect} style={{ display: 'none' }} />

      {docStep === 1 ? (
        <div style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '28px 20px 24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}>
          {/* Step indicator (abas em seta) */}
          <div style={{ display: 'flex', margin: '-28px -20px 20px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <StepTab n={1} label="Seus dados" active arrow />
            <StepTab n={2} label="Enviar documentos" active={false} />
          </div>

          <button onClick={voltar} style={backButtonStyle}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0d1836', letterSpacing: '-0.02em' }}>
            Vamos começar! 🚀
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 22 }}>
            Preencha suas informações para continuarmos.
          </p>

            {/* Step 1: Personal Data */}
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Nome completo</label>
              <div style={fieldBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
                </svg>
                <input type="text" placeholder="Digite seu nome completo"
                  value={state.nome}
                  onChange={e => dispatch({ type: 'SET_FIELD', field: 'nome', value: e.target.value })}
                  style={fieldInput}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>WhatsApp</label>
              <div style={fieldBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <input type="text" inputMode="tel" placeholder="(11) 99999-9999"
                  value={state.telefone}
                  onChange={e => {
                    const c = e.target.value.replace(/\D/g, '');
                    let fmt = c;
                    if (c.length > 2) fmt = `(${c.slice(0,2)}) ${c.slice(2)}`;
                    if (c.length > 7) fmt = `(${c.slice(0,2)}) ${c.slice(2,7)}-${c.slice(7,11)}`;
                    dispatch({ type: 'SET_FIELD', field: 'telefone', value: fmt });
                  }}
                  style={fieldInput}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <label style={fieldLabel}>Instagram (opcional)</label>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: '#2546f0' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>
                  </svg>
                  Aumenta a chance de aprovação
                </span>
              </div>
              <div style={fieldBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igGradDoc" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#feda75"/><stop offset="25%" stopColor="#fa7e1e"/>
                      <stop offset="50%" stopColor="#d62976"/><stop offset="75%" stopColor="#962fbf"/>
                      <stop offset="100%" stopColor="#4f5bd5"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#igGradDoc)" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="5" stroke="url(#igGradDoc)" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="url(#igGradDoc)"/>
                </svg>
                <input type="text" placeholder="Digite seu Instagram (opcional)"
                  value={state.instagram}
                  onChange={e => dispatch({ type: 'SET_FIELD', field: 'instagram', value: e.target.value })}
                  style={fieldInput}
                />
              </div>
            </div>

            {/* Como conheceu a SP */}
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1836', marginTop: 26 }}>
              Como você conheceu a SP?
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 12 }}>
              Escolha uma opção e informe o nome, quando necessário.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
              {ORIGENS.map(op => {
                const active = origem === op.key;
                return (
                  <div key={op.key}
                    onClick={() => { setOrigem(op.key); if (!op.pedeNome) setOrigemNome(''); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
                      background: active ? '#f6f8ff' : '#fff',
                      border: `1.5px solid ${active ? '#2546f0' : '#eef0f4'}`,
                      boxShadow: '0 1px 3px rgba(13,43,94,0.06)',
                      transition: 'all 0.15s',
                    }}>
                    <span style={{
                      marginTop: 2, minWidth: 18, width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${active ? '#2546f0' : '#c6ccd8'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2546f0' }} />}
                    </span>
                    <div style={{
                      minWidth: 38, width: 38, height: 38, borderRadius: '50%', background: op.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{op.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0d1836' }}>{op.label}</div>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{op.description}</p>
                      {op.pedeNome && active && (
                        <input type="text" placeholder="Digite o nome"
                          autoFocus
                          value={origemNome}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setOrigemNome(e.target.value)}
                          style={{
                            width: '100%', marginTop: 10, padding: '10px 12px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', fontSize: 14, color: '#1f2937',
                            background: '#fff', boxSizing: 'border-box', outline: 'none',
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <button onClick={() => {
              if (!state.nome || !state.telefone) {
                setError('Preencha nome e WhatsApp para continuar.');
                return;
              }
              const op = ORIGENS.find(o => o.key === origem);
              if (op?.pedeNome && !origemNome.trim()) {
                setError('Informe o nome para a opção escolhida.');
                return;
              }
              // `indicacao` é texto livre; o admin deriva a origem por palavra-chave.
              dispatch({ type: 'SET_FIELD', field: 'indicacao', value: op ? op.toIndicacao(origemNome.trim()) : '' });
              setError('');
              setDocStep(2);
            }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #2546f0, #1a32c4)',
              color: '#fff', fontWeight: 800, fontSize: 17, cursor: 'pointer',
              marginTop: 18, boxShadow: '0 4px 14px rgba(37,70,240,0.3)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
              </svg>
              <span style={{ flex: 1 }}>Continuar</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
        </div>
      ) : (
        <>
          {/* Step 2: cabeçalho azul */}
          <div style={{ background: '#1a45e0', padding: '18px 18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={voltar} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 15px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.45)',
                color: '#fff', fontWeight: 700, fontSize: 14,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
              <div style={{ flex: 1, minWidth: 170 }}>
                <h1 style={{ fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                  Envio de documentos
                </h1>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
                  Envie os documentos para solicitar seu empréstimo.
                </p>
              </div>
              {categoriaLabel && (
                <span style={{
                  padding: '7px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                }}>Categoria: {categoriaLabel}</span>
              )}
            </div>
          </div>

          <div style={{ padding: '0 14px 100px', marginTop: -8 }}>
            {/* Cards de documento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {docs.map(doc => {
                const uploaded = state.documents[doc.key];
                const isPdfOnly = doc.key.toLowerCase().includes('carteira de trabalho');
                const podePdf = !doc.key.toLowerCase().includes('rg ou cnh') && !doc.key.toLowerCase().includes('selfie');
                const temDica = doc.key === 'Comprovante de residência';
                return (
                  <div key={doc.key} style={docCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        minWidth: 46, width: 46, height: 46, borderRadius: 14, background: '#eef3fd',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{docIcons[doc.icon] || docIcons['📄']}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontWeight: 700, fontSize: 16, color: '#0d1836' }}>{doc.label}</span>
                          {temDica && (
                            <button onClick={() => setShowTip(showTip === doc.key ? null : doc.key)}
                              title="Sobre o comprovante" style={{
                                width: 19, height: 19, borderRadius: '50%', border: '1.5px solid #2546f0',
                                background: '#fff', color: '#2546f0', fontSize: 11, fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 0, flexShrink: 0,
                              }}>?</button>
                          )}
                        </div>
                        {doc.description !== doc.label && (
                          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{doc.description}</p>
                        )}
                      </div>

                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
                        padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: uploaded ? '#e6f7ec' : '#fff4e5',
                        color: uploaded ? '#12804a' : '#b45309',
                      }}>
                        {uploaded ? 'Enviado' : 'Pendente'}
                        {uploaded ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5 5-5"/>
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>
                          </svg>
                        )}
                      </span>
                    </div>

                    {temDica && showTip === doc.key && (
                      <div style={{
                        display: 'flex', gap: 10, marginTop: 12, padding: '12px 14px',
                        background: '#eef3fd', border: '1px solid #d5e0fb', borderRadius: 12,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10"/><path d="M12 11v5M12 7.5v.5"/>
                        </svg>
                        <p style={{ fontSize: 13, color: '#334063', lineHeight: 1.5, margin: 0 }}>
                          O comprovante de residência não precisa estar em seu nome, mas você precisa morar na residência que enviar.
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                      {uploaded ? (
                        <>
                          <button onClick={() => dispatch({ type: 'SET_DOCUMENT', key: doc.key, file: null })}
                            style={{ ...docActionStyle, borderColor: '#e2e5ec', color: '#4b5563' }}>
                            Excluir
                          </button>
                          <button onClick={() => (isPdfOnly ? openPdfPicker(doc.key) : openGallery(doc.key))}
                            style={{ ...docActionStyle, borderColor: '#2546f0', color: '#2546f0' }}>
                            Enviar novamente
                          </button>
                        </>
                      ) : isPdfOnly ? (
                        <button onClick={() => openPdfPicker(doc.key)} style={{ ...docActionStyle, borderColor: '#f0c8c2', color: '#c0392b' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>
                          </svg>
                          PDF
                        </button>
                      ) : (
                        <>
                          <button onClick={() => openFilePicker(doc.key)} style={{ ...docActionStyle, borderColor: '#c9d4f5', color: '#2546f0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1-3h6l1 3"/>
                            </svg>
                            Foto
                          </button>
                          <button onClick={() => openGallery(doc.key)} style={{ ...docActionStyle, borderColor: '#c9d4f5', color: '#2546f0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                            </svg>
                            Galeria
                          </button>
                          {podePdf && (
                            <button onClick={() => openPdfPicker(doc.key)} style={{ ...docActionStyle, borderColor: '#f0c8c2', color: '#c0392b' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>
                              </svg>
                              PDF
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Campos complementares */}
            <div style={{ ...docCardStyle, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ExtraField
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igGradExtra" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#feda75"/><stop offset="25%" stopColor="#fa7e1e"/>
                      <stop offset="50%" stopColor="#d62976"/><stop offset="75%" stopColor="#962fbf"/>
                      <stop offset="100%" stopColor="#4f5bd5"/>
                    </linearGradient>
                  </defs>
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#igGradExtra)" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="4.5" stroke="url(#igGradExtra)" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.4" fill="url(#igGradExtra)"/>
                </svg>}
                iconBg="#fdeef5" label="Instagram" placeholder="@ do perfil"
                value={state.instagram}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'instagram', value: v })}
              />

              <ExtraField
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="8" width="18" height="12" rx="2.5" fill="#e8effc"/><path d="M8 8V6a4 4 0 018 0v2"/>
                </svg>}
                iconBg="#eef3fd" label={rendaLabel} placeholder={rendaPlaceholder}
                value={state.bairroTrabalho}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })}
              />

              <ExtraField
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2546f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20l4.5-1 10-10a2.1 2.1 0 00-3-3l-10 10z"/><path d="M14.5 6.5l3 3"/>
                </svg>}
                iconBg="#eef3fd" label="Algo a acrescentar?" optional
                placeholder="Se quiser, escreva uma observação para ajudar na análise."
                value={state.observacao}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'observacao', value: v })}
              />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}
          </div>

          {/* CTA fixo no rodapé */}
          <div style={{
            position: 'sticky', bottom: 0, padding: '12px 14px 16px',
            background: 'linear-gradient(to top, #f4f6fb 70%, rgba(244,246,251,0))',
          }}>
            {submitting ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '17px', borderRadius: 14, background: '#1a45e0', color: '#fff',
                fontWeight: 800, fontSize: 16,
              }}>
                <div style={{
                  width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                Enviando...
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <button onClick={handleSubmit} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', padding: '17px', borderRadius: 14, border: 'none',
                background: '#1a45e0', color: '#fff', fontWeight: 800, fontSize: 17,
                cursor: 'pointer', boxShadow: '0 6px 18px rgba(26,69,224,0.35)',
              }}>
                <span style={{ flex: 1, textAlign: 'center', paddingLeft: 22 }}>Solicitar empréstimo</span>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Redimensiona/comprime imagens no navegador antes do upload. PDFs passam direto. */
async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
