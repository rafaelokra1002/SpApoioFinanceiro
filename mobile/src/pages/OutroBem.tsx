import React, { useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Percent, BadgePercent, Lock, ShieldCheck,
  Package, Video, Camera, Check, ChevronDown,
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { UploadedFile } from '../types';
import { compressImage } from '../utils/image';
import { maskValorBR, videoDuration } from '../utils/media';

/* Chaves usadas para guardar as mídias no state.documents (seguem no envio final). */
const MEDIA = {
  video: 'Outro bem — Vídeo',
  foto1: 'Outro bem — Foto 1',
  foto2: 'Outro bem — Foto 2',
  foto3: 'Outro bem — Foto 3',
} as const;
type MediaKey = keyof typeof MEDIA;

const ESTADOS = [
  'Novo (lacrado)', 'Seminovo', 'Usado – bom estado', 'Usado – com marcas de uso',
];

const MIDIAS: { key: MediaKey; titulo: string; sub: string; video?: boolean }[] = [
  { key: 'video', titulo: 'Vídeo do bem', sub: 'Máx. 60s', video: true },
  { key: 'foto1', titulo: 'Foto 1', sub: 'do bem' },
  { key: 'foto2', titulo: 'Foto 2', sub: 'do bem' },
  { key: 'foto3', titulo: 'Foto 3', sub: 'do bem' },
];

export function OutroBem() {
  const { state, dispatch } = useLoan();
  const g = state.garantiaOutro;
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState<MediaKey | null>(null);
  const [expectVideo, setExpectVideo] = useState(false);

  const setG = (patch: Partial<typeof g>) =>
    dispatch({ type: 'SET_FIELD', field: 'garantiaOutro', value: { ...g, ...patch } });

  const abrirSeletor = (key: MediaKey, video: boolean) => {
    setSlot(key);
    setExpectVideo(video);
    if (inputRef.current) inputRef.current.accept = video ? 'video/*' : 'image/*';
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = '';
    if (!raw || !slot) return;

    if (expectVideo) {
      if (!raw.type.startsWith('video/')) { setError('Envie um arquivo de vídeo.'); return; }
      const dur = await videoDuration(raw).catch(() => 0);
      if (dur > 62) { setError('O vídeo deve ter no máximo 60 segundos.'); return; }
      setError('');
      dispatch({ type: 'SET_DOCUMENT', key: MEDIA[slot], file: { file: raw, preview: URL.createObjectURL(raw) } });
      return;
    }

    if (!raw.type.startsWith('image/')) { setError('Envie uma foto/imagem.'); return; }
    setError('');
    const file = await compressImage(raw);
    dispatch({ type: 'SET_DOCUMENT', key: MEDIA[slot], file: { file, preview: URL.createObjectURL(file) } });
  };

  const continuar = () => {
    if (!g.nome.trim()) { setError('Informe o nome do bem.'); return; }
    if (!g.valorMercado.trim()) { setError('Informe o valor de mercado.'); return; }
    setError('');
    dispatch({ type: 'SET_STEP', step: 4 });
  };

  const midiaFile = (key: MediaKey): UploadedFile | null => state.documents[MEDIA[key]] ?? null;

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <input ref={inputRef} type="file" onChange={onFile} style={{ display: 'none' }} />

      {/* Faixa azul só do Voltar */}
      <div style={{
        background: 'linear-gradient(120deg, #123bd6 0%, #1a45e0 45%, #2551f0 100%)',
        padding: '14px 20px',
      }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 6 })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
          background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.5)',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          <ArrowLeft size={17} strokeWidth={2.5} />
          Voltar
        </button>
      </div>

      {/* Cabeçalho claro */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            minWidth: 68, width: 68, height: 68, borderRadius: '50%', background: '#f1f3f7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={32} color="#4b5563" strokeWidth={1.7} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: '#0d2b5e', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              Outros bens de valor
            </h1>
            <p style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.4, color: '#6b7280' }}>
              Informe os detalhes do bem que será oferecido como garantia.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ background: '#fff', position: 'relative', padding: '16px 18px 22px' }}>
        {/* Badges */}
        <div style={{
          display: 'flex', gap: 8, padding: '11px 12px', borderRadius: 14,
          background: '#f6f8fd', border: '1px solid #e8effc', marginBottom: 16,
        }}>
          <Badge icon={<Percent size={17} color="#2546f0" strokeWidth={2.2} />} texto={<>Até <strong>50%</strong> do valor do bem</>} />
          <Badge icon={<BadgePercent size={17} color="#2546f0" strokeWidth={2.2} />} texto={<><strong>Taxa</strong> reduzida</>} />
          <Badge icon={<Lock size={17} color="#2546f0" strokeWidth={2.2} />} texto={<><strong>Bem retido</strong> como garantia</>} />
        </div>

        {/* Sobre o bem */}
        <h2 style={secTitle}>Sobre o bem</h2>

        <Campo label="Nome do bem">
          <input style={inputStyle} value={g.nome}
            placeholder="Digite o nome do bem"
            onChange={e => setG({ nome: e.target.value })}
            onFocus={foco} onBlur={desfoco} />
        </Campo>

        <Campo label="Descrição">
          <textarea rows={3} maxLength={200} value={g.descricao}
            placeholder="Descreva o bem e suas características"
            onChange={e => setG({ descricao: e.target.value })}
            onFocus={foco} onBlur={desfoco}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 78, lineHeight: 1.4 }} />
          <div style={{ textAlign: 'right', fontSize: 11.5, color: '#9aa3b2', marginTop: 2 }}>
            {g.descricao.length}/200
          </div>
        </Campo>

        <div style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={miniLabel}>Estado de conservação</label>
            <Select value={g.estadoConservacao} placeholder="Selecione"
              options={ESTADOS} onChange={val => setG({ estadoConservacao: val })} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={miniLabel}>Valor de mercado (R$)</label>
            <input style={inputStyle} value={g.valorMercado} inputMode="numeric"
              placeholder="Ex: 0,00"
              onChange={e => setG({ valorMercado: maskValorBR(e.target.value) })}
              onFocus={foco} onBlur={desfoco} />
          </div>
        </div>

        {/* Mídias */}
        <h2 style={{ ...secTitle, marginTop: 24 }}>Mídias do bem</h2>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: -8, marginBottom: 10 }}>
          Envie 1 vídeo e 3 fotos nítidas (vários ângulos e detalhes).
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {MIDIAS.map(m => {
            const file = midiaFile(m.key);
            return (
              <button key={m.key} onClick={() => abrirSeletor(m.key, !!m.video)}
                style={{
                  flex: 1, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '11px 6px', borderRadius: 12, minHeight: 78,
                  background: file ? '#eef3fd' : '#f6f8fd',
                  border: `1.5px solid ${file ? '#2546f0' : '#dbe3f2'}`,
                }}>
                {file && !m.video && (
                  <img src={file.preview} alt="" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9,
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: file ? '#128a4d' : '#e2eaff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {file ? <Check size={18} color="#fff" strokeWidth={3} />
                      : m.video ? <Video size={18} color="#2546f0" strokeWidth={2} />
                      : <Camera size={18} color="#2546f0" strokeWidth={2} />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: file && !m.video ? '#fff' : '#2546f0' }}>{m.titulo}</div>
                    <div style={{ fontSize: 10, color: file && !m.video ? '#fff' : '#8a93a5' }}>{m.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 14px', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* CTA */}
        <button onClick={continuar} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          width: '100%', padding: '15px', borderRadius: 14, border: 'none', marginTop: 20,
          background: '#123bd6', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(18,59,214,0.3)',
        }}>
          <span style={{ flex: 1, textAlign: 'center', paddingLeft: 26 }}>Continuar para documentos</span>
          <ArrowRight size={20} strokeWidth={2.2} />
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          <ShieldCheck size={18} color="#2546f0" strokeWidth={1.9} />
          <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.4 }}>
            <strong style={{ color: '#0d2b5e' }}>Informações seguras</strong> — usamos criptografia e seguimos a LGPD.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Peças ─── */

function Select({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 34,
          color: value ? '#1f2937' : '#9aa3b2', cursor: 'pointer',
        }}
        onFocus={foco} onBlur={desfoco}>
        <option value="" disabled>{placeholder}</option>
        {options.map(op => <option key={op} value={op} style={{ color: '#1f2937' }}>{op}</option>)}
      </select>
      <ChevronDown size={18} color="#6b7280" strokeWidth={2}
        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

function Badge({ icon, texto }: { icon: React.ReactNode; texto: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{
        minWidth: 30, width: 30, height: 30, borderRadius: '50%', background: '#e2eaff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <span style={{ fontSize: 11.5, lineHeight: 1.3, color: '#374151' }}>{texto}</span>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={miniLabel}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Estilos ─── */

const secTitle: React.CSSProperties = {
  fontSize: 18, fontWeight: 800, color: '#0d2b5e', letterSpacing: '-0.01em', marginBottom: 11,
};
const miniLabel: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#4b5563', marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, color: '#1f2937',
  background: '#fff', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};
const foco = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = '#2546f0');
const desfoco = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = '#e5e7eb');
