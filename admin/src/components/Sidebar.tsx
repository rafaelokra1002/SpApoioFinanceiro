import { useState } from 'react';
import {
  LayoutDashboard, Users, Clock, CheckCircle, XCircle,
  FolderOpen, RefreshCw, Menu, X, ChevronDown, MessageCircle,
} from 'lucide-react';

interface SidebarProps {
  page: 'leads' | 'categories' | 'whatsapp';
  filter: string;
  onNavigate: (page: 'leads' | 'categories' | 'whatsapp', filter?: string) => void;
  onRefresh: () => void;
}

const navItems = [
  { key: '', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'PENDENTE', label: 'Pendentes', icon: Clock },
  { key: 'APROVADO', label: 'Aprovados', icon: CheckCircle },
  { key: 'RECUSADO', label: 'Recusados', icon: XCircle },
];

export default function Sidebar({ page, filter, onNavigate, onRefresh }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <div className="w-11 h-11 rounded-2xl bg-[#2a3563] border border-white/8 shadow-lg shadow-black/20 flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#0f1a3e] border border-white/10 flex items-center justify-center text-[16px] leading-none">
            💰
          </div>
        </div>
        <div>
          <h2 className="text-[15px] font-extrabold text-white tracking-tight">SP Apoio</h2>
          <p className="text-[11px] text-white/50">Painel Administrativo</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">
          Leads
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === 'leads' && filter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { onNavigate('leads', item.key); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer
                ${active
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">
            Configurações
          </p>
        </div>
        <button
          onClick={() => { onNavigate('categories'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer
            ${page === 'categories'
              ? 'bg-white/15 text-white shadow-lg shadow-black/10'
              : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
        >
          <FolderOpen size={18} strokeWidth={page === 'categories' ? 2.5 : 1.8} />
          Categorias
        </button>
        <button
          onClick={() => { onNavigate('whatsapp'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer
            ${page === 'whatsapp'
              ? 'bg-white/15 text-white shadow-lg shadow-black/10'
              : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
        >
          <MessageCircle size={18} strokeWidth={page === 'whatsapp' ? 2.5 : 1.8} />
          WhatsApp
        </button>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onRefresh}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={18} strokeWidth={1.8} />
          Atualizar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-[240px] bg-gradient-to-b from-[#0f1a3e] to-[#1e3a8a]
        flex flex-col z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {content}
      </aside>
    </>
  );
}
