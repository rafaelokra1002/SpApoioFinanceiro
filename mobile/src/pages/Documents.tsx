import React, { useState, useRef } from 'react';
import {
  ArrowRight, BadgeCheck, Briefcase, Building2, Camera, Car, ChartNoAxesColumn, Check,
  ChevronDown, ChevronLeft, Upload,
  FileText, House, IdCard, Image as ImageIcon, Info, Landmark, MapPin, MessageSquare, UserRound,
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { CATEGORIES, DOCUMENT_TYPES } from '../constants/categories';
import { submitLeadWithDocuments } from '../services/api';
import { compressImage, formatoAceito, pareceImagem } from '../utils/image';
import { descreverDispositivo } from '../utils/device';
import { UploadedFile } from '../types';

// Tema escuro com dourado (mesma paleta da Home, Simulação e Categorias) — etapa "Seus dados".
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#f6c700';
const MUTED = '#9aa8bf';

/** Logo do topo: "SP" em amarelo + "EMPRÉSTIMOS" em branco. */
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: GOLD, letterSpacing: '-0.02em' }}>SP</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>EMPRÉSTIMOS</span>
    </div>
  );
}

/** Campo simples da etapa "Seus dados": caixa escura com borda, sem ícone. */
const plainInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 56, padding: '0 18px',
  borderRadius: 12, border: `1.5px solid ${LINE}`, background: CARD,
  fontSize: 16.5, color: '#fff', outline: 'none', fontFamily: 'inherit',
};

/** Borda clara dos botões e campos da lista de documentos. */
const DOC_BORDA = 'rgba(255,255,255,0.72)';

/** Item da lista de documentos: sem card, só uma linha separando um do outro. */
const docItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0',
  borderBottom: '1px solid rgba(255,255,255,0.14)',
};
/** Botões/campos da lista ocupam a linha inteira (centralizados), não só a coluna do texto. */
const docBotoesLinha: React.CSSProperties = { marginLeft: -46 };
// A coluna do ícone tem a altura da linha do título e centraliza o ícone nela.
const docIconCol: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 32, height: 24,
};
const docTitle: React.CSSProperties = { margin: 0, fontWeight: 700, fontSize: 17, lineHeight: '24px', color: '#fff' };
const docDesc: React.CSSProperties = { margin: '3px 0 0', fontSize: 14, color: '#c9d1dd', lineHeight: 1.4 };

/** Botão de envio (Foto / Galeria / PDF): contorno escuro, ícone e texto brancos. */
const docActionStyle: React.CSSProperties = {
  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
  background: 'transparent', border: `1.5px solid ${DOC_BORDA}`, color: '#fff', fontWeight: 500, fontSize: 14,
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

/** Barra de progresso linear da etapa 2 (documentos): "Etapa X de Y" + barra dourada. */
function EtapaBar({ atual, total }: { atual: number; total: number }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: MUTED }}>
        Etapa {atual} de {total}
      </p>
      <div style={{ height: 6, borderRadius: 999, background: LINE, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(atual / total) * 100}%`, borderRadius: 999, background: GOLD }} />
      </div>
    </div>
  );
}

/** Um dos lados da CNH (frente/verso): botão simples; depois de enviado, mostra check dourado. */
function CnhLadoButton({ lado, uploaded, aberto, onAdd, onClear }: {
  lado: string; uploaded: boolean; aberto: boolean; onAdd: () => void; onClear: () => void;
}) {
  if (uploaded) {
    return (
      <button onClick={onClear} style={{
        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(246,199,0,0.08)', border: `1.5px solid ${GOLD}`, color: GOLD, fontWeight: 600, fontSize: 14,
      }}>
        <Check size={16} strokeWidth={2.6} />
        {lado} enviada
      </button>
    );
  }
  return (
    <button onClick={onAdd} style={{ ...docActionStyle, ...(aberto ? { borderColor: GOLD } : {}) }}>
      <Upload size={18} strokeWidth={2} />
      Adicionar {lado.toLowerCase()}
      <ChevronDown size={17} strokeWidth={2.2}
        style={{ transition: 'transform 0.15s', transform: aberto ? 'rotate(180deg)' : 'none' }} />
    </button>
  );
}

type OrigemArquivo = 'camera' | 'galeria' | 'pdf';

/** Seletor "Tirar foto / Escolher da galeria / Selecionar PDF" aberto abaixo do botão. */
function MenuEnvio({ alinhar, onEscolher, onFechar }: {
  alinhar: 'left' | 'right'; onEscolher: (o: OrigemArquivo) => void; onFechar: () => void;
}) {
  const opcoes: { o: OrigemArquivo; label: string; icon: React.ReactNode }[] = [
    { o: 'camera', label: 'Tirar foto', icon: <Camera size={22} strokeWidth={1.8} /> },
    { o: 'galeria', label: 'Escolher da galeria', icon: <ImageIcon size={22} strokeWidth={1.8} /> },
    { o: 'pdf', label: 'Selecionar PDF', icon: <FileText size={22} strokeWidth={1.8} /> },
  ];
  return (
    <>
      {/* Toque fora fecha o menu. */}
      <div onClick={onFechar} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
      <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', [alinhar]: 0, width: 'min(300px, calc(100vw - 32px))', zIndex: 2,
        background: '#131d2e', border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 14px 32px rgba(0,0,0,0.55)',
      }}>
        {opcoes.map((op, i) => (
          <button key={op.o} onClick={() => { onFechar(); onEscolher(op.o); }} style={{
            display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: '15px 18px',
            background: 'none', border: 'none', borderTop: i > 0 ? `1px solid ${LINE}` : 'none',
            cursor: 'pointer', color: '#fff', fontSize: 15.5, textAlign: 'left',
          }}>
            {op.icon}
            {op.label}
          </button>
        ))}
      </div>
    </>
  );
}

/** Seção de dados complementares da etapa 2 ("Seu trabalho", "Seu seguro"...). */
const sectionTitle: React.CSSProperties = {
  margin: '6px 0 12px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800,
  letterSpacing: '-0.02em', color: '#fff',
};
const sectionLabel: React.CSSProperties = { display: 'block', fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 };
const sectionInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 52, padding: '0 16px',
  borderRadius: 12, border: `1.5px solid ${DOC_BORDA}`, background: 'transparent',
  fontSize: 16, color: '#fff', outline: 'none',
};

const stepLabel: React.CSSProperties ={ display: 'block', fontSize: 16.5, fontWeight: 700, color: '#fff', marginBottom: 10 };

const darkInput: React.CSSProperties = {
  flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 17, color: '#fff', padding: 0,
};

export function Documents() {
  const { state, dispatch } = useLoan();
  const [submitting, setSubmitting] = useState(false);
  // Progresso do envio (documentos vão um por vez).
  const [progresso, setProgresso] = useState<{ feitos: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [docStep, setDocStep] = useState(1); // 1 = dados pessoais, 2 = documentos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState('');
  const [showTip, setShowTip] = useState<string | null>(null);
  // Tipo esperado do arquivo conforme o botão clicado (foto x PDF).
  const [expectedKind, setExpectedKind] = useState<'image' | 'pdf'>('image');
  // "+ Adicionar informação (opcional)": começa fechado, a não ser que já tenha texto.
  const [obsOpen, setObsOpen] = useState(false);
  // Documento com o menu "Adicionar documento" aberto (Tirar foto / Galeria / PDF).
  const [menuDoc, setMenuDoc] = useState<string | null>(null);
  // Aviso de arquivo recusado e "carregando", mostrados embaixo do próprio documento.
  const [erroDoc, setErroDoc] = useState<{ key: string; msg: string } | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  const servidorPublico = state.categoria === 'SERVIDOR_PUBLICO';
  const comissionado = state.vinculoServidor === 'COMISSIONADO';
  // Servidor público usa a lista de documentos do vínculo escolhido (efetivo x comissionado).
  const docKey = servidorPublico ? `SERVIDOR_PUBLICO_${state.vinculoServidor || 'EFETIVO'}` : state.categoria;
  const docs = DOCUMENT_TYPES[docKey] || DOCUMENT_TYPES['CARTEIRA_ASSINADA'];
  // RG/CNH frente e verso aparecem juntos num único card "CNH" (quando a categoria os pede separados).
  const CNH_FRENTE_KEY = 'RG ou CNH (frente)';
  const CNH_VERSO_KEY = 'RG ou CNH (verso)';
  const temCnhSeparada = docs.some(d => d.key === CNH_FRENTE_KEY) && docs.some(d => d.key === CNH_VERSO_KEY);
  const docsLista = temCnhSeparada ? docs.filter(d => d.key !== CNH_FRENTE_KEY && d.key !== CNH_VERSO_KEY) : docs;
  const categoriaLabel = CATEGORIES.find(c => c.value === state.categoria)?.label || '';
  const beneficiario = state.categoria === 'BENEFICIARIO';
  // Garantia não pede dados de emprego/renda — o bem é a garantia.
  const garantia = state.categoria === 'COM_GARANTIA';
  const autonomo = state.categoria === 'AUTONOMO';
  const motoristaApp = state.categoria === 'MOTORISTA_APP';
  const semComprovacao = state.categoria === 'SEM_COMPROVACAO';
  const recebeSeguro = state.categoria === 'RECEBE_SEGURO';

  // No cabeçalho, o servidor público mostra o vínculo (Cargo efetivo/comissionado)
  // no lugar da categoria.
  const vinculoLabel = state.vinculoServidor === 'EFETIVO' ? 'Cargo efetivo'
    : state.vinculoServidor === 'COMISSIONADO' ? 'Cargo comissionado' : '';
  const carteiraAssinada = state.categoria === 'CARTEIRA_ASSINADA';
  const estagiario = state.categoria === 'ESTAGIARIO';
  const trabalhoJob = state.categoria === 'TRABALHO_JOB';
  const perfilTexto = servidorPublico && vinculoLabel ? vinculoLabel
    : carteiraAssinada ? 'Carteira assinada (CLT)'
    : categoriaLabel;

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

  /** Linha embaixo do documento: "carregando" ou o motivo da recusa do arquivo. */
  const avisoDoc = (key: string) => {
    if (processando === key) {
      return <p style={{ ...docDesc, ...docBotoesLinha, marginTop: 8, textAlign: 'center' }}>Carregando arquivo...</p>;
    }
    if (erroDoc?.key === key) {
      return (
        <p style={{ ...docBotoesLinha, margin: '8px 0 0 -46px', fontSize: 13.5, lineHeight: 1.4, color: '#fca5a5' }}>
          {erroDoc.msg}
        </p>
      );
    }
    return null;
  };

  const abrirArquivo = (docKey: string, origem: OrigemArquivo) => {
    if (origem === 'camera') openFilePicker(docKey);
    else if (origem === 'galeria') openGallery(docKey);
    else openPdfPicker(docKey);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = '';
    const key = currentDocKey;
    if (!raw || !key) return;
    const recusar = (msg: string) => setErroDoc({ key, msg });
    setErroDoc(null);

    // Bloqueia tipo trocado: foto onde se pede PDF (e vice-versa).
    const isPdf = raw.type === 'application/pdf' || raw.name.toLowerCase().endsWith('.pdf');
    const isImage = pareceImagem(raw);
    if (expectedKind === 'image' && !isImage) {
      recusar('Este arquivo não é uma foto. Para enviar um PDF, use "Selecionar PDF".');
      return;
    }
    if (expectedKind === 'pdf' && !isPdf) {
      recusar('Este arquivo não é um PDF. Para enviar uma foto, use "Tirar foto" ou "Escolher da galeria".');
      return;
    }
    setError('');

    // Comprime fotos antes de guardar (evita "File too large" e agiliza o upload).
    setProcessando(key);
    const file = await compressImage(raw).finally(() => setProcessando(null));

    // O servidor só aceita JPEG/PNG/WebP e PDF. Se a imagem não pôde ser convertida (ex.: HEIC no
    // Android), avisa agora — antes o erro só aparecia no envio final, e sem dizer qual arquivo.
    if (!formatoAceito(file)) {
      const formato = raw.name.includes('.') ? raw.name.split('.').pop()!.toUpperCase() : (raw.type || 'desconhecido');
      recusar(`Esta foto está em ${formato}, formato que não é aceito. Use "Tirar foto" para fotografar agora, ou envie em PDF.`);
      return;
    }
    const preview = file.type === 'application/pdf' ? '' : URL.createObjectURL(file);
    dispatch({ type: 'SET_DOCUMENT', key, file: { file, preview } });
  };

  const handleSubmit = async () => {
    if (!state.nome || !state.telefone) {
      setError('Preencha nome e telefone.');
      return;
    }
    // RG/CNH frente e verso: basta um dos lados (arquivo com os dois lados é enviado uma vez só).
    const temCnh = !!(state.documents[CNH_FRENTE_KEY] || state.documents[CNH_VERSO_KEY]);
    const missing = docs.filter(d => {
      if (temCnhSeparada && (d.key === CNH_FRENTE_KEY || d.key === CNH_VERSO_KEY)) return !temCnh;
      return !state.documents[d.key];
    });
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
      endereco: state.endereco || undefined,
      cep: state.cep || undefined,
      enderecoTrabalho: state.enderecoTrabalho || undefined,
      // Servidor público: vínculo e matrícula/cargo em campos próprios (aparecem no admin).
      vinculoServidor: servidorPublico ? (state.vinculoServidor || undefined) : undefined,
      matriculaCargo: servidorPublico ? (state.matriculaCargo || undefined) : undefined,
      // Motorista de aplicativo: veículo próprio/alugado e placa em campos próprios.
      veiculoProprio: motoristaApp ? (state.veiculoProprio || undefined) : undefined,
      placaVeiculo: motoristaApp ? (state.placaVeiculo || undefined) : undefined,
      // Aparelho do cliente (modelo/sistema/navegador), para o admin conferir.
      dispositivo: (await descreverDispositivo().catch(() => '')) || undefined,
      observacao,
      latitude: state.latitude ?? undefined,
      longitude: state.longitude ?? undefined,
    };

    const docFiles = Object.entries(state.documents)
      .filter(([, v]) => v !== null)
      .map(([tipo, v]) => ({ tipo, file: (v as UploadedFile).file }));

    const res = await submitLeadWithDocuments(leadData, docFiles, (feitos, total) => setProgresso({ feitos, total }));
    setProgresso(null);
    setSubmitting(false);
    if (res.success) {
      dispatch({ type: 'SET_STEP', step: 5 });
    } else {
      setError(res.error || 'Erro ao enviar. Tente novamente.');
    }
  };

  // Ícones do Lucide (linha dourada), conforme a lista de equivalências.
  const docIcons: Record<string, React.ReactNode> = {
    '🪪': <IdCard size={32} color="#fff" strokeWidth={1.6} />,
    '📷': <Camera size={32} color="#fff" strokeWidth={1.6} />,
    '🏠': <House size={32} color="#fff" strokeWidth={1.6} />,
    '💼': <FileText size={32} color="#fff" strokeWidth={1.6} />,
    '📄': <FileText size={32} color="#fff" strokeWidth={1.6} />,
    '📊': <ChartNoAxesColumn size={32} color="#fff" strokeWidth={1.6} />,
  };

  const voltar = () => { if (docStep === 2) setDocStep(1); else dispatch({ type: 'SET_STEP', step: 2 }); };

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
        <div style={{ background: BG, minHeight: '100vh', padding: '18px 20px 26px', colorScheme: 'dark' }}>
          {/* Topo: logo, voltar e barra de etapa */}
          <Logo />
          <button onClick={voltar} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 22, padding: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#d4dcea', fontWeight: 500, fontSize: 16,
          }}>
            <ChevronLeft size={18} strokeWidth={2.2} />
            Voltar
          </button>
          <div style={{ marginTop: 22 }}>
            <EtapaBar atual={1} total={3} />
          </div>

          <h1 style={{
            margin: '26px 0 8px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
          }}>
            Seus dados
          </h1>
          <p style={{ margin: '0 0 26px', fontSize: 17, color: MUTED }}>
            Preencha abaixo para solicitar seu empréstimo.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={stepLabel}>Nome completo</label>
            <input type="text" className="dk-input" placeholder="Digite seu nome completo"
              value={state.nome}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'nome', value: e.target.value })}
              style={plainInput}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={stepLabel}>WhatsApp</label>
            <input type="text" inputMode="tel" className="dk-input" placeholder="Seu número com DDD"
              value={state.telefone}
              onChange={e => {
                const c = e.target.value.replace(/\D/g, '');
                let fmt = c;
                if (c.length > 2) fmt = `(${c.slice(0,2)}) ${c.slice(2)}`;
                if (c.length > 7) fmt = `(${c.slice(0,2)}) ${c.slice(2,7)}-${c.slice(7,11)}`;
                dispatch({ type: 'SET_FIELD', field: 'telefone', value: fmt });
              }}
              style={plainInput}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={stepLabel}>
              Instagram <span style={{ color: MUTED, fontWeight: 400 }}>(opcional)</span>
            </label>
            <input type="text" className="dk-input" placeholder="@seuinstagram"
              value={state.instagram}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'instagram', value: e.target.value })}
              style={plainInput}
            />
          </div>

          {/* Como chegou até a SP — texto livre; o admin deriva a origem por palavra-chave. */}
          <h2 style={{ margin: '34px 0 6px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Como chegou até a SP?
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 16, color: MUTED }}>
            Informe quem indicou ou onde viu a SP.
          </p>
          <textarea rows={2} className="dk-input" placeholder="Nome do amigo, página ou blogueira"
            value={state.indicacao}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'indicacao', value: e.target.value })}
            style={{ ...plainInput, height: 'auto', minHeight: 86, padding: '16px 18px', resize: 'none', lineHeight: 1.4 }}
          />

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.45)',
              borderRadius: 12, padding: '10px 14px', marginTop: 16,
            }}>
              <p style={{ fontSize: 13.5, color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={() => {
            if (!state.nome.trim() || !state.telefone) {
              setError('Preencha nome e WhatsApp para continuar.');
              return;
            }
            if (!state.indicacao.trim()) {
              setError('Informe quem indicou ou onde viu a SP.');
              return;
            }
            setError('');
            setDocStep(2);
          }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', marginTop: 26, padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: GOLD, color: '#111827', fontWeight: 800, fontSize: 17,
          }}>
            Continuar
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', colorScheme: 'dark' }}>
          {/* Topo: logo + voltar + perfil */}
          <div style={{ padding: '18px 16px 0' }}>
            <div style={{ marginBottom: 14 }}>
              <Logo />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={voltar} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontWeight: 500, fontSize: 16,
              }}>
                <ChevronLeft size={18} strokeWidth={2.2} />
                Voltar
              </button>
              {perfilTexto && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1,
                  padding: '7px 12px', borderRadius: 12,
                  border: `1.5px solid ${GOLD}`, background: 'rgba(246,199,0,0.08)',
                }}>
                  {motoristaApp
                    ? <Car size={18} color={GOLD} strokeWidth={1.9} style={{ flexShrink: 0 }} />
                    : carteiraAssinada
                      ? <Briefcase size={18} color={GOLD} strokeWidth={1.9} style={{ flexShrink: 0 }} />
                      : <UserRound size={18} color={GOLD} strokeWidth={1.9} style={{ flexShrink: 0 }} />}
                  <span style={{
                    maxWidth: 180, fontSize: 13.5, fontWeight: 600, color: '#fff',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{perfilTexto}</span>
                </span>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <EtapaBar atual={2} total={3} />
            </div>

            <h1 style={{
              margin: '18px 0 4px', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
            }}>
              Seus documentos
            </h1>
            <p style={{ margin: '0 0 18px', fontSize: 16, color: MUTED }}>
              Envie fotos nítidas ou arquivos em PDF.
            </p>
          </div>

          <div style={{ flex: 1, padding: '0 16px 20px' }}>
            {/* RG/CNH (frente + verso), quando a categoria pede os dois lados separados */}
            {temCnhSeparada && (
              <div style={{ ...docItemStyle, position: 'relative', zIndex: menuDoc === CNH_FRENTE_KEY || menuDoc === CNH_VERSO_KEY ? 30 : undefined }}>
                <span style={docIconCol}><IdCard size={32} color="#fff" strokeWidth={1.6} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={docTitle}>{motoristaApp ? 'CNH' : 'RG ou CNH'}</p>
                  <div style={{ ...docBotoesLinha, display: 'flex', gap: 8, marginTop: 10 }}>
                    {([['Frente', CNH_FRENTE_KEY, 'left'], ['Verso', CNH_VERSO_KEY, 'right']] as const).map(([lado, key, alinhar]) => (
                      <div key={key} style={{ position: 'relative', flex: 1, display: 'flex' }}>
                        <CnhLadoButton lado={lado} uploaded={!!state.documents[key]} aberto={menuDoc === key}
                          onAdd={() => setMenuDoc(menuDoc === key ? null : key)}
                          onClear={() => dispatch({ type: 'SET_DOCUMENT', key, file: null })} />
                        {menuDoc === key && (
                          <MenuEnvio alinhar={alinhar} onFechar={() => setMenuDoc(null)}
                            onEscolher={(o) => abrirArquivo(key, o)} />
                        )}
                      </div>
                    ))}
                  </div>
                  {avisoDoc(CNH_FRENTE_KEY) || avisoDoc(CNH_VERSO_KEY)}
                  <p style={{ ...docDesc, ...docBotoesLinha, marginTop: 10, textAlign: 'center' }}>
                    {motoristaApp
                      ? 'Se a CNH Digital tiver os dois lados, envie uma vez.'
                      : 'Se o PDF tiver os dois lados, envie uma vez.'}
                  </p>
                </div>
              </div>
            )}

            {/* Documentos: lista sem cards, separada por linhas */}
            {docsLista.map(doc => {
              const uploaded = state.documents[doc.key];
              const isPdfOnly = doc.key.toLowerCase().includes('carteira de trabalho');
              const isSelfie = doc.key.toLowerCase().includes('selfie');
              const temDica = doc.key === 'Comprovante de residência';
              return (
                <div key={doc.key} style={{ ...docItemStyle, position: 'relative', zIndex: menuDoc === doc.key ? 30 : undefined }}>
                  <span style={docIconCol}>{docIcons[doc.icon] || docIcons['📄']}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <p style={docTitle}>{doc.label}</p>
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
                    {doc.description !== doc.label && <p style={docDesc}>{doc.description}</p>}

                    {/* Balão flutuante: sobrepõe a lista, sem empurrar o conteúdo. */}
                    {temDica && showTip === doc.key && (
                      <div style={{
                        position: 'absolute', left: 46, right: 0, top: 64, zIndex: 20,
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

                    <div style={{ ...docBotoesLinha, position: 'relative', display: 'flex', gap: 8, marginTop: 10 }}>
                      {uploaded ? (
                        // Toque limpa o arquivo e volta o botão de envio.
                        <button onClick={() => dispatch({ type: 'SET_DOCUMENT', key: doc.key, file: null })}
                          style={{ ...docActionStyle, borderColor: GOLD, color: GOLD, background: 'rgba(246,199,0,0.08)' }}>
                          <Check size={17} strokeWidth={2.6} />
                          Enviado · trocar arquivo
                        </button>
                      ) : isPdfOnly ? (
                        <button onClick={() => openPdfPicker(doc.key)} style={docActionStyle}>
                          <Upload size={18} strokeWidth={2} />
                          Adicionar PDF
                        </button>
                      ) : isSelfie ? (
                        // Selfie só pela câmera (foto na hora, sem galeria nem PDF).
                        <button onClick={() => openFilePicker(doc.key)} style={docActionStyle}>
                          <Camera size={18} strokeWidth={1.9} />
                          Tirar foto
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setMenuDoc(menuDoc === doc.key ? null : doc.key)}
                            style={{ ...docActionStyle, ...(menuDoc === doc.key ? { borderColor: GOLD } : {}) }}>
                            <Upload size={18} strokeWidth={2} />
                            {doc.key === 'Comprovante de ganhos' ? 'Adicionar documentos' : 'Adicionar documento'}
                            <ChevronDown size={18} strokeWidth={2.2}
                              style={{ transition: 'transform 0.15s', transform: menuDoc === doc.key ? 'rotate(180deg)' : 'none' }} />
                          </button>
                          {menuDoc === doc.key && (
                            <MenuEnvio alinhar="right" onFechar={() => setMenuDoc(null)}
                              onEscolher={(o) => abrirArquivo(doc.key, o)} />
                          )}
                        </>
                      )}
                    </div>
                    {avisoDoc(doc.key)}
                  </div>
                </div>
              );
            })}

            {/* Campos complementares */}
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {beneficiario ? (
                // Banco em `nomeEmpresa` e tipo em `bairroTrabalho` (o admin já rotula assim).
                <div>
                  <h2 style={sectionTitle}>Seu benefício</h2>
                  <label style={sectionLabel}>Banco onde recebe</label>
                  <input type="text" className="dk-input" placeholder="Ex.: Caixa, Banco do Brasil, Bradesco"
                    value={state.nomeEmpresa}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: e.target.value })}
                    style={sectionInput}
                  />
                  <label style={{ ...sectionLabel, marginTop: 16 }}>Tipo de benefício</label>
                  <input type="text" className="dk-input" placeholder="Informe o benefício que você recebe"
                    value={state.bairroTrabalho}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: e.target.value })}
                    style={sectionInput}
                  />
                </div>
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
              ) : motoristaApp ? (
                // Motorista de aplicativo: só o item "Seu veículo" (sem empresa/local de trabalho),
                // no mesmo formato da lista de documentos.
                <div style={{ ...docItemStyle, marginTop: -22 }}>
                  <span style={docIconCol}><Car size={32} color="#fff" strokeWidth={1.6} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={docTitle}>Seu veículo</p>
                    <p style={{ ...docDesc, color: '#fff', marginTop: 6 }}>O veículo é próprio ou alugado?</p>
                    <div style={{ ...docBotoesLinha, display: 'flex', gap: 8, marginTop: 10 }}>
                      {(['PROPRIO', 'ALUGADO'] as const).map(v => {
                        const ativo = state.veiculoProprio === v;
                        return (
                          <button key={v} type="button"
                            onClick={() => dispatch({ type: 'SET_FIELD', field: 'veiculoProprio', value: v })}
                            style={{
                              ...docActionStyle,
                              ...(ativo ? { background: 'rgba(246,199,0,0.08)', borderColor: GOLD, color: GOLD } : {}),
                            }}>
                            {ativo && <Check size={16} strokeWidth={2.6} />}
                            {v === 'PROPRIO' ? 'Próprio' : 'Alugado'}
                          </button>
                        );
                      })}
                    </div>
                    <label style={{ ...docBotoesLinha, display: 'block', fontSize: 14.5, color: '#fff', margin: '14px 0 8px -46px' }}>
                      Placa do veículo
                    </label>
                    <input type="text" className="dk-input" placeholder="Digite a placa"
                      value={state.placaVeiculo} maxLength={8}
                      onChange={e => dispatch({ type: 'SET_FIELD', field: 'placaVeiculo', value: e.target.value.toUpperCase() })}
                      style={{
                        ...docBotoesLinha, width: 'calc(100% + 46px)', boxSizing: 'border-box', height: 46, padding: '0 14px',
                        borderRadius: 10, border: `1.5px solid ${DOC_BORDA}`, background: 'transparent',
                        fontSize: 16, color: '#fff', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ) : semComprovacao ? (
                <ExtraField
                  icon={<Briefcase />}
                  label="Dados de renda"
                  placeholder="Você trabalha com o quê?"
                  value={state.nomeEmpresa}
                  onChange={v => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: v })}
                />
              ) : recebeSeguro ? (
                // Tipo de seguro fica em `bairroTrabalho` (o admin já mostra como "Tipo de seguro").
                <div>
                  <h2 style={sectionTitle}>Seu seguro</h2>
                  <label style={sectionLabel}>Tipo de seguro</label>
                  <input type="text" className="dk-input" placeholder="Informe o seguro que você recebe"
                    value={state.bairroTrabalho}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: e.target.value })}
                    style={sectionInput}
                  />
                </div>
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
              ) : trabalhoJob ? (
                // Site em `nomeEmpresa` e nome fantasia em `bairroTrabalho` (o admin rotula assim).
                <div>
                  <h2 style={sectionTitle}>Informe seus dados</h2>
                  <label style={sectionLabel}>Nome do site onde trabalha</label>
                  <input type="text" className="dk-input" placeholder="Digite o nome do site"
                    value={state.nomeEmpresa}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: e.target.value })}
                    style={sectionInput}
                  />
                  <label style={{ ...sectionLabel, marginTop: 16 }}>Nome fantasia usado no site</label>
                  <input type="text" className="dk-input" placeholder="Digite seu nome fantasia"
                    value={state.bairroTrabalho}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: e.target.value })}
                    style={sectionInput}
                  />
                </div>
              ) : carteiraAssinada || estagiario ? (
                <div>
                  <h2 style={sectionTitle}>{estagiario ? 'Seu estágio' : 'Seu trabalho'}</h2>
                  <label style={sectionLabel}>Nome da empresa</label>
                  <input type="text" className="dk-input" placeholder="Ex.: Planeta Calçados"
                    value={state.nomeEmpresa}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'nomeEmpresa', value: e.target.value })}
                    style={sectionInput}
                  />
                  <label style={{ ...sectionLabel, marginTop: 16 }}>Bairro e cidade da empresa</label>
                  <input type="text" className="dk-input" placeholder="Ex.: Centro, Camaçari"
                    value={state.bairroTrabalho}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'bairroTrabalho', value: e.target.value })}
                    style={sectionInput}
                  />
                </div>
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

              {!trabalhoJob && <div>
                <button type="button" onClick={() => setObsOpen(v => !v)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                  color: GOLD, fontWeight: 600, fontSize: 15.5,
                }}>
                  + Adicionar informação (opcional)
                  <ChevronDown size={18} strokeWidth={2.2}
                    style={{ transition: 'transform 0.15s', transform: obsOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {obsOpen && (
                  <div style={{ marginTop: 12 }}>
                    <ExtraField
                      icon={<MessageSquare />} multiline
                      label="Observação" optional
                      placeholder="Escreva algo se quiser ajudar na análise"
                      value={state.observacao}
                      onChange={v => dispatch({ type: 'SET_FIELD', field: 'observacao', value: v })}
                    />
                  </div>
                )}
              </div>}
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
                padding: '16px', borderRadius: 12, color: '#111827', fontWeight: 800, fontSize: 17,
                background: GOLD, opacity: 0.85,
              }}>
                <div style={{
                  width: 20, height: 20, border: '2.5px solid rgba(17,24,39,0.3)', borderTopColor: '#111827',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                {progresso && progresso.feitos < progresso.total
                  ? `Enviando documentos ${progresso.feitos + 1} de ${progresso.total}...`
                  : 'Finalizando...'}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <>
                <button onClick={handleSubmit} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: GOLD,
                  color: '#111827', fontWeight: 800, fontSize: 17,
                }}>
                  Enviar solicitação
                  <ArrowRight size={20} strokeWidth={2.4} />
                </button>
                <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 13, color: MUTED }}>
                  Sua solicitação será enviada para análise.
                </p>
              </>
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
