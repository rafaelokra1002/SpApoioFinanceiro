import React, { useState, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Briefcase, Building2, Camera, Check, CircleCheck, Clock, FileText, House,
  IdCard, Image as ImageIcon, Info, Instagram, Landmark, MapPin, MessageSquare, Phone, UserRound, Users,
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { CATEGORIES, DOCUMENT_TYPES } from '../constants/categories';
import { submitLeadWithDocuments } from '../services/api';
import { compressImage } from '../utils/image';
import { UploadedFile } from '../types';

type OrigemKey = 'PANFLETO' | 'INSTAGRAM' | 'INDICACAO';

// Tema escuro com dourado (mesma paleta da Home, Simulação e Categorias) — etapa "Seus dados".
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#e0b96f';
const MUTED = '#9aa8bf';

/**
 * Opções de "Como conheceu a SP?".
 * `toIndicacao` monta o texto salvo no campo livre `indicacao` — o admin classifica
 * a origem por palavra-chave, então "Instagram"/"Panfleto" precisam aparecer no texto.
 */
const ORIGENS: {
  key: OrigemKey; label: string; placeholder: string;
  pedeNome: boolean; icon: React.ReactNode;
  toIndicacao: (nome: string) => string;
}[] = [
  // Oculta a pedido do cliente. Reative descomentando.
  // {
  //   key: 'PANFLETO', label: 'Panfleto', placeholder: '',
  //   pedeNome: false, icon: <FileText size={28} color={GOLD} strokeWidth={1.7} />,
  //   toIndicacao: () => 'Panfleto',
  // },
  {
    key: 'INSTAGRAM', label: 'Instagram, página ou blogueira', placeholder: 'Digite o nome do perfil',
    pedeNome: true, icon: <Instagram size={28} color={GOLD} strokeWidth={1.7} />,
    toIndicacao: nome => `Instagram: ${nome}`,
  },
  {
    key: 'INDICACAO', label: 'Indicação de amigo', placeholder: 'Digite o nome de quem indicou',
    pedeNome: true, icon: <Users size={28} color={GOLD} strokeWidth={1.7} />,
    toIndicacao: nome => nome,
  },
];

const docCardStyle: React.CSSProperties = {
  background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 16, padding: '14px 14px 14px',
};

/** Botão de envio (Foto / Galeria / PDF): contorno escuro, ícone e texto brancos. */
const docActionStyle: React.CSSProperties = {
  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
  background: 'transparent', border: `1.5px solid ${LINE}`, color: '#fff', fontWeight: 500, fontSize: 14,
};

/**
 * Campo complementar da etapa de documentos: rótulo em cima e, embaixo, uma caixa escura
 * com o ícone dourado à esquerda. O ícone vem sem cor/tamanho — o campo aplica o dourado.
 */
function ExtraField({ icon, label, optional, multiline, placeholder, value, onChange }: {
  icon: React.ReactElement<{ color?: string; size?: number; strokeWidth?: number }>;
  label: string; optional?: boolean; multiline?: boolean;
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const ic = React.cloneElement(icon, { color: GOLD, size: 22, strokeWidth: 1.7 });
  return (
    <div>
      <label style={{ display: 'block', fontSize: 16, color: '#fff', marginBottom: 8 }}>
        {label}{optional && <span style={{ color: MUTED }}> (opcional)</span>}
      </label>
      <div style={{
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 12,
        padding: multiline ? '15px 16px' : '0 16px', minHeight: 56,
        borderRadius: 14, border: `1.5px solid ${LINE}`, background: CARD,
      }}>
        <span style={{ display: 'flex', flexShrink: 0, marginTop: multiline ? 1 : 0 }}>{ic}</span>
        {multiline ? (
          <textarea rows={2} className="dk-input" placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)}
            style={{ ...darkInput, resize: 'none', lineHeight: 1.4, fontFamily: 'inherit', fontSize: 16 }}
          />
        ) : (
          <input type="text" className="dk-input" placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)}
            style={{ ...darkInput, fontSize: 16 }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Indicador de etapas: 1 Seus dados → 2 Documentos → 3 Confirmação.
 * Sem `labels`: versão compacta (etapa atual preenchida). Com `labels`: círculos espalhados,
 * etapas concluídas com ✔, a atual em anel dourado e o nome de cada etapa embaixo.
 */
function Stepper({ atual, labels }: { atual: 1 | 2 | 3; labels?: string[] }) {
  const detalhado = !!labels;
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      ...(detalhado ? { width: '100%', maxWidth: 320, margin: '0 auto 36px' } : {}),
    }}>
      {[1, 2, 3].map((n, i) => {
        const concluida = detalhado && n < atual;
        const ativa = n === atual;
        return (
          <React.Fragment key={n}>
            {i > 0 && (
              <span style={{
                ...(detalhado ? { flex: 1 } : { width: 34 }),
                height: 2, background: n <= atual ? GOLD : LINE,
              }} />
            )}
            <span style={{ position: 'relative', flexShrink: 0, width: 30, height: 30 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                background: concluida ? '#c9b27c' : (ativa && !detalhado ? GOLD : BG),
                color: concluida || (ativa && !detalhado) ? '#111827' : (ativa ? '#fff' : MUTED),
                border: `${ativa && detalhado ? 2 : 1.5}px solid ${n <= atual ? GOLD : LINE}`,
              }}>
                {concluida ? <Check size={16} strokeWidth={3} /> : n}
              </span>
              {detalhado && (
                <span style={{
                  position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap', fontSize: 13, fontWeight: ativa ? 700 : 400,
                  color: ativa ? '#fff' : MUTED,
                }}>{labels![i]}</span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Caixa de campo escura: ícone dourado, divisória e o input à direita. */
function DarkField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 58,
      borderRadius: 14, border: `1.5px solid ${LINE}`, background: CARD,
    }}>
      <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
      {children}
    </div>
  );
}

const darkLabel: React.CSSProperties = { display: 'block', fontSize: 17, color: '#fff', marginBottom: 8 };

const darkInput: React.CSSProperties = {
  flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 17, color: '#fff', padding: 0,
};

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
  // Tipo esperado do arquivo conforme o botão clicado (foto x PDF).
  const [expectedKind, setExpectedKind] = useState<'image' | 'pdf'>('image');
  const [origem, setOrigem] = useState<OrigemKey | ''>('');
  const [origemNome, setOrigemNome] = useState('');

  const servidorPublico = state.categoria === 'SERVIDOR_PUBLICO';
  const comissionado = state.vinculoServidor === 'COMISSIONADO';
  // Servidor público usa a lista de documentos do vínculo escolhido (efetivo x comissionado).
  const docKey = servidorPublico ? `SERVIDOR_PUBLICO_${state.vinculoServidor || 'EFETIVO'}` : state.categoria;
  const docs = DOCUMENT_TYPES[docKey] || DOCUMENT_TYPES['CARTEIRA_ASSINADA'];
  const categoriaLabel = CATEGORIES.find(c => c.value === state.categoria)?.label || '';
  const beneficiario = state.categoria === 'BENEFICIARIO';
  // Garantia não pede dados de emprego/renda — o bem é a garantia.
  const garantia = state.categoria === 'COM_GARANTIA';
  const autonomo = state.categoria === 'AUTONOMO';
  const semComprovacao = state.categoria === 'SEM_COMPROVACAO';

  // No cabeçalho, o servidor público mostra o vínculo (Cargo efetivo/comissionado)
  // no lugar da categoria.
  const vinculoLabel = state.vinculoServidor === 'EFETIVO' ? 'Cargo efetivo'
    : state.vinculoServidor === 'COMISSIONADO' ? 'Cargo comissionado' : '';
  const perfilTexto = servidorPublico && vinculoLabel ? vinculoLabel : categoriaLabel;

  const openFilePicker = (docKey: string) => {
    setCurrentDocKey(docKey);
    setExpectedKind('image');
    fileInputRef.current?.click();
  };

  const openGallery = (docKey: string) => {
    setCurrentDocKey(docKey);
    setExpectedKind('image');
    galleryInputRef.current?.click();
  };

  const openPdfPicker = (docKey: string) => {
    setCurrentDocKey(docKey);
    setExpectedKind('pdf');
    pdfInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = '';
    if (!raw || !currentDocKey) return;

    // Bloqueia tipo trocado: foto onde se pede PDF (e vice-versa).
    const isPdf = raw.type === 'application/pdf' || raw.name.toLowerCase().endsWith('.pdf');
    const isImage = raw.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(raw.name);
    if (expectedKind === 'image' && !isImage) {
      setError('Aqui é para foto/imagem. Para enviar um PDF, use o botão "PDF".');
      return;
    }
    if (expectedKind === 'pdf' && !isPdf) {
      setError('Aqui é para arquivo PDF. Para enviar uma foto, use "Câmera" ou "Galeria".');
      return;
    }
    setError('');

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
    // Localização é obrigatória — se foi negada/revogada no meio do fluxo, não envia.
    if (state.geo !== 'granted') {
      setError('Ative a localização para concluir sua solicitação.');
      return;
    }
    setError('');
    setSubmitting(true);

    // Quando há bem em garantia, junta os detalhes à observação para o admin.
    const observacao = [
      state.observacao, resumoGarantiaImovel(state), resumoGarantiaVeiculo(state),
      resumoGarantiaEletronico(state), resumoGarantiaOutro(state),
    ].filter(Boolean).join('\n\n') || undefined;

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
      // Origem real escolhida no passo "Como você conheceu a SP?" (campo próprio no banco).
      origem: origem || undefined,
      endereco: state.endereco || undefined,
      cep: state.cep || undefined,
      enderecoTrabalho: state.enderecoTrabalho || undefined,
      // Servidor público: vínculo e matrícula/cargo em campos próprios (aparecem no admin).
      vinculoServidor: servidorPublico ? (state.vinculoServidor || undefined) : undefined,
      matriculaCargo: servidorPublico ? (state.matriculaCargo || undefined) : undefined,
      observacao,
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

  // Ícones do Lucide (linha dourada), conforme a lista de equivalências.
  const docIcons: Record<string, React.ReactNode> = {
    '🪪': <IdCard size={26} color={GOLD} strokeWidth={1.7} />,
    '📷': <UserRound size={26} color={GOLD} strokeWidth={1.7} />,
    '🏠': <House size={26} color={GOLD} strokeWidth={1.7} />,
    '💼': <FileText size={26} color={GOLD} strokeWidth={1.7} />,
    '📄': <FileText size={26} color={GOLD} strokeWidth={1.7} />,
  };

  const voltar = () => { if (docStep === 2) setDocStep(1); else dispatch({ type: 'SET_STEP', step: 2 }); };

  // Escolher outra origem limpa o nome digitado (não vaza de "Instagram" para "Indicação").
  const selecionarOrigem = (key: OrigemKey) => {
    if (origem === key) return;
    setOrigem(key);
    setOrigemNome('');
  };

  return (
    <div style={{
      padding: 0,
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      background: BG,
    }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={galleryInputRef} type="file" accept="image/*"
        onChange={handleFileSelect} style={{ display: 'none' }} />
      <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf"
        onChange={handleFileSelect} style={{ display: 'none' }} />

      {docStep === 1 ? (
        <div style={{ background: BG, minHeight: '100vh', padding: '18px 16px 26px', colorScheme: 'dark' }}>
          {/* Topo: voltar + etapas */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={voltar} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', fontWeight: 500, fontSize: 17,
            }}>
              <ArrowLeft size={22} strokeWidth={2.2} />
              Voltar
            </button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Stepper atual={1} />
            </div>
          </div>

          <h1 style={{
            margin: '22px 0 6px', fontSize: 'clamp(28px, 8vw, 38px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
          }}>
            Seus dados
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 16, color: MUTED }}>
            Preencha as informações para continuar.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={darkLabel}>Nome completo</label>
            <DarkField icon={<UserRound size={24} color={GOLD} strokeWidth={1.7} />}>
              <input type="text" className="dk-input" placeholder="Digite seu nome completo"
                value={state.nome}
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'nome', value: e.target.value })}
                style={darkInput}
              />
            </DarkField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={darkLabel}>WhatsApp</label>
            <DarkField icon={<Phone size={24} color={GOLD} strokeWidth={1.7} />}>
              <input type="text" inputMode="tel" className="dk-input" placeholder="(11) 99999-9999"
                value={state.telefone}
                onChange={e => {
                  const c = e.target.value.replace(/\D/g, '');
                  let fmt = c;
                  if (c.length > 2) fmt = `(${c.slice(0,2)}) ${c.slice(2)}`;
                  if (c.length > 7) fmt = `(${c.slice(0,2)}) ${c.slice(2,7)}-${c.slice(7,11)}`;
                  dispatch({ type: 'SET_FIELD', field: 'telefone', value: fmt });
                }}
                style={darkInput}
              />
            </DarkField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <label style={darkLabel}>
                Instagram <span style={{ color: MUTED }}>(opcional)</span>
              </label>
              <span style={{ fontSize: 13, color: MUTED }}>Ajuda na análise</span>
            </div>
            <DarkField icon={<Instagram size={24} color={GOLD} strokeWidth={1.7} />}>
              <input type="text" className="dk-input" placeholder="Digite seu Instagram"
                value={state.instagram}
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'instagram', value: e.target.value })}
                style={darkInput}
              />
            </DarkField>
          </div>

          {/* Como conheceu a SP */}
          <h2 style={{ margin: '26px 0 4px', fontSize: 'clamp(24px, 7vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Como conheceu a SP?
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 16, color: MUTED }}>
            Escolha uma opção e informe os detalhes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {ORIGENS.map(op => {
              const active = origem === op.key;
              return (
                <div key={op.key}
                  onClick={() => selecionarOrigem(op.key)}
                  style={{
                    padding: '16px 18px 18px', borderRadius: 16, cursor: 'pointer',
                    background: active ? 'rgba(224,185,111,0.07)' : CARD,
                    border: `1.5px solid ${active ? GOLD : LINE}`,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', flexShrink: 0 }}>{op.icon}</span>
                    <span style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 17, color: '#fff' }}>{op.label}</span>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      border: `2.5px solid ${active ? GOLD : '#3a4863'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <span style={{ width: 12, height: 12, borderRadius: '50%', background: GOLD }} />}
                    </span>
                  </div>
                  {op.pedeNome && (
                    <input type="text" className="dk-input" placeholder={op.placeholder}
                      value={active ? origemNome : ''}
                      onFocus={() => selecionarOrigem(op.key)}
                      onChange={e => { selecionarOrigem(op.key); setOrigemNome(e.target.value); }}
                      style={{
                        width: '100%', boxSizing: 'border-box', marginTop: 14, height: 52,
                        padding: '0 16px', borderRadius: 12, border: `1.5px solid ${LINE}`,
                        background: '#0d1727', fontSize: 16, color: '#fff', outline: 'none',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.45)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            }}>
              <p style={{ fontSize: 13.5, color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={() => {
            if (!state.nome || !state.telefone) {
              setError('Preencha nome e WhatsApp para continuar.');
              return;
            }
            if (!origem) {
              setError('Selecione como você conheceu a SP.');
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '19px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(180deg, #e8c885 0%, #c9a05a 100%)',
            color: '#111827', fontWeight: 800, fontSize: 19,
          }}>
            Continuar
          </button>
        </div>
      ) : (
        <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', colorScheme: 'dark' }}>
          {/* Topo: voltar + perfil */}
          <div style={{ padding: '18px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={voltar} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontWeight: 500, fontSize: 17,
              }}>
                <span style={{
                  width: 42, height: 42, borderRadius: 12, border: `1.5px solid ${LINE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ArrowLeft size={22} strokeWidth={2.2} />
                </span>
                Voltar
              </button>
              {perfilTexto && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0,
                  padding: '7px 12px', borderRadius: 12,
                  border: `1.5px solid ${GOLD}`, background: 'rgba(224,185,111,0.08)',
                }}>
                  <UserRound size={20} color={GOLD} strokeWidth={1.9} style={{ flexShrink: 0 }} />
                  <span style={{ minWidth: 0, lineHeight: 1.2 }}>
                    <span style={{ display: 'block', fontSize: 11, color: MUTED }}>Perfil:</span>
                    <span style={{
                      display: 'block', fontSize: 13.5, fontWeight: 600, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{perfilTexto}</span>
                  </span>
                </span>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <Stepper atual={2} labels={['1. Cadastro', 'Documentos', 'Análise']} />
            </div>

            <h1 style={{
              margin: '18px 0 4px', fontSize: 'clamp(28px, 8vw, 38px)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
            }}>
              Enviar documentos
            </h1>
            <p style={{ margin: '0 0 18px', fontSize: 16, color: MUTED }}>
              Mande os arquivos para análise.
            </p>
          </div>

          <div style={{ flex: 1, padding: '0 16px 20px' }}>
            {/* Cards de documento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {docs.map(doc => {
                const uploaded = state.documents[doc.key];
                const isPdfOnly = doc.key.toLowerCase().includes('carteira de trabalho');
                const isSelfie = doc.key.toLowerCase().includes('selfie');
                // Só a selfie não aceita PDF (precisa ser foto na hora).
                const podePdf = !isSelfie;
                const temDica = doc.key === 'Comprovante de residência';
                return (
                  <div key={doc.key} style={{ ...docCardStyle, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        minWidth: 50, width: 50, height: 50, borderRadius: 14, background: '#131d2e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{docIcons[doc.icon] || docIcons['📄']}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 16.5, color: '#fff' }}>{doc.label}</span>
                          {temDica && (
                            <button onClick={() => setShowTip(showTip === doc.key ? null : doc.key)}
                              onMouseEnter={() => setShowTip(doc.key)}
                              onMouseLeave={() => setShowTip(null)}
                              title="Sobre o comprovante" style={{
                                width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${GOLD}`,
                                background: 'transparent', color: GOLD, fontSize: 11, fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 0, flexShrink: 0,
                              }}>?</button>
                          )}
                        </div>
                        {doc.description !== doc.label && (
                          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 2, lineHeight: 1.35 }}>{doc.description}</p>
                        )}
                      </div>

                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
                        padding: '5px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                        background: uploaded ? 'rgba(34,197,94,0.14)' : '#131d2e',
                        color: uploaded ? '#86efac' : '#c8d2e3',
                      }}>
                        {uploaded
                          ? <CircleCheck size={14} strokeWidth={2.4} />
                          : <Clock size={14} strokeWidth={2.2} />}
                        {uploaded ? 'Enviado' : 'Pendente'}
                      </span>
                    </div>

                    {/* Balão flutuante: sobrepõe o card, sem empurrar o conteúdo. */}
                    {temDica && showTip === doc.key && (
                      <div style={{
                        position: 'absolute', left: 14, right: 14, top: 72, zIndex: 20,
                        display: 'flex', gap: 10, padding: '12px 14px',
                        background: '#131d2e', border: `1px solid ${LINE}`, borderRadius: 12,
                        boxShadow: '0 10px 26px rgba(0,0,0,0.5)',
                      }}>
                        <Info size={18} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, color: '#d4dcea', lineHeight: 1.5, margin: 0 }}>
                          O comprovante de residência não precisa estar em seu nome, mas você precisa morar na residência que enviar.
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {uploaded ? (
                        // Limpa o arquivo: o card volta a "Pendente" com os botões de envio.
                        <button onClick={() => dispatch({ type: 'SET_DOCUMENT', key: doc.key, file: null })}
                          style={{ ...docActionStyle, borderColor: GOLD, color: GOLD }}>
                          Enviar novamente
                        </button>
                      ) : isPdfOnly ? (
                        <button onClick={() => openPdfPicker(doc.key)} style={{ ...docActionStyle, maxWidth: 130 }}>
                          <FileText size={17} strokeWidth={1.9} />
                          PDF
                        </button>
                      ) : (
                        <>
                          <button onClick={() => openFilePicker(doc.key)} style={{ ...docActionStyle, maxWidth: isSelfie ? 130 : undefined }}>
                            <Camera size={17} strokeWidth={1.9} />
                            Foto
                          </button>
                          {/* Selfie só pela câmera (foto na hora, sem galeria). */}
                          {!isSelfie && (
                            <button onClick={() => openGallery(doc.key)} style={docActionStyle}>
                              <ImageIcon size={17} strokeWidth={1.9} />
                              Galeria
                            </button>
                          )}
                          {podePdf && (
                            <button onClick={() => openPdfPicker(doc.key)} style={docActionStyle}>
                              <FileText size={17} strokeWidth={1.9} />
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
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {beneficiario ? (
                <>
                  <ExtraField
                    icon={<Landmark />}
                    label="Banco onde recebe o benefício"
                    placeholder="Ex.: Caixa Econômica, Banco do Brasil, Bradesco"
                    value={state.nomeEmpresa}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                  />
                  <ExtraField
                    icon={<BadgeCheck />}
                    label="Tipo de benefício"
                    placeholder="Ex.: Aposentadoria, Pensão, BPC/LOAS, Auxílio-doença"
                    value={state.bairroTrabalho}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })}
                  />
                </>
              ) : garantia ? null : autonomo ? (
                <>
                  <ExtraField
                    icon={<Briefcase />}
                    label="Profissão ou atividade"
                    placeholder="Ex: manicure, motorista, vendedor"
                    value={state.nomeEmpresa}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                  />
                  <ExtraField
                    icon={<MapPin />}
                    label="Onde atende ou trabalha"
                    placeholder="Ex: Centro, Camaçari"
                    value={state.bairroTrabalho}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })}
                  />
                </>
              ) : semComprovacao ? (
                <ExtraField
                  icon={<Briefcase />}
                  label="Dados de renda"
                  placeholder="Você trabalha com o quê?"
                  value={state.nomeEmpresa}
                  onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                />
              ) : servidorPublico ? (
                <>
                  <ExtraField
                    icon={<Building2 />}
                    label="Órgão onde trabalha"
                    placeholder="Ex.: Prefeitura Municipal"
                    value={state.nomeEmpresa}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                  />
                  <ExtraField
                    icon={comissionado ? <Briefcase /> : <IdCard />}
                    label={comissionado ? 'Cargo que ocupa' : 'Matrícula funcional'}
                    placeholder={comissionado ? 'Ex.: Assessor' : 'Ex.: 123456'}
                    value={state.matriculaCargo}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'matriculaCargo', value: v })}
                  />
                  <ExtraField
                    icon={<MapPin />}
                    label="Bairro, local de trabalho e cidade"
                    placeholder="Ex.: Centro, Prefeitura Municipal, Camaçari"
                    value={state.bairroTrabalho}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })}
                  />
                </>
              ) : (
                <>
                  <ExtraField
                    icon={<Building2 />}
                    label="Nome da empresa como aparece na fachada"
                    placeholder="Ex: Planeta Calçados"
                    value={state.nomeEmpresa}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                  />
                  <ExtraField
                    icon={<MapPin />}
                    label="Bairro, local de trabalho e cidade"
                    placeholder="Ex: Centro, Camaçari"
                    value={state.bairroTrabalho}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: v })}
                  />
                </>
              )}

              <ExtraField
                icon={<MessageSquare />} multiline
                label="Observação" optional
                placeholder="Escreva algo se quiser ajudar na análise"
                value={state.observacao}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'observacao', value: v })}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.45)',
                borderRadius: 12, padding: '10px 14px', marginTop: 14,
              }}>
                <p style={{ fontSize: 13.5, color: '#fca5a5', margin: 0 }}>{error}</p>
              </div>
            )}
          </div>

          {/* CTA fixo no rodapé */}
          <div style={{
            position: 'sticky', bottom: 0, padding: '14px 16px 14px',
            background: `linear-gradient(to top, ${BG} 72%, rgba(6,12,21,0))`,
          }}>
            {submitting ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '18px', borderRadius: 999, color: '#111827', fontWeight: 800, fontSize: 18,
                background: 'linear-gradient(180deg, #e8c885 0%, #c9a05a 100%)', opacity: 0.85,
              }}>
                <div style={{
                  width: 20, height: 20, border: '2.5px solid rgba(17,24,39,0.3)', borderTopColor: '#111827',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                Enviando...
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <button onClick={handleSubmit} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(180deg, #e8c885 0%, #c9a05a 100%)',
                color: '#111827', fontWeight: 800, fontSize: 18,
              }}>
                Enviar para análise
                <ArrowRight size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Monta um resumo em texto do imóvel dado em garantia, para anexar à observação. */
function resumoGarantiaImovel(state: ReturnType<typeof useLoan>['state']): string {
  if (state.categoria !== 'COM_GARANTIA' || state.bemGarantia !== 'IMOVEL') return '';
  const g = state.garantiaImovel;
  const docLabel: Record<string, string> = {
    ESCRITURA: 'Escritura', CONTRATO: 'Contrato de compra e venda', SEM_DOC: 'Não possui documento',
  };
  const linhas = [
    '— Garantia: Imóvel —',
    g.tipoImovel && `Tipo: ${g.tipoImovel}`,
    g.descricao && `Descrição: ${g.descricao}`,
    g.endereco && `Endereço: ${g.endereco}`,
    g.valorMercado && `Valor de mercado: R$ ${g.valorMercado}`,
    g.tipoDocumentacao && `Documentação: ${docLabel[g.tipoDocumentacao] || g.tipoDocumentacao}`,
  ].filter(Boolean);
  return linhas.length > 1 ? linhas.join('\n') : '';
}

/** Monta um resumo em texto do veículo/moto dado em garantia, para anexar à observação. */
function resumoGarantiaVeiculo(state: ReturnType<typeof useLoan>['state']): string {
  if (state.categoria !== 'COM_GARANTIA' || state.bemGarantia !== 'VEICULO') return '';
  const v = state.garantiaVeiculo;
  const linhas = [
    `— Garantia: ${v.tipo === 'MOTO' ? 'Moto' : 'Carro'} —`,
    v.marca && `Marca: ${v.marca}`,
    v.modelo && `Modelo: ${v.modelo}`,
    v.quilometragem && `Quilometragem: ${v.quilometragem}`,
    v.placa && `Placa: ${v.placa}`,
    v.valorMercado && `Valor de mercado: R$ ${v.valorMercado}`,
    `Manual: ${v.possuiManual ? 'Sim' : 'Não'}`,
    `Chave reserva: ${v.possuiChaveReserva ? 'Sim' : 'Não'}`,
  ].filter(Boolean);
  return linhas.length > 1 ? linhas.join('\n') : '';
}

/** Monta um resumo em texto do eletrônico dado em garantia, para anexar à observação. */
function resumoGarantiaEletronico(state: ReturnType<typeof useLoan>['state']): string {
  if (state.categoria !== 'COM_GARANTIA' || state.bemGarantia !== 'ELETRONICO') return '';
  const g = state.garantiaEletronico;
  const linhas = [
    '— Garantia: Eletrônico —',
    g.tipoItem && `Tipo: ${g.tipoItem}`,
    g.marca && `Marca: ${g.marca}`,
    g.modelo && `Modelo: ${g.modelo}`,
    g.estadoConservacao && `Estado: ${g.estadoConservacao}`,
    g.capacidade && `Capacidade/Especificação: ${g.capacidade}`,
    g.valorMercado && `Valor de mercado: R$ ${g.valorMercado}`,
    `Caixa: ${g.temCaixa ? 'Sim' : 'Não'}`,
    `Nota fiscal: ${g.temNotaFiscal ? 'Sim' : 'Não'}`,
    `Carregador: ${g.temCarregador ? 'Sim' : 'Não'}`,
  ].filter(Boolean);
  return linhas.length > 1 ? linhas.join('\n') : '';
}

/** Monta um resumo em texto de outro bem de valor dado em garantia, para anexar à observação. */
function resumoGarantiaOutro(state: ReturnType<typeof useLoan>['state']): string {
  if (state.categoria !== 'COM_GARANTIA' || state.bemGarantia !== 'OUTRO') return '';
  const g = state.garantiaOutro;
  const linhas = [
    '— Garantia: Outro bem de valor —',
    g.nome && `Nome: ${g.nome}`,
    g.descricao && `Descrição: ${g.descricao}`,
    g.estadoConservacao && `Estado: ${g.estadoConservacao}`,
    g.valorMercado && `Valor de mercado: R$ ${g.valorMercado}`,
  ].filter(Boolean);
  return linhas.length > 1 ? linhas.join('\n') : '';
}
