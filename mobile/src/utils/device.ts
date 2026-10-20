/** Marca a partir do código de modelo do Android (ex.: "SM-A515F" → Samsung). */
function marcaDoModelo(modelo: string): string {
  const m = modelo.toUpperCase();
  if (m.startsWith('SM-') || m.startsWith('GT-')) return 'Samsung';
  if (m.startsWith('MOTO') || m.startsWith('XT')) return 'Motorola';
  if (/^(REDMI|POCO|MI |M2|2[0-9]{3})/.test(m)) return 'Xiaomi';
  if (m.startsWith('LM-') || m.startsWith('LG')) return 'LG';
  if (/^(CPH|RMX)/.test(m)) return m.startsWith('RMX') ? 'Realme' : 'Oppo';
  const tecno = m.match(/^(TECNO|INFINIX|ITEL)/);
  if (tecno) return tecno[1][0] + tecno[1].slice(1).toLowerCase();
  if (m.startsWith('PIXEL')) return 'Google';
  return '';
}

function navegadorDoUA(ua: string): string {
  const v = (re: RegExp) => ua.match(re)?.[1]?.split('.')[0];
  if (/SamsungBrowser\/([\d.]+)/.test(ua)) return `Samsung Internet ${v(/SamsungBrowser\/([\d.]+)/)}`;
  if (/EdgA?\/([\d.]+)/.test(ua)) return `Edge ${v(/EdgA?\/([\d.]+)/)}`;
  if (/(?:CriOS|Chrome)\/([\d.]+)/.test(ua)) return `Chrome ${v(/(?:CriOS|Chrome)\/([\d.]+)/)}`;
  if (/(?:FxiOS|Firefox)\/([\d.]+)/.test(ua)) return `Firefox ${v(/(?:FxiOS|Firefox)\/([\d.]+)/)}`;
  if (/Version\/([\d.]+).*Safari/.test(ua)) return `Safari ${v(/Version\/([\d.]+)/)}`;
  return '';
}

/**
 * Descreve o aparelho do cliente, ex.: "Samsung SM-A515F · Android 13 · Chrome 129"
 * ou "iPhone · iOS 17.5 · Safari 17". No Android/Chrome o modelo vem das Client Hints
 * (sem pedir permissão); o iPhone nunca informa o modelo exato a sites.
 */
export async function descreverDispositivo(): Promise<string> {
  const ua = navigator.userAgent || '';
  let modelo = '';
  let sistema = '';

  const uaData = (navigator as any).userAgentData;
  if (uaData?.getHighEntropyValues) {
    try {
      const h = await uaData.getHighEntropyValues(['model', 'platformVersion']);
      modelo = (h.model || '').trim();
      if (h.platform === 'Android' && h.platformVersion) sistema = `Android ${String(h.platformVersion).split('.')[0]}`;
    } catch { /* sem client hints: usa o User-Agent abaixo */ }
  }

  const ios = ua.match(/(iPhone|iPad|iPod).*?OS (\d+)[_.](\d+)/);
  if (ios) {
    modelo = ios[1];
    sistema = `iOS ${ios[2]}.${ios[3]}`;
  } else {
    // O modelo vai até o "; " ou o ") " que fecha o bloco (há modelos com parênteses, ex.: "moto g(30)").
    const android = ua.match(/Android (\d+)(?:[.\d]*);\s*(.+?)(?:;|\)\s)/);
    if (android) {
      if (!sistema) sistema = `Android ${android[1]}`;
      // O UA reduzido do Chrome troca o modelo por "K": nesse caso fica o das client hints.
      const doUA = android[2].replace(/\s*Build\/.*/, '').trim();
      if (!modelo && doUA && doUA !== 'K') modelo = doUA;
    } else if (!sistema) {
      sistema = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    }
  }

  const marca = modelo && !/^iP/.test(modelo) ? marcaDoModelo(modelo) : '';
  const aparelho = [marca, modelo].filter(Boolean).join(' ');
  return [aparelho, sistema, navegadorDoUA(ua)].filter(Boolean).join(' · ').slice(0, 200);
}
