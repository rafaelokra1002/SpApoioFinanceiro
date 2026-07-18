import { useEffect, useState } from 'react';
import { UNAUTHORIZED_EVENT, clearToken, getToken, setToken } from '../services/api';

/**
 * Autenticação do painel. Em produção exige token; em desenvolvimento começa
 * autenticado para o preview offline (devMocks) continuar funcionando.
 */
export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(() => Boolean(getToken()) || import.meta.env.DEV);

  // Sessão recusada pelo backend (token expirado/inválido) → volta ao login.
  useEffect(() => {
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signIn = (token: string) => {
    setToken(token);
    setAuthed(true);
  };

  const signOut = () => {
    clearToken();
    setAuthed(false);
  };

  return { authed, signIn, signOut };
}
