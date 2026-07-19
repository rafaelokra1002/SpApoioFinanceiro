import { avatarColor, clientPhotoUrl, initials } from '../utils/avatar';

interface AvatarProps {
  name: string;
  documentos?: { tipo: string; filename: string; url: string }[];
  /** Classes de tamanho/fonte (ex.: "h-12 w-12 text-[15px]"). */
  className?: string;
  rounded?: string;
}

/** Avatar do cliente: mostra a selfie enviada; se não houver, as iniciais coloridas. */
export default function Avatar({ name, documentos, className = 'h-12 w-12 text-[15px]', rounded = 'rounded-full' }: AvatarProps) {
  const photo = clientPhotoUrl(documentos);
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden font-bold text-white ${rounded} ${avatarColor(name)} ${className}`}>
      {initials(name)}
      {photo && (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => e.currentTarget.remove()}
        />
      )}
    </span>
  );
}
