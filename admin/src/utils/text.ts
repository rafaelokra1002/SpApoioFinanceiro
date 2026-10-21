/**
 * Corrige "mojibake": texto UTF-8 que foi lido como latin1/Windows-1252 e ficou
 * embaralhado (ex.: "Imóvel — Vídeo" virou "ImÃ³vel â€” VÃ­deo", "💼" virou "ðŸ’¼").
 *
 * Só age quando o texto tem o padrão típico (Â/Ã/â/ð seguido de outro caractere
 * do mesmo bloco), e devolve o original se a reconstrução não for UTF-8 válido —
 * strings já corretas passam intactas, então é seguro aplicar em qualquer nome.
 */

/** Caracteres do Windows-1252 nas posições 0x80–0x9F (onde ele difere do latin1). */
const WIN1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

/** Byte que o caractere ocupava antes da leitura errada (ou -1 se não cabe num byte). */
function byteOf(code: number): number {
  if (code <= 0xff) return code;
  return WIN1252[code] ?? -1;
}

function looksMojibaked(s: string): boolean {
  for (let i = 0; i < s.length - 1; i++) {
    const a = s.charCodeAt(i);
    const b = byteOf(s.charCodeAt(i + 1));
    if (a >= 0xc2 && a <= 0xf4 && b >= 0x80 && b <= 0xbf) return true;
  }
  return false;
}

export function fixMojibake(input: string): string {
  if (!input || !looksMojibaked(input)) return input;
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const b = byteOf(input.charCodeAt(i));
    if (b < 0) return input;
    bytes.push(b);
  }
  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    return decoded;
  } catch {
    return input;
  }
}
