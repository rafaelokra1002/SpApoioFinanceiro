import { useMemo, useState } from 'react';
import { Download, FolderArchive, Lightbulb, Loader2 } from 'lucide-react';
import { Lead } from '../types';
import { CARD_ORDER, METRICS, MetricKey } from '../constants/status';
import { downloadAllLeadsBackup } from '../utils/leadDossier';

interface BackupPanelProps {
  leads: Lead[];
  loading: boolean;
}

/** Texto do card e prefixo do arquivo .zip de cada grupo. */
const BACKUP_META: Record<MetricKey, { desc: string; file: string }> = {
  total: { desc: 'Todos os clientes da base.', file: 'backup_todos' },
  PENDENTE: { desc: 'Todos os registros pendentes.', file: 'backup_pendentes' },
  APROVADO: { desc: 'Todos os registros aprovados.', file: 'backup_aprovados' },
  RECUSADO: { desc: 'Todos os registros recusados.', file: 'backup_recusados' },
  NAO_CONTRATOU: { desc: 'Clientes que não fecharam contrato.', file: 'backup_nao_contrataram' },
  PASSEI_COLABORADOR: { desc: 'Registros transferidos para colaborador.', file: 'backup_colaborador' },
};

export default function BackupPanel({ leads, loading }: BackupPanelProps) {
  /** Card em execução (null = nenhum). Só um backup por vez. */
  const [running, setRunning] = useState<MetricKey | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const grupos = useMemo(() => {
    const porStatus = new Map<MetricKey, Lead[]>();
    porStatus.set('total', leads);
    for (const key of CARD_ORDER) {
      if (key !== 'total') porStatus.set(key, leads.filter((l) => l.status === key));
    }
    return porStatus;
  }, [leads]);

  const baixar = async (key: MetricKey) => {
    const doGrupo = grupos.get(key) ?? [];
    if (running || doGrupo.length === 0) return;

    setRunning(key);
    setError(null);
    setProgress({ done: 0, total: doGrupo.length });
    try {
      await downloadAllLeadsBackup(
        doGrupo,
        (done, total) => setProgress({ done, total }),
        BACKUP_META[key].file,
      );
    } catch (err) {
      setError('Falha ao gerar o backup. Tente novamente.');
      console.error('Erro no backup:', err);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h2 className="flex items-center gap-2.5 text-[22px] font-bold text-ink">
          <Download size={22} className="text-success" strokeWidth={2.5} />
          Backup de Dados
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Exporte seus dados em ZIP para manter um backup seguro. Cada arquivo traz uma pasta por
          cliente com o resumo do cadastro (.txt e .pdf) e os documentos enviados.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARD_ORDER.map((key) => {
          const meta = METRICS[key];
          const Icon = meta.icon;
          const total = grupos.get(key)?.length ?? 0;
          const ativo = running === key;
          const pct = ativo && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

          return (
            <div key={key} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
                  <Icon size={19} className={meta.iconFg} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14.5px] font-bold text-ink">{meta.label}</h3>
                    <span className="rounded-md bg-canvas px-1.5 py-0.5 text-[11.5px] font-semibold text-muted">
                      {total}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-muted">{BACKUP_META[key].desc}</p>
                </div>
              </div>

              {ativo && (
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[11.5px] text-muted">
                    <span>Baixando documentos...</span>
                    <span>{progress.done}/{progress.total}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={() => baixar(key)}
                disabled={loading || running !== null || total === 0}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-warning px-3.5 py-2 text-[12.5px]
                  font-bold text-white transition-colors hover:brightness-110 cursor-pointer
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ativo
                  ? <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                  : <><FolderArchive size={15} /> ZIP</>}
              </button>
            </div>
          );
        })}
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-[12.5px] text-muted">
        <Lightbulb size={15} className="mt-0.5 shrink-0 text-warning" />
        <span>
          <strong className="text-ink">Dica:</strong> o ZIP é gerado no seu navegador e baixado para
          o seu computador — ideal para visualização, impressão e arquivamento. Com muitos
          documentos, pode levar alguns minutos.
        </span>
      </p>
    </div>
  );
}
