import React, { useState, useRef } from 'react';
import { useLoan } from '../context/LoanContext';
import { DOCUMENT_TYPES } from '../constants/categories';
import { submitLeadWithDocuments } from '../services/api';
import { UploadedFile } from '../types';

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

  const docs = DOCUMENT_TYPES[state.categoria] || DOCUMENT_TYPES['CARTEIRA_ASSINADA'];
  const showWorkFields = ['CARTEIRA_ASSINADA', 'CLT_SEM_REGISTRO', 'AUTONOMO', 'BENEFICIARIO', 'ESTAGIARIO', 'SEM_COMPROVACAO', 'COM_GARANTIA'].includes(state.categoria);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDocKey) {
      const preview = file.type === 'application/pdf' ? '' : URL.createObjectURL(file);
      dispatch({ type: 'SET_DOCUMENT', key: currentDocKey, file: { file, preview } });
    }
    e.target.value = '';
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

  return (
    <div style={{ padding: '24px 20px 24px', minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(135deg, #1e1040 0%, #2d1b69 40%, #1e1040 100%)' }}>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" capture="environment"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={galleryInputRef} type="file" accept="image/*,.pdf,application/pdf"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf"
        onChange={handleFileSelect} style={{ display: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '28px 20px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* Step indicator */}
        <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Passo {docStep} de 2
        </p>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: '50%',
              background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, marginRight: 6,
            }}>1</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>Dados pessoais</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: '50%',
              background: docStep === 2 ? '#7c3aed' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 700, marginRight: 6,
            }}>2</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: docStep === 2 ? '#7c3aed' : '#9ca3af' }}>Envio de documentos</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginBottom: 24 }}>
          <div style={{ height: 4, background: '#7c3aed', borderRadius: 2, width: docStep === 1 ? '50%' : '100%', transition: 'width 0.3s' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button onClick={() => { if (docStep === 2) setDocStep(1); else dispatch({ type: 'SET_STEP', step: 3 }); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d2b5e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>
            {docStep === 1 ? 'Vamos começar!' : 'Envio de Documentos'}
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#7c7c9a', marginBottom: 20, paddingLeft: 40 }}>
          {docStep === 1 ? 'Informe seus dados pessoais para continuar.' : 'Envie as fotos abaixo para confirmar seu perfil.'}
        </p>

        {docStep === 1 ? (
          <>
            {/* Step 1: Personal Data */}
            <InputField label="Nome completo" placeholder="Digite seu nome completo"
              value={state.nome} onChange={v => dispatch({ type: 'SET_FIELD', field: 'nome', value: v })} />

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>WhatsApp</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff' }}>
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
                  style={{ flex: 1, border: 'none', fontSize: 15, color: '#1f2937', background: 'transparent', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Instagram</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff' }}>
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
                  style={{ flex: 1, border: 'none', fontSize: 15, color: '#1f2937', background: 'transparent', outline: 'none' }}
                />
              </div>
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
              setError('');
              setDocStep(2);
            }} style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
              marginTop: 8,
            }}>Continuar</button>
          </>
        ) : (
          <>
            {/* Step 2: Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
          {docs.map(doc => {
            const uploaded = state.documents[doc.key];
            return (
              <React.Fragment key={doc.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 12px', borderRadius: 14,
                border: uploaded ? '2px solid #2e8b57' : '1.5px solid #e5e7eb',
                background: uploaded ? '#f0fdf4' : '#fff',
              }}>
                <div style={{
                  minWidth: 38, height: 38, borderRadius: 10, background: '#e8effc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{docIcons[doc.icon] || docIcons['📄']}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b5e', lineHeight: 1.2 }}>{doc.label}</div>
                  {doc.description !== doc.label && (
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{doc.description}</div>
                  )}

                </div>
                {uploaded ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: '#dcfce7', borderRadius: 20, padding: '5px 10px',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Enviado</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {doc.key.toLowerCase().includes('carteira de trabalho') ? (
                      <button onClick={() => openPdfPicker(doc.key)} title="Enviar PDF" style={{
                        padding: '7px 8px', borderRadius: 8, border: 'none',
                        background: '#c0392b',
                        color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                          <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button onClick={() => openFilePicker(doc.key)} title="Tirar foto" style={{
                          padding: '7px 8px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
                          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                            <rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1-3h6l1 3"/>
                          </svg>
                        </button>
                        <button onClick={() => openGallery(doc.key)} title="Buscar na galeria" style={{
                          padding: '7px 8px', borderRadius: 8, border: 'none',
                          background: '#0d2b5e',
                          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </button>
                        {!doc.key.toLowerCase().includes('rg ou cnh') && !doc.key.toLowerCase().includes('selfie') && (
                          <button onClick={() => openPdfPicker(doc.key)} title="Enviar PDF" style={{
                            padding: '7px 8px', borderRadius: 8, border: 'none',
                            background: '#c0392b',
                            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                              <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              {doc.key === 'Comprovante de residência' && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                  padding: '10px 14px',
                }}>
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                    ⚠️ Comprovante de residência <strong>não precisa estar em seu nome</strong>. Porém, é necessário que você resida no endereço informado no documento.
                  </p>
                </div>
              )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Work fields */}
        {showWorkFields && state.categoria !== 'SEM_COMPROVACAO' && (
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d2b5e', marginBottom: 10 }}>
              {state.categoria === 'AUTONOMO'
                ? 'Dados da atividade'
                : state.categoria === 'BENEFICIARIO'
                ? 'Informações do benefício'
                : state.categoria === 'ESTAGIARIO'
                ? 'Dados do estágio'
                : 'Dados do trabalho'}
            </p>
            <InputField
              placeholder={state.categoria === 'AUTONOMO' ? 'Profissão ou tipo de serviço (opcional)' : state.categoria === 'BENEFICIARIO' ? 'Tipo de benefício recebido (opcional)' : 'Nome da empresa (como está na fachada) (opcional)'}
              value={state.nomeEmpresa} onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })} />
            {state.categoria !== 'BENEFICIARIO' && (
              <InputField
                placeholder={state.categoria === 'AUTONOMO' ? 'Onde atende (casa, salão, online, etc.) (opcional)' : 'Bairro, local onde trabalha (opcional)'}
                value={state.bairroTrabalho} onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })} />
            )}
          </div>
        )}

        {/* SEM_COMPROVACAO extra fields */}
        {state.categoria === 'SEM_COMPROVACAO' && (
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d2b5e', marginBottom: 10 }}>
              Dados do aparelho celular
            </p>
            <InputField placeholder="Marca e modelo do celular"
              value={state.nomeEmpresa} onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })} />

            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d2b5e', marginBottom: 10, marginTop: 16 }}>
              Instagram
            </p>
            <InputField placeholder="@ do perfil"
              value={state.instagram} onChange={v => dispatch({ type: 'SET_FIELD', field: 'instagram', value: v })} />

            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d2b5e', marginBottom: 10, marginTop: 16 }}>
              Dados de renda
            </p>
            <InputField placeholder="Você trabalha com o quê?"
              value={state.bairroTrabalho} onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })} />
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {submitting ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#0d2b5e',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto',
            }} />
            <p style={{ marginTop: 10, color: '#6b7280', fontSize: 14 }}>Enviando...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <button onClick={handleSubmit} style={{
            width: '100%', padding: '15px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #2e8b57 0%, #3ba06a 100%)',
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          }}>Enviar dados para análise</button>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type, inputMode }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; inputMode?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>}
      <input type={type || 'text'} inputMode={inputMode as any} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 12,
          border: '1.5px solid #e5e7eb', fontSize: 15, color: '#1f2937', background: '#fff',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#0d2b5e')}
        onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
      />
    </div>
  );
}
