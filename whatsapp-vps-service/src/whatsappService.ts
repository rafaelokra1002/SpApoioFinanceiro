import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WhatsAppStatus {
  connected: boolean;
  name?: string;
  number?: string;
  qrcode?: string;
  status?: ConnectionStatus;
  error?: string;
}

class WhatsAppService {
  private client: Client | null = null;
  private status: ConnectionStatus = 'disconnected';
  private qrCodeDataUrl: string | null = null;
  private phoneNumber: string | null = null;
  private profileName: string | null = null;
  private lastError: string | null = null;
  private initializingPromise: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;

  private readonly sessionDir = path.resolve(
    process.env.WHATSAPP_SESSION_DIR || path.resolve(process.cwd(), 'whatsapp-session')
  );

  private readonly clientId = process.env.WHATSAPP_CLIENT_ID || 'sp-apoio';

  private isConnected(): boolean {
    return this.status === 'connected';
  }

  private findChrome(): string | undefined {
    if (process.env.WHATSAPP_CHROME_PATH) {
      return process.env.WHATSAPP_CHROME_PATH;
    }

    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    return chromePaths.find((candidate) => fs.existsSync(candidate));
  }

  private ensureSessionDir(): void {
    fs.mkdirSync(this.sessionDir, { recursive: true });
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.status === 'connected') {
      return;
    }

    this.reconnectAttempts += 1;
    const delay = Math.min(5000 * this.reconnectAttempts, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, delay);
  }

  private startKeepAlive(): void {
    this.clearKeepAlive();
    this.keepAliveTimer = setInterval(async () => {
      if (!this.client || this.status !== 'connected') {
        return;
      }

      try {
        const state = await this.client.getState();
        if (state !== 'CONNECTED') {
          this.status = 'disconnected';
          this.scheduleReconnect();
        }
      } catch (error) {
        this.lastError = error instanceof Error ? error.message : 'Erro no keep alive';
        this.status = 'disconnected';
        this.scheduleReconnect();
      }
    }, 30000);
  }

  private async initializeClient(): Promise<void> {
    if (this.client) {
      return;
    }

    this.ensureSessionDir();
    const chromePath = this.findChrome();

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.clientId,
        dataPath: this.sessionDir,
      }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
    });

    this.client.on('qr', async (qr: string) => {
      this.status = 'connecting';
      this.qrCodeDataUrl = await QRCode.toDataURL(qr);
      this.lastError = null;
      this.reconnectAttempts = 0;
    });

    this.client.on('ready', () => {
      const info = this.client?.info;
      this.status = 'connected';
      this.qrCodeDataUrl = null;
      this.phoneNumber = info?.wid?.user || null;
      this.profileName = info?.pushname || null;
      this.lastError = null;
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.startKeepAlive();
    });

    this.client.on('authenticated', () => {
      this.status = 'connecting';
      this.lastError = null;
    });

    this.client.on('auth_failure', (message: string) => {
      this.status = 'error';
      this.lastError = message;
      this.scheduleReconnect();
    });

    this.client.on('disconnected', (reason: string) => {
      this.status = 'disconnected';
      this.qrCodeDataUrl = null;
      this.phoneNumber = null;
      this.profileName = null;
      this.lastError = reason;
      this.clearKeepAlive();
      this.scheduleReconnect();
    });
  }

  async connect(): Promise<void> {
    if (this.status === 'connected') {
      return;
    }

    if (this.initializingPromise) {
      await this.initializingPromise;
      return;
    }

    this.initializingPromise = (async () => {
      this.status = 'connecting';
      await this.initializeClient();
      await this.client?.initialize();
    })();

    try {
      await this.initializingPromise;
    } finally {
      this.initializingPromise = null;
    }
  }

  async getConnectionStatus(): Promise<WhatsAppStatus> {
    return {
      connected: this.isConnected(),
      name: this.profileName || undefined,
      number: this.phoneNumber || undefined,
      qrcode: this.qrCodeDataUrl || undefined,
      status: this.status,
      error: this.lastError || undefined,
    };
  }

  async getQRCode(): Promise<{ qrcode?: string; connected: boolean }> {
    if (this.isConnected()) {
      return { connected: true };
    }

    if (!this.client && !this.initializingPromise) {
      await this.connect();
    }

    if (this.qrCodeDataUrl) {
      return { connected: false, qrcode: this.qrCodeDataUrl };
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < 15000) {
      if (this.isConnected()) {
        return { connected: true };
      }
      if (this.qrCodeDataUrl) {
        return { connected: false, qrcode: this.qrCodeDataUrl };
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return { connected: false };
  }

  async disconnect(): Promise<boolean> {
    this.clearReconnectTimer();
    this.clearKeepAlive();

    try {
      if (this.client) {
        try {
          await this.client.logout();
        } catch {
          // ignore logout failures
        }

        await this.client.destroy();
      }
    } catch {
      return false;
    } finally {
      this.client = null;
      this.status = 'disconnected';
      this.qrCodeDataUrl = null;
      this.phoneNumber = null;
      this.profileName = null;
      this.lastError = null;
      try {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }

    return true;
  }

  async sendTextMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.status !== 'connected' || !this.client) {
        return { success: false, error: 'WhatsApp não conectado' };
      }

      const rawNumber = phone.replace(/\D/g, '');
      const number = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
      const candidates = new Set<string>([number]);

      if (number.length === 13) {
        candidates.add(`${number.slice(0, 4)}${number.slice(5)}`);
      }

      if (number.length === 12) {
        candidates.add(`${number.slice(0, 4)}9${number.slice(4)}`);
      }

      let chatId: string | null = null;
      for (const candidate of candidates) {
        const numberId = await this.client.getNumberId(candidate);
        if (numberId?._serialized) {
          chatId = numberId._serialized;
          break;
        }
      }

      if (!chatId) {
        return { success: false, error: 'Número não encontrado no WhatsApp' };
      }

      await this.client.sendMessage(chatId, text);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
      };
    }
  }
}

export const whatsAppService = new WhatsAppService();
