import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, FileText, ImageIcon, Search, X } from 'lucide-react';
import { Lead } from '../types';
import Avatar from './Avatar';

interface PhotosGalleryProps {
  leads: Lead[];
  loading: boolean;
}

interface ClientRow {
  lead: Lead;
  total: number;
  imagens: number;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

const isImage = (filename: string, url: string) => IMAGE_EXT.test(filename) || IMAGE_EXT.test(url);

export default function PhotosGallery({ leads, loading }: PhotosGalleryProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);

  const rows = useMemo<ClientRow[]>(() => {
    return leads
      .filter((lead) => (lead.documentos?.length ?? 0) > 0)
      .map((lead) => {
        const docs = lead.documentos ?? [];
        return {
          lead,
          total: docs.length,
          imagens: docs.filter((d) => isImage(d.filename, d.url)).length,
        };
      })
      .sort((a, b) => a.lead.nome.localeCompare(b.lead.nome, 'pt-BR'));
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.lead.nome.toLowerCase().includes(q));
  }, [rows, query]);

  const totalArquivos = useMemo(() => rows.reduce((acc, r) => acc + r.total, 0), [rows]);

  if (loading) {
    return <p className="py-24 text-center text-sm text-subtle">Carregando...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10">
          <ImageIcon size={24} className="text-brand-deep" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[13px] font-medium text-muted">Total de arquivos</p>
          <p className="text-[30px] font-bold leading-tight text-ink">{totalArquivos}</p>
          <p className="text-[12px] text-subtle">enviados por {rows.length} clientes</p>
        </div>
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
          {query ? 'Nenhum cliente encontrado' : 'Nenhum documento enviado pelos clientes ainda'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          {filtered.map((row, i) => (
            <button
              key={row.lead.id}
              onClick={() => setSelected(row.lead)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas
                ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <Avatar name={row.lead.nome} documentos={row.lead.documentos} className="h-11 w-11 text-[14px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{row.lead.nome}</p>
                <p className="text-[12px] text-subtle">
                  {row.total} {row.total === 1 ? 'arquivo' : 'arquivos'}
                  {row.imagens > 0 && ` · ${row.imagens} ${row.imagens === 1 ? 'foto' : 'fotos'}`}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-subtle" />
            </button>
          ))}
        </div>
      )}

      {selected && <DocumentsModal lead={selected} onClose={() => setSelected(null)} />}
    </div>
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
