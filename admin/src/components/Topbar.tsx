import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { ADMIN_EMAIL } from '../services/api';
import InstallButton from './InstallButton';

interface TopbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

const USER_EMAIL = ADMIN_EMAIL;

export default function Topbar({ theme, onToggleTheme, onOpenSettings, onSignOut }: TopbarProps) {
  const dark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-end gap-3
      border-b border-line bg-surface px-5 py-3.5 pl-16 lg:px-6 lg:pl-6">

      <div className="flex shrink-0 items-center gap-2">
        <InstallButton />

        <button
          onClick={onToggleTheme}
          title={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface
            text-muted transition-colors hover:bg-canvas hover:text-ink-2 cursor-pointer"
        >
          {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2
              text-[13px] text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
          >
            <User size={15} className="shrink-0 text-subtle" strokeWidth={2} />
            <span className="truncate">{USER_EMAIL}</span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-subtle transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[190px] overflow-hidden
                rounded-xl border border-line bg-surface py-1 shadow-lg shadow-black/10"
            >
              <button
                role="menuitem"
                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px]
                  text-ink-2 transition-colors hover:bg-canvas cursor-pointer"
              >
                <Settings size={16} className="shrink-0 text-muted" strokeWidth={2} />
                Configurações
              </button>
              <button
                role="menuitem"
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-[13.5px]
                  text-danger transition-colors hover:bg-danger/5 cursor-pointer"
              >
                <LogOut size={16} className="shrink-0" strokeWidth={2} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
