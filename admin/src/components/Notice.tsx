import { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

type NoticeType = 'info' | 'success' | 'error';
interface NoticeData { text: string; type: NoticeType }

const EVENT = 'sp-admin-notice';

/** Mostra um aviso centralizado na tela (substitui o alert nativo). */
export function notify(text: string, type: NoticeType = 'info') {
  window.dispatchEvent(new CustomEvent<NoticeData>(EVENT, { detail: { text, type } }));
}

const STYLES: Record<NoticeType, { Icon: typeof Info; color: string; bg: string }> = {
  info: { Icon: Info, color: 'text-info', bg: 'bg-info/10' },
  success: { Icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  error: { Icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
};

/** Montado uma vez no App; escuta os avisos e renderiza o card centralizado. */
export function NoticeHost() {
  const [notice, setNotice] = useState<NoticeData | null>(null);

  useEffect(() => {
    const onNotice = (e: Event) => setNotice((e as CustomEvent<NoticeData>).detail);
    window.addEventListener(EVENT, onNotice);
    return () => window.removeEventListener(EVENT, onNotice);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotice(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notice]);

  if (!notice) return null;
  const { Icon, color, bg } = STYLES[notice.type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={() => setNotice(null)} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-xl">
        <span className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
          <Icon size={26} className={color} />
        </span>
        <p className="text-[14px] leading-relaxed text-ink-2">{notice.text}</p>
        <button
          onClick={() => setNotice(null)}
          autoFocus
          className="mt-5 w-full rounded-xl bg-brand py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-brand-deep cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}
