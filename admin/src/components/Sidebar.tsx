import { useState } from 'react';
import {
  LayoutGrid, ClipboardList, UserCircle, Clock, CheckCircle2, XCircle, UserX,
  UserRoundCheck, MessageSquare, HardDrive, ImageIcon, FolderOpen, Settings,
  ShieldCheck, ChevronRight, ChevronLeft, Menu, X, type LucideIcon,
} from 'lucide-react';
import { Counts } from '../utils/analytics';
import { MetricKey } from '../constants/status';

export type PageKey =
  | 'dashboard' | 'solicitacoes' | 'pendentes' | 'garantias' | 'aprovados' | 'recusados'
  | 'nao-contrataram' | 'colaborador' | 'origem' | 'cidades'
  | 'relatorio' | 'perfil' | 'mensagens' | 'backup' | 'fotos'
  | 'categorias' | 'configuracoes';

/** Atalhos em destaque no topo do sidebar. */
interface Shortcut {
  page: PageKey;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Gradiente do card + cor do ícone. */
  card: string;
  chip: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    page: 'relatorio',
    label: 'Relatório Diário',
    hint: 'Resumo do dia',
    icon: ClipboardList,
    card: 'from-[#0d3f2a] to-[#155e3c]',
    chip: 'bg-emerald-400/20 text-emerald-300',
  },
  {
    page: 'perfil',
    label: 'Meu Perfil',
    hint: 'Seus dados',
    icon: UserCircle,
    card: 'from-[#0e4a52] to-[#14707d]',
    chip: 'bg-cyan-400/20 text-cyan-200',
  },
];

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
  /** Métrica exibida como badge de contagem. */
  badge?: MetricKey;
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'pendentes', label: 'Pendentes', icon: Clock },
  { key: 'aprovados', label: 'Aprovados', icon: CheckCircle2 },
  { key: 'recusados', label: 'Recusados', icon: XCircle },
  // Oculta a pedido do cliente (categoria de garantia desativada). Reative descomentando.
  // { key: 'garantias', label: 'Garantias', icon: ShieldCheck },
  { key: 'nao-contrataram', label: 'Não Contratou', icon: UserX },
  { key: 'colaborador', label: 'Passei para Colaborador', icon: UserRoundCheck },
  { key: 'mensagens', label: 'Templates', icon: MessageSquare },
  { key: 'categorias', label: 'Categorias', icon: FolderOpen },
  { key: 'fotos', label: 'Fotos', icon: ImageIcon },
  { key: 'backup', label: 'Backup', icon: HardDrive },
  { key: 'configuracoes', label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  page: PageKey;
  counts: Counts;
  onNavigate: (page: PageKey) => void;
}

export default function Sidebar({ page, counts, onNavigate }: SidebarProps) {
  // O sistema abre com o menu recolhido (só ícones); a seta expande.
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Toggle mobile */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Abrir menu"
        style={{ backgroundColor: 'var(--sidebar-to)' }}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl
          text-white shadow-lg lg:hidden cursor-pointer"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        style={{ backgroundImage: 'linear-gradient(to bottom, var(--sidebar-from), var(--sidebar-to))' }}
        className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col
          transition-[width,transform] duration-300 ease-in-out lg:translate-x-0
          ${collapsed ? 'w-[84px]' : 'w-[280px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* A marca fica dentro da área rolável: sobe junto com o menu. */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className={`mb-1 flex items-center gap-3 py-5 ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <LayoutGrid size={19} className="text-white" strokeWidth={2.5} />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-[19px] font-extrabold leading-tight tracking-[-0.01em] text-white">
                  SP Análise
                </h1>
                <p className="truncate text-[12px] font-medium text-white/70">Painel Administrativo</p>
              </div>
            )}
          </div>

          {/* Atalhos */}
          {collapsed ? (
            // Recolhido: os atalhos aparecem como ícones, com o chip colorido de destaque.
            <div className="space-y-1">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                const active = page === s.page;
                return (
                  <button
                    key={s.label}
                    onClick={() => go(s.page)}
                    title={s.label}
                    className={`flex w-full items-center justify-center rounded-xl px-3 py-3 transition-colors cursor-pointer
                      ${active ? 'ring-1 ring-white/25' : 'hover:bg-white/10'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.chip}`}>
                      <Icon size={17} strokeWidth={2.2} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => go(s.page)}
                    className={`flex w-full items-center gap-3 rounded-xl bg-gradient-to-r ${s.card}
                      px-3 py-3 text-left shadow-lg shadow-black/10 transition-transform
                      hover:-translate-y-0.5 cursor-pointer`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.chip}`}>
                      <Icon size={17} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold leading-tight text-white">{s.label}</span>
                      <span className="mt-0.5 block truncate text-[11.5px] font-normal text-white/60">{s.hint}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-white/40" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu */}
          <p className={`mb-2 mt-5 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55
            ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '•••' : 'Menu'}
          </p>

          <nav className="space-y-1">
            {NAV.map(({ key, label, icon: Icon, badge }) => {
              const active = page === key;
              const count = badge ? counts[badge] : 0;

              return (
                <button
                  key={key}
                  onClick={() => go(key)}
                  title={collapsed ? label : undefined}
                  style={active
                    ? { backgroundImage: 'linear-gradient(to right, var(--sidebar-active-from), var(--sidebar-active-to))' }
                    : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14.5px]
                    transition-colors duration-200 cursor-pointer
                    ${collapsed ? 'justify-center' : ''}
                    ${active
                      ? 'font-bold text-white shadow-lg shadow-black/20 ring-1 ring-white/15'
                      : 'font-medium text-white/85 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon size={19} strokeWidth={active ? 2.4 : 1.9} className="shrink-0" />

                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-left leading-snug">{label}</span>
                      {badge && count > 0 && (
                        <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          {count}
                        </span>
                      )}
                      <ChevronRight size={15} className={active ? 'shrink-0 text-white/60' : 'shrink-0 text-white/25'} />
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé fixo */}
        <div className="shrink-0 border-t border-white/15 px-3 py-4">
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expandir menu"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/15
                text-white transition-colors hover:bg-white/25 cursor-pointer"
            >
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-medium text-white/55">© 2026 SP Apoio Financeiro</span>
                <button
                  onClick={() => setCollapsed(true)}
                  aria-label="Recolher menu"
                  className="hidden h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70
                    transition-colors hover:bg-white/20 hover:text-white lg:flex cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Espaçador que empurra o conteúdo conforme a largura da sidebar */}
      <div className={`hidden shrink-0 transition-[width] duration-300 lg:block ${collapsed ? 'w-[84px]' : 'w-[280px]'}`} />
    </>
  );
}
