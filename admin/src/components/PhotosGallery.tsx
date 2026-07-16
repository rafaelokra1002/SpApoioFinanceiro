import { useMemo, useState } from 'react';
import { FileText, ImageIcon, Search } from 'lucide-react';
import { Lead } from '../types';

interface PhotosGalleryProps {
  leads: Lead[];
  loading: boolean;
}

interface Item {
  id: string;
  url: string;
  filename: string;
  cliente: string;
  isImage: boolean;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

export default function PhotosGallery({ leads, loading }: PhotosGalleryProps) {
  const [query, setQuery] = useState('');

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    for (const lead of leads) {
      for (const doc of lead.documentos ?? []) {
        list.push({
          id: doc.id,
          url: doc.url,
          filename: doc.filename,
          cliente: lead.nome,
          isImage: IMAGE_EXT.test(doc.filename) || IMAGE_EXT.test(doc.url),
        });
      }
    }
    return list;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.cliente.toLowerCase().includes(q) || i.filename.toLowerCase().includes(q));
  }, [items, query]);

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
          <p className="text-[30px] font-bold leading-tight text-ink">{items.length}</p>
          <p className="text-[12px] text-subtle">enviados por {leads.filter((l) => (l.documentos?.length ?? 0) > 0).length} clientes</p>
        </div>
      </div>

      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente ou arquivo..."
          className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-ink
            placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-24 text-center text-sm text-subtle">
          {query ? 'Nenhum arquivo encontrado' : 'Nenhum documento enviado pelos clientes ainda'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              title={`${item.filename} — ${item.cliente}`}
            >
              <div className="flex aspect-square items-center justify-center bg-canvas">
                {item.isImage ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText size={40} className="text-subtle" strokeWidth={1.5} />
                )}
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-[12.5px] font-semibold text-ink" title={item.cliente}>{item.cliente}</p>
                <p className="truncate text-[11px] text-subtle" title={item.filename}>{item.filename}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
