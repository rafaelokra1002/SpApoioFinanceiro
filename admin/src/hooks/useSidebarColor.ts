import { useEffect, useState } from 'react';

export type SidebarColorId = 'verde-vivo' | 'verde' | 'verde-escuro' | 'roxo-escuro' | 'preto';

export interface SidebarColor {
  id: SidebarColorId;
  label: string;
  /** Gradiente do fundo da sidebar (topo → base). */
  from: string;
  to: string;
  /** Gradiente do item de menu ativo. */
  activeFrom: string;
  activeTo: string;
}

export const SIDEBAR_COLORS: SidebarColor[] = [
  { id: 'verde-vivo', label: 'Verde Vivo', from: '#17a453', to: '#0d8043', activeFrom: '#0b3d29', activeTo: '#12563a' },
  { id: 'verde', label: 'Verde', from: '#15803d', to: '#0f5c2c', activeFrom: '#0a3b1e', activeTo: '#11512a' },
  { id: 'verde-escuro', label: 'Verde Escuro', from: '#0f4d2c', to: '#08331d', activeFrom: '#052617', activeTo: '#0b4028' },
  { id: 'roxo-escuro', label: 'Roxo Escuro', from: '#2e1d5e', to: '#1b1038', activeFrom: '#150c2c', activeTo: '#3a2578' },
  { id: 'preto', label: 'Preto', from: '#1f1f1f', to: '#0a0a0a', activeFrom: '#000000', activeTo: '#2a2a2a' },
];

const STORAGE_KEY = 'sp-admin-sidebar-color';
const DEFAULT_ID: SidebarColorId = 'verde-vivo';

export function sidebarColorById(id: string): SidebarColor {
  return SIDEBAR_COLORS.find((c) => c.id === id) ?? SIDEBAR_COLORS[0];
}

function initialColor(): SidebarColorId {
  return sidebarColorById(localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ID).id;
}

/**
 * Cor do menu lateral. Aplica as variáveis CSS no <html> para que a sidebar
 * (e o botão do menu mobile) acompanhem a escolha sem re-render extra.
 */
export function useSidebarColor() {
  const [colorId, setColorId] = useState<SidebarColorId>(initialColor);

  useEffect(() => {
    const c = sidebarColorById(colorId);
    const root = document.documentElement.style;
    root.setProperty('--sidebar-from', c.from);
    root.setProperty('--sidebar-to', c.to);
    root.setProperty('--sidebar-active-from', c.activeFrom);
    root.setProperty('--sidebar-active-to', c.activeTo);
    localStorage.setItem(STORAGE_KEY, colorId);
  }, [colorId]);

  return { colorId, setColorId };
}
