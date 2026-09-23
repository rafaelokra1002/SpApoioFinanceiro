/** Formatos de imagem que o servidor aceita. */
const FORMATOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];

/** Extensões que indicam imagem quando o navegador não informa o tipo (comum no Android). */
const EXTENSAO_IMAGEM = /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif|tiff?)$/i;

/** O arquivo parece uma imagem (pelo tipo ou, se o tipo vier vazio, pela extensão)? */
export function pareceImagem(file: File): boolean {
  return file.type.startsWith('image/') || EXTENSAO_IMAGEM.test(file.name);
}

/** O formato é aceito pelo servidor (JPEG/PNG/WebP ou PDF)? HEIC, GIF, BMP etc. não são. */
export function formatoAceito(file: File): boolean {
  return file.type === 'application/pdf' || FORMATOS_IMAGEM.includes(file.type);
}

/**
 * Redimensiona/comprime imagens no navegador antes do upload e as converte para JPEG.
 * Não-imagens (PDF) passam direto. Se o navegador não conseguir abrir a imagem (ex.: HEIC no
 * Chrome do Android), devolve o arquivo original — quem chama deve checar `formatoAceito`.
 */
export async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<File> {
  if (!pareceImagem(file)) return file;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    // Já está num formato aceito e a versão comprimida não é menor: mantém o original.
    // Fora isso (HEIC, GIF, BMP, tipo vazio...) usa sempre o JPEG convertido, mesmo que maior.
    if (FORMATOS_IMAGEM.includes(file.type) && blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
