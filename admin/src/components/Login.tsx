import { useState } from 'react';
import { AtSign, Eye, EyeOff, LayoutGrid, Loader2, Lock } from 'lucide-react';
import { login } from '../services/api';

interface LoginProps {
  onSuccess: (token: string) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res?.success && res.data?.token) {
        onSuccess(res.data.token);
      } else {
        setError(res?.error || 'Senha incorreta');
      }
    } catch {
      // Sem backend: em desenvolvimento libera o preview; em produção informa o erro.
      if (import.meta.env.DEV) {
        onSuccess('dev-token');
      } else {
        setError('Não foi possível conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand">
            <LayoutGrid size={24} className="text-white" strokeWidth={2.5} />
          </span>
          <h1 className="text-[20px] font-extrabold text-ink">SP Análise</h1>
          <p className="text-[13px] text-muted">Painel Administrativo</p>
        </div>

        <label className="mb-1.5 block text-[13px] font-semibold text-ink-2">E-mail</label>
        <div className="relative mb-4">
          <AtSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            placeholder="Digite o e-mail"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-[14px] text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <label className="mb-1.5 block text-[13px] font-semibold text-ink-2">Senha</label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-[14px] text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-ink-2 cursor-pointer"
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5
            text-[14px] font-bold text-white transition-colors hover:bg-brand-deep
            disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : null}
          Entrar
        </button>
      </form>
    </div>
  );
}
