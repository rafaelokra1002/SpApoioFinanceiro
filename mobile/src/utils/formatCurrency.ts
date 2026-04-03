export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function parseCurrencyInput(text: string): number {
  const cleaned = text.replace(/\D/g, '');
  return parseInt(cleaned || '0', 10) / 100;
}

export function formatPhone(text: string): string {
  const c = text.replace(/\D/g, '');
  if (c.length <= 2) return `(${c}`;
  if (c.length <= 7) return `(${c.slice(0, 2)}) ${c.slice(2)}`;
  return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7, 11)}`;
}
