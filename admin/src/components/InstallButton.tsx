import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

/** Evento não-tipado no lib padrão do TS. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Botão "Instalar app" (PWA). Aparece quando o navegador sinaliza que o painel
 * pode ser instalado (evento beforeinstallprompt) e some depois de instalado ou
 * quando já está rodando em modo standalone.
 */
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    // Já instalado / aberto como app: não mostra o botão.
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!deferred) return null;

  const instalar = async () => {
    setInstalando(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setInstalando(false);
      setDeferred(null);
    }
  };

  return (
    <button
      onClick={instalar}
      disabled={instalando}
      title="Instalar o painel como aplicativo"
      className="flex h-10 items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3
        text-[13px] font-semibold text-brand-deep transition-colors hover:bg-brand/20
        cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={16} strokeWidth={2} />
      <span className="hidden sm:inline">Instalar app</span>
    </button>
  );
}
