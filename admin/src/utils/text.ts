/**
 * Corrige "mojibake": texto UTF-8 que foi lido como latin1 e ficou embaralhado
 * (ex.: "Imovel — Video" virou "ImÃ³vel â€” VÃ­deo").
 *
 * Detecta o padrao tipico (byte-lider UTF-8 0xC2..0xEF seguido de byte de
 * continuacao 0x80..0xBF, ambos no range latin1) e so age nesse caso, entao
 * strings ja corretas passam intactas — seguro aplicar em qualquer nome.
 */
function looksMojibaked(s: string): boolean {
  for (let i = 0; i < s.length - 1; i++) {
    const a = s.charCodeAt(i);
    const b = s.charCodeAt(i + 1);
    if (a >= 0xc2 && a <= 0xef && b >= 0x80 && b <= 0xbf) return true;
  }
  return false;
}

export function fixMojibake(input: string): string {
  if (!input || !looksMojibaked(input)) return input;
  try {
    const bytes = Uint8Array.from(Array.from(input, (c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    // U+FFFD (caractere de substituicao) indica decodificacao invalida.
    return decoded.indexOf('�') >= 0 ? input : decoded;
  } catch {
    return input;
  }
}
