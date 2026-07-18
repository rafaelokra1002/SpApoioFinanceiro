/** Ícones coloridos das origens (rótulos vêm de origemOf). */

const SIZE = 22;

function Instagram() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="origem-ig" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#origem-ig)" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="#fff" />
    </svg>
  );
}

function Panfleto() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none"
      stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function Amigos() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none"
      stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877f2" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function Google() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285f4" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.96-4.33 2.96-7.33z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.06v2.58A10 10 0 0 0 12 22z" />
      <path fill="#fbbc05" d="M6.42 13.92a5.99 5.99 0 0 1 0-3.84V7.5H3.06a10 10 0 0 0 0 9z" />
      <path fill="#ea4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.98 9.98 0 0 0 12 2 10 10 0 0 0 3.06 7.5l3.36 2.58C7.2 7.72 9.4 5.96 12 5.96z" />
    </svg>
  );
}

function Outros() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none"
      stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export default function OrigemIcon({ label }: { label: string }) {
  switch (label) {
    case 'Instagram e Blogueiros': return <Instagram />;
    case 'Panfleto': return <Panfleto />;
    case 'Indicação de Amigos': return <Amigos />;
    case 'Facebook': return <Facebook />;
    case 'Google': return <Google />;
    default: return <Outros />;
  }
}
