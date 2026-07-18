import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Save, MessageSquare } from 'lucide-react';
import { fetchMessageTemplates, upsertMessageTemplate } from '../services/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  APROVADO: { label: 'Aprovado', color: 'bg-success/10 text-success' },
  RECUSADO: { label: 'Recusado', color: 'bg-danger/10 text-danger' },
};

const VARIABLES = ['{{nome}}', '{{valor}}', '{{telefone}}', '{{cidade}}', '{{email}}', '{{cpf}}', '{{status}}'];

const DEFAULT_TEMPLATES: Record<string, string> = {
  PENDENTE: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *{{valor}}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  APROVADO: `Olá *{{nome}}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *{{valor}}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para finalizar o processo com você.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  RECUSADO: `Olá *{{nome}}*, tudo bem?\n\nApós análise da sua solicitação de crédito no valor de *{{valor}}*, infelizmente não foi possível aprovar o pedido neste momento.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
};

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<Record<string, string>>(DEFAULT_TEMPLATES);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchMessageTemplates().then((res) => {
      if (res.success && res.data) {
        const map: Record<string, string> = { ...DEFAULT_TEMPLATES };
        for (const t of res.data) map[t.status] = t.content;
        setTemplates(map);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (statusKey: string) => {
    const content = templates[statusKey];
    if (!content?.trim()) return;
    setSaving(statusKey);
    try {
      const res = await upsertMessageTemplate(statusKey, content);
      if (res.success) {
        setSaved(statusKey);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <MessageSquare size={18} className="text-brand-deep" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-ink">Templates de Mensagem</h2>
            <p className="text-[12.5px] text-subtle">Edite as mensagens enviadas para cada status</p>
          </div>
          <button
            onClick={() => setTemplates(DEFAULT_TEMPLATES)}
            className="ml-auto rounded-lg bg-brand/10 px-3 py-1.5 text-[12px] font-semibold text-brand-deep transition-colors hover:bg-brand/20 cursor-pointer"
          >
            Restaurar exemplos
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-1.5 rounded-xl bg-canvas p-3">
          <span className="mr-1 self-center text-[11px] font-medium text-muted">Variáveis:</span>
          {VARIABLES.map((v) => (
            <span key={v} className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-brand-deep">
              {v}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
            <div key={key} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-lg px-2.5 py-1 text-[12px] font-bold ${color}`}>{label}</span>
                <button
                  onClick={() => handleSave(key)}
                  disabled={saving === key}
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {saving === key ? <Loader2 size={13} className="animate-spin" />
                    : saved === key ? <CheckCircle2 size={13} /> : <Save size={13} />}
                  {saved === key ? 'Salvo!' : 'Salvar'}
                </button>
              </div>
              <textarea
                value={templates[key] || ''}
                onChange={(e) => setTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={6}
                className="w-full resize-y rounded-xl border border-line px-3 py-2.5 text-[13px] text-ink-2 placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
