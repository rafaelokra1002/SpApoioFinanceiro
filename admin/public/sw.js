/**
 * Service worker mínimo — existe apenas para tornar o painel instalável (PWA).
 * Não faz cache: todas as requisições seguem direto para a rede.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* sem cache: deixa o navegador buscar na rede */ });
