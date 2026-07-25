/** Máscara simples de moeda BR (sem "R$") a partir dos dígitos digitados. */
export function maskValorBR(v: string): string {
  const n = v.replace(/\D/g, '');
  if (!n) return '';
  const num = (parseInt(n, 10) / 100).toFixed(2);
  const [int, dec] = num.split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec;
}

/** Lê a duração (em segundos) de um arquivo de vídeo no navegador. */
export function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => { URL.revokeObjectURL(el.src); resolve(el.duration); };
    el.onerror = reject;
    el.src = URL.createObjectURL(file);
  });
}
