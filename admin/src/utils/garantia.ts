/**
 * Interpreta o bloco de garantia gravado pelo app na observação do lead.
 *
 * O mobile anexa, quando o perfil é COM_GARANTIA, um bloco no formato:
 *   — Garantia: <Bem> —
 *   Rótulo: valor
 *   Rótulo: valor
 * separado do texto livre do cliente por uma linha em branco.
 */
export interface GarantiaInfo {
  /** Tipo do bem: "Imóvel", "Carro", "Moto", "Eletrônico", "Outro bem de valor"… */
  bem: string;
  campos: { label: string; value: string }[];
  /** Texto livre que o próprio cliente escreveu (sem o bloco de garantia). */
  observacaoCliente: string;
}

export function parseGarantia(observacao: string | null | undefined): GarantiaInfo | null {
  if (!observacao) return null;
  const idx = observacao.indexOf('— Garantia:');
  if (idx === -1) return null;

  const observacaoCliente = observacao.slice(0, idx).trim();
  const bloco = observacao.slice(idx).trim();
  const linhas = bloco.split('\n').map((l) => l.trim()).filter(Boolean);

  const header = linhas[0].match(/^—\s*Garantia:\s*(.+?)\s*—$/);
  const bem = header ? header[1] : 'Bem';

  const campos = linhas.slice(1)
    .map((linha) => {
      const m = linha.match(/^([^:]+):\s*(.*)$/);
      return m ? { label: m[1].trim(), value: m[2].trim() } : { label: '', value: linha };
    })
    .filter((c) => c.value);

  return { bem, campos, observacaoCliente };
}

/** True quando o lead ofereceu um bem em garantia. */
export function isGarantia(perfil: string | null | undefined): boolean {
  return perfil === 'COM_GARANTIA';
}
