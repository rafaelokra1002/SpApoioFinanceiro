/** Avatar de iniciais: não temos foto do cliente, então derivamos do nome. */

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500',
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Cor estável a partir do nome: mesma pessoa → sempre a mesma cor. */
export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic)$/i;

/**
 * Foto do cliente = selfie enviada. O nome real vem no filename
 * ("Selfie (rosto).jpg"), não no tipo (genérico "documentos") — olhamos os dois.
 */
export function clientPhotoUrl(
  documentos?: { tipo: string; filename: string; url: string }[],
): string | undefined {
  const doc = documentos?.find((d) => {
    const hay = `${d.tipo} ${d.filename}`.toLowerCase();
    return /selfie|rosto|foto|perfil/.test(hay) && (IMAGE_EXT.test(d.filename) || IMAGE_EXT.test(d.url));
  });
  return doc?.url;
}
