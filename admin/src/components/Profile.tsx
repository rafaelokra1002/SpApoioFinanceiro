import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import WhatsAppConnection from './WhatsAppConnection';
import { ADMIN_EMAIL, changePassword, setToken } from '../services/api';

export default function Profile() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (next.length < 6) {
      setMsg({ type: 'err', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (next !== confirm) {
      setMsg({ type: 'err', text: 'A confirmação não corresponde à nova senha.' });
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword(current, next);
      if (res?.success) {
        if (res.data?.token) setToken(res.data.token);
        setMsg({ type: 'ok', text: 'Senha alterada com sucesso.' });
        setCurrent(''); setNext(''); setConfirm('');
      } else {
        setMsg({ type: 'err', text: res?.error || 'Não foi possível alterar a senha.' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Não foi possível conectar ao servidor.' });
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-xl border border-line bg-surface py-2.5 px-3.5 text-[14px] text-ink ' +
    'placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

  return (
    <div className="max-w-3xl space-y-5">
      {/* Cabeçalho do perfil */}
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="h-24 bg-gradient-to-r from-brand-deep to-brand" />
        <div className="flex items-center gap-4 px-6 pb-5">
          <span className="-mt-9 flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full
            bg-brand text-[26px] font-bold uppercase text-white ring-4 ring-surface">
            {ADMIN_EMAIL[0]}
          </span>
          <div className="min-w-0 pt-1">
            <h2 className="truncate text-[18px] font-bold text-ink">Administrador</h2>
            <p className="truncate text-[13px] text-muted">{ADMIN_EMAIL}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5
              text-[12px] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Ativo
            </span>
          </div>
        </div>
      </section>

      <WhatsAppConnection />

      {/* Alterar senha */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <KeyRound size={18} className="text-brand-deep" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-ink">Alterar Senha</h2>
            <p className="text-[12.5px] text-muted">A senha deve ter pelo menos 6 caracteres.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-2">Senha atual</label>
            <input
              type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
              placeholder="Digite a senha atual" className={field}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-2">Nova senha</label>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)}
                placeholder="Digite a nova senha" className={`${field} pr-10`}
              />
              <button type="button" onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-ink-2 cursor-pointer" tabIndex={-1}>
                {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-2">Confirmar nova senha</label>
            <input
              type={showNext ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirme a nova senha" className={field}
            />
          </div>

          {msg && (
            <p className={`text-[13px] ${msg.type === 'ok' ? 'text-success' : 'text-danger'}`}>{msg.text}</p>
          )}

          <button
            type="submit"
            disabled={saving || !current || !next || !confirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[14px] font-bold text-white
              transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Alterar Senha
          </button>
        </form>
      </section>
    </div>
  );
}
