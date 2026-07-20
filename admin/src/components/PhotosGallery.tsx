import { useEffect, useMemo, useState } from 'react';
import { FileText, MapPin, Phone, Search, UserRound, Wallet, X } from 'lucide-react';
import { Lead } from '../types';
import { METRICS, STATUS_ORDER, StatusKey, statusLabel } from '../constants/status';
import { formatCurrency } from '../utils/analytics';
import { clientPhotoUrl } from '../utils/avatar';
import Avatar from './Avatar';

interface PhotosGalleryProps {
  leads: Lead[];
  loading: boolean;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

const isImage = (filename: string, url: string) => IMAGE_EXT.test(filename) || IMAGE_EXT.test(url);

/** Badge sólida sobre a foto — as classes de METRICS são translúcidas demais aqui. */
const BADGE_SOLIDO: Record<StatusKey, string> = {
  PENDENTE: 'bg-warning',
  APROVADO: 'bg-success',
  RECUSADO: 'bg-danger',
  NAO_CONTRATOU: 'bg-orange',
  PASSEI_COLABORADOR: 'bg-info',
};

type Aba = 'todos' | StatusKey;

const ABAS: Aba[] = ['todos', ...STATUS_ORDER];

export default function PhotosGallery({ leads, loading }: PhotosGalleryProps) {
  const [query, setQuery] = useState('');
  const [aba, setAba] = useState<Aba>('todos');
  const [selected, setSelected] = useState<Lead | null>(null);

  /** Só entram na galeria clientes que enviaram algum documento. */
  const comDocumentos = useMemo(
    () => leads
      .filter((lead) => (lead.documentos?.length ?? 0) > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [leads],
  );

  const contagem = useMemo(() => {
    const mapa = new Map<Aba, number>([['todos', comDocumentos.length]]);
    for (const s of STATUS_ORDER) {
      mapa.set(s, comDocumentos.filter((l) => l.status === s).length);
    }
    return mapa;
  }, [comDocumentos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comDocumentos.filter((lead) => {
      if (aba !== 'todos' && lead.status !== aba) return false;
      return !q || lead.nome.toLowerCase().includes(q);
    });
  }, [comDocumentos, aba, query]);

  if (loading) {
    return <p className="py-24 text-center text-sm text-subtle">Carregando...</p>;
  }

  return (
    <div className="space-y-5">
      {/* Abas por status */}
      <div className="flex flex-wrap gap-2.5">
        {ABAS.map((key) => {
          const ativo = aba === key;
          return (
            <button
              key={key}
              onClick={() => setAba(key)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold
                transition-colors cursor-pointer
                ${ativo
                  ? 'border-success bg-success text-white'
                  : 'border-line bg-surface text-ink-2 hover:bg-canvas'}`}
            >
              {key === 'todos' ? 'Todos' : statusLabel(key)}
              <span className={`text-[11.5px] font-bold ${ativo ? 'text-white/80' : 'text-subtle'}`}>
                {contagem.get(key) ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente..."
          className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink
            placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query ? 'Nenhum cliente encontrado' : 'Nenhum cliente com documentos neste status'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => (
            <ClientCard key={lead.id} lead={lead} onOpen={() => setSelected(lead)} />
          ))}
        </div>
      )}

      {selected && <DocumentsModal lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ClientCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const foto = clientPhotoUrl(lead.documentos);
  const meta = METRICS[lead.status as StatusKey];
  const BadgeIcon = meta?.icon ?? UserRound;
  const docs = lead.documentos?.length ?? 0;

  return (
    <button
      onClick={onOpen}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-3 text-left shadow-sm
        transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl bg-canvas">
        {foto ? (
          <img
            src={foto}
            alt={lead.nome}
            loading="lazy"
            className="h-44 w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <Avatar name={lead.nome} rounded="rounded-xl" className="h-44 w-full text-[38px]" />
        )}
        <span
          className={`absolute right-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1
            text-[11.5px] font-bold text-white shadow-sm
            ${BADGE_SOLIDO[lead.status as StatusKey] ?? 'bg-subtle'}`}
        >
          <BadgeIcon size={13} strokeWidth={2.5} />
          {statusLabel(lead.status)}
        </span>
      </div>

      <p className="mt-3 truncate text-[14.5px] font-bold text-ink">{lead.nome}</p>
      <div className="mt-2 space-y-1.5">
        <CardRow icon={Phone}>{lead.telefone}</CardRow>
        <CardRow icon={MapPin}>{lead.cidade}</CardRow>
        <CardRow icon={Wallet}>{formatCurrency(lead.valorSolicitado)}</CardRow>
        <CardRow icon={UserRound}>{lead.indicacao || '—'}</CardRow>
      </div>

      <p className="mt-2.5 text-[11.5px] text-subtle">
        {docs} {docs === 1 ? 'arquivo enviado' : 'arquivos enviados'}
      </p>
    </button>
  );
}

function CardRow({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[12.5px] text-muted">
      <Icon size={14} className="shrink-0 text-subtle" strokeWidth={2} />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

interface DocumentsModalProps {
  lead: Lead;
  onClose: () => void;
}

function DocumentsModal({ lead, onClose }: DocumentsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const docs = lead.documentos ?? [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-[min(940px,95vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={lead.nome} documentos={lead.documentos} className="h-10 w-10 text-[13px]" />
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-bold text-ink">{lead.nome}</h3>
              <p className="text-[12px] text-subtle">{docs.length} {docs.length === 1 ? 'arquivo' : 'arquivos'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer"
          >
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {docs.length === 0 ? (
            <p className="py-16 text-center text-sm text-subtle">Nenhum documento enviado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  title={doc.filename}
                >
                  <div className="flex aspect-square items-center justify-center bg-canvas">
                    {isImage(doc.filename, doc.url) ? (
                      <img src={doc.url} alt={doc.filename} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={40} className="text-subtle" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="truncate text-[11px] text-subtle" title={doc.filename}>{doc.filename}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
