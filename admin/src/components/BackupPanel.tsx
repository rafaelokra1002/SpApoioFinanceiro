import { useMemo, useState } from 'react';
import { Download, HardDrive, Loader2 } from 'lucide-react';
import { Lead } from '../types';
import { downloadAllLeadsBackup } from '../utils/leadDossier';

interface BackupPanelProps {
  leads: Lead[];
  loading: boolean;
}

export default function BackupPanel({ leads, loading }: BackupPanelProps) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const totalDocs = useMemo(
    () => leads.reduce((sum, l) => sum + (l.documentos?.length ?? 0), 0),
    [leads],
  );

  const handleBackup = async () => {
    setRunning(true);
    setError(null);
    setProgress({ done: 0, total: leads.length });
    try {
      await downloadAllLeadsBackup(leads, (done, total) => setProgress({ done, total }));
    } catch (err) {
      setError('Falha ao gerar o backup. Tente novamente.');
      console.error('Erro no backup:', err);
    } finally {
      setRunning(false);
    }
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <HardDrive size={24} className="text-brand-deep" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-ink">Backup dos clientes</h2>
            <p className="mt-1 text-[13px] text-muted">
              Gera um arquivo <strong>.zip</strong> com uma pasta por cliente, contendo o resumo do
              cadastro (<code>.txt</code> e <code>.pdf</code>) e todos os documentos enviados.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-canvas/60 px-4 py-3">
            <p className="text-[12px] text-muted">Clientes</p>
            <p className="text-[22px] font-bold text-ink">{leads.length}</p>
          </div>
          <div className="rounded-xl border border-line bg-canvas/60 px-4 py-3">
            <p className="text-[12px] text-muted">Documentos</p>
            <p className="text-[22px] font-bold text-ink">{totalDocs}</p>
          </div>
        </div>

        {running && (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-[12px] text-muted">
              <span>Gerando backup... (baixando documentos)</span>
              <span>{progress.done}/{progress.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}

        <button
          onClick={handleBackup}
          disabled={running || loading || leads.length === 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3
            text-[14px] font-bold text-white transition-colors hover:bg-brand-deep
            disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {running
            ? <><Loader2 size={17} className="animate-spin" /> Gerando...</>
            : <><Download size={17} /> Baixar backup (.zip)</>}
        </button>

        <p className="mt-3 text-[11.5px] text-subtle">
          O backup é gerado no seu navegador e baixado para o seu computador. Com muitos documentos,
          pode levar alguns minutos.
        </p>
      </div>
    </div>
  );
}
