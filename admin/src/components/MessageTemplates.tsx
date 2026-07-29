import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck, CheckCircle2, Clock, Info, Loader2, MessageSquare, Save, UserX, X, XCircle,
  type LucideIcon,
} from 'lucide-react';
import { fetchMessageTemplates, upsertMessageTemplate } from '../services/api';
import { MOTIVOS_RECUSA } from './leads/RecusarModal';
import {
  APROVACAO_AVISTA_DEFAULT, APROVACAO_AVISTA_DE_PARCELADO_DEFAULT, APROVACAO_PARCELADO_DEFAULT,
  RECUSA_DEFAULTS, getAprovacaoTemplate, getRecusaTemplates, saveAprovacaoTemplate, saveRecusaTemplate,
} from '../utils/localTemplates';

type ModuloId = 'solicitacoes' | 'painel';

interface MessageMeta {
  /** Status do lead (módulo "solicitacoes") ou grupo de recusa (módulo "recusas"). */
  key: string;
  modulo: ModuloId;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
  iconClass: string;
  /** Variáveis aceitas por esta mensagem. */
  variaveis: string[];
}

const VARS_LEAD = ['{{nome}}', '{{valor}}', '{{telefone}}', '{{cidade}}', '{{email}}', '{{cpf}}', '{{status}}'];
const VARS_RECUSA = ['{{nome}}', '{{motivo}}'];
const VARS_APROVACAO = ['{{nome}}', '{{valor}}', '{{total}}', '{{modalidade}}', '{{parcelas}}'];
/** À vista não tem parcelas: o texto do pagamento é fixo. */
const VARS_APROVACAO_AVISTA = ['{{nome}}', '{{valor}}', '{{total}}', '{{modalidade}}'];

/** Chaves dos templates de aprovação (não são status: vêm do modal de aprovar). */
const APROVACAO_PARCELADO_KEY = 'aprovacao-parcelado';
const APROVACAO_AVISTA_KEY = 'aprovacao-avista';
const APROVACAO_AVISTA_DE_PARCELADO_KEY = 'aprovacao-avista-de-parcelado';

/** Mensagens editáveis, agrupadas pelo módulo a que pertencem. */
const MENSAGENS: MessageMeta[] = [
  {
    key: 'PENDENTE',
    modulo: 'solicitacoes',
    titulo: 'Solicitação Pendente',
    descricao: 'Enviada quando o cadastro entra na fila de análise.',
    icon: Clock,
    iconClass: 'bg-warning/10 text-warning',
    variaveis: VARS_LEAD,
  },
  {
    key: 'APROVADO',
    modulo: 'solicitacoes',
    titulo: 'Solicitação Aprovada',
    descricao: 'Enviada quando o crédito do cliente é aprovado.',
    icon: CheckCircle2,
    iconClass: 'bg-success/10 text-success',
    variaveis: VARS_LEAD,
  },
  {
    key: 'RECUSADO',
    modulo: 'solicitacoes',
    titulo: 'Solicitação Recusada',
    descricao: 'Enviada quando a solicitação não é aprovada.',
    icon: XCircle,
    iconClass: 'bg-danger/10 text-danger',
    variaveis: VARS_LEAD,
  },
  {
    key: APROVACAO_PARCELADO_KEY,
    modulo: 'painel',
    titulo: 'Aprovação parcelada — mensagem',
    descricao: 'Texto copiado no modal ao aprovar na modalidade parcelada.',
    icon: BadgeCheck,
    iconClass: 'bg-success/10 text-success',
    variaveis: VARS_APROVACAO,
  },
  {
    key: APROVACAO_AVISTA_KEY,
    modulo: 'painel',
    titulo: 'Aprovação à vista — mensagem',
    descricao: 'Texto copiado no modal ao aprovar à vista.',
    icon: BadgeCheck,
    iconClass: 'bg-success/10 text-success',
    variaveis: VARS_APROVACAO_AVISTA,
  },
  {
    key: APROVACAO_AVISTA_DE_PARCELADO_KEY,
    modulo: 'painel',
    titulo: 'Aprovação à vista (pediu parcelado) — mensagem',
    descricao: 'Texto copiado quando o cliente pediu parcelado, mas foi aprovado só à vista.',
    icon: BadgeCheck,
    iconClass: 'bg-success/10 text-success',
    variaveis: VARS_APROVACAO_AVISTA,
  },
  ...MOTIVOS_RECUSA.map<MessageMeta>((m) => ({
    key: String(m.grupo),
    modulo: 'painel' as const,
    titulo: `Recusa — ${m.titulo}`,
    descricao: `Usada no modal de recusa quando o motivo é "${m.motivoCurto}"`,
    icon: UserX,
    iconClass: 'bg-danger/10 text-danger',
    variaveis: VARS_RECUSA,
  })),
];

/** Seções da página, na ordem em que aparecem. */
const GRUPOS: { id: ModuloId; titulo: string }[] = [
  { id: 'solicitacoes', titulo: 'Mensagens automáticas por status' },
  { id: 'painel', titulo: 'Mensagens montadas no painel (aprovação e recusa)' },
];

const DEFAULT_TEMPLATES: Record<string, string> = {
  PENDENTE: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *{{valor}}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  APROVADO: `Olá *{{nome}}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *{{valor}}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para finalizar o processo com você.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  RECUSADO: `Olá *{{nome}}*, tudo bem?\n\nApós análise da sua solicitação de crédito no valor de *{{valor}}*, infelizmente não foi possível aprovar o pedido neste momento.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
};

/** Chave única por mensagem — o grupo de recusa "1" não colide com o status "PENDENTE". */
function idDe(m: MessageMeta): string {
  return `${m.modulo}:${m.key}`;
}

function textoPadrao(m: MessageMeta): string {
  if (m.modulo === 'solicitacoes') return DEFAULT_TEMPLATES[m.key] ?? '';
  if (m.key === APROVACAO_PARCELADO_KEY) return APROVACAO_PARCELADO_DEFAULT;
  if (m.key === APROVACAO_AVISTA_KEY) return APROVACAO_AVISTA_DEFAULT;
  if (m.key === APROVACAO_AVISTA_DE_PARCELADO_KEY) return APROVACAO_AVISTA_DE_PARCELADO_DEFAULT;
  return RECUSA_DEFAULTS[Number(m.key)] ?? '';
}

/** Texto atual gravado no navegador (só para as mensagens do módulo "painel"). */
function textoSalvo(m: MessageMeta, recusas: Record<number, string>): string {
  if (m.modulo === 'solicitacoes') return textoPadrao(m);
  if (m.key === APROVACAO_PARCELADO_KEY) return getAprovacaoTemplate('PARCELADO');
  if (m.key === APROVACAO_AVISTA_KEY) return getAprovacaoTemplate('AVISTA');
  if (m.key === APROVACAO_AVISTA_DE_PARCELADO_KEY) return getAprovacaoTemplate('AVISTA_DE_PARCELADO');
  return recusas[Number(m.key)];
}

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    const recusas = getRecusaTemplates();
    for (const m of MENSAGENS) inicial[idDe(m)] = textoSalvo(m, recusas);
    return inicial;
  });
  const [editando, setEditando] = useState<MessageMeta | null>(null);

  useEffect(() => {
    fetchMessageTemplates().then((res) => {
      if (res.success && res.data) {
        setTemplates((prev) => {
          const map = { ...prev };
          for (const t of res.data!) map[`solicitacoes:${t.status}`] = t.content;
          return map;
        });
      }
    }).catch(() => {});
  }, []);

  /** Solicitações vão para o backend; as do painel ficam no navegador (ver localTemplates). */
  const salvar = async (m: MessageMeta, content: string): Promise<boolean> => {
    if (m.modulo === 'solicitacoes') {
      const res = await upsertMessageTemplate(m.key, content);
      return res.success;
    }
    if (m.key === APROVACAO_PARCELADO_KEY) saveAprovacaoTemplate('PARCELADO', content);
    else if (m.key === APROVACAO_AVISTA_KEY) saveAprovacaoTemplate('AVISTA', content);
    else if (m.key === APROVACAO_AVISTA_DE_PARCELADO_KEY) saveAprovacaoTemplate('AVISTA_DE_PARCELADO', content);
    else saveRecusaTemplate(Number(m.key), content);
    return true;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <MessageSquare size={20} className="text-brand-deep" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-[22px] font-bold leading-tight text-ink">Edição de Mensagens</h2>
          <p className="mt-0.5 text-[13px] text-muted">Clique em uma mensagem para editar.</p>
        </div>
      </div>

      {/* Ajuda das variáveis */}
      <div className="flex gap-3 rounded-2xl border border-dashed border-brand/40 bg-brand/5 px-4 py-3.5">
        <Info size={17} className="mt-0.5 shrink-0 text-brand-deep" />
        <div className="min-w-0 text-[12.5px] text-muted">
          <p className="font-bold text-ink">Como funcionam as variáveis</p>
          <p className="mt-1">
            Escreva o nome da variável entre chaves duplas — ex.:{' '}
            <code className="rounded bg-canvas px-1 font-mono text-brand-deep">{'{{nome}}'}</code> vira o nome do
            cliente e <code className="rounded bg-canvas px-1 font-mono text-brand-deep">{'{{valor}}'}</code> vira o
            valor solicitado. No editor, clique nos chips para inserir automaticamente.
          </p>
          <p className="mt-1.5">
            <strong className="text-ink">Exemplo:</strong>{' '}
            <code className="font-mono">Olá {'{{nome}}'}, sua solicitação de {'{{valor}}'}...</code>{' '}
            → <em>Olá João, sua solicitação de R$ 2.500,00...</em>
          </p>
        </div>
      </div>

      {/* Cards */}
      {GRUPOS.map(({ id, titulo }) => {
        const doGrupo = MENSAGENS.filter((m) => m.modulo === id);
        return (
          <div key={id}>
            <p className="mb-2 text-[12.5px] text-muted">{titulo} ({doGrupo.length})</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doGrupo.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={idDe(m)}
                    onClick={() => setEditando(m)}
                    className="flex flex-col rounded-2xl border border-line bg-surface p-4 text-left shadow-sm
                      transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md cursor-pointer"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.iconClass}`}>
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <p className="mt-3 text-[14px] font-bold text-ink">{m.titulo}</p>
                    <p className="mt-1 text-[12.5px] leading-snug text-muted">{m.descricao}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="border-t border-line pt-4 text-center text-[12.5px] text-muted">
        As mensagens são enviadas via WhatsApp com base no template ativo.
      </p>

      {editando && (
        <EditorModal
          meta={editando}
          value={templates[idDe(editando)] ?? ''}
          onChange={(v) => setTemplates((prev) => ({ ...prev, [idDe(editando)]: v }))}
          onRestore={() => setTemplates((prev) => ({ ...prev, [idDe(editando)]: textoPadrao(editando) }))}
          onSave={(content) => salvar(editando, content)}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}

interface EditorModalProps {
  meta: MessageMeta;
  value: string;
  onChange: (v: string) => void;
  onRestore: () => void;
  onSave: (content: string) => Promise<boolean>;
  onClose: () => void;
}

function EditorModal({ meta, value, onChange, onRestore, onSave, onClose }: EditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const Icon = meta.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /** Insere a variável na posição do cursor (ou no fim, se o campo não tem foco). */
  const inserirVariavel = (v: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    onChange(value.slice(0, start) + v + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + v.length, start + v.length);
    });
  };

  const salvar = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setErro(null);
    try {
      if (await onSave(value)) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setErro('Não foi possível salvar a mensagem.');
      }
    } catch {
      setErro('Não foi possível salvar a mensagem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-[min(720px,96vw)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}>
              <Icon size={19} strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">{meta.titulo}</h3>
              <p className="text-[12.5px] text-muted">{meta.descricao}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-line cursor-pointer">
            <X size={17} className="text-subtle" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="mr-1 self-center text-[11.5px] font-medium text-muted">Variáveis:</span>
            {meta.variaveis.map((v) => (
              <button
                key={v}
                onClick={() => inserirVariavel(v)}
                title="Inserir no texto"
                className="rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-[11.5px] text-brand-deep
                  transition-colors hover:border-brand hover:bg-brand/10 cursor-pointer"
              >
                {v}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-[13.5px] leading-relaxed
              text-ink-2 placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />

          {erro && <p className="mt-2 text-[12.5px] text-danger">{erro}</p>}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-5 py-4">
          <button
            onClick={onRestore}
            className="rounded-xl bg-brand/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-brand-deep
              transition-colors hover:bg-brand/20 cursor-pointer"
          >
            Restaurar exemplo
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-line px-5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={salvar}
              disabled={saving || !value.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-bold text-white
                transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" />
                : saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
