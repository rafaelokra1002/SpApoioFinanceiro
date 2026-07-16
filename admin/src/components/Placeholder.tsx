import { Construction, type LucideIcon } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

/** Página ainda sem funcionalidade — deixa explícito que está por vir, sem fingir. */
export default function Placeholder({ title, description, icon: Icon = Construction }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface py-24 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
        <Icon size={26} className="text-brand-deep" strokeWidth={2} />
      </span>
      <h2 className="text-[18px] font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-[13px] text-muted">
        {description ?? 'Esta seção ainda está em construção. Em breve.'}
      </p>
    </div>
  );
}
