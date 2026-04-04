const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'sua-chave-secreta-aqui';
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'sp-apoio';

const headers = {
  'Content-Type': 'application/json',
  apikey: EVOLUTION_API_KEY,
};

export interface WhatsAppStatus {
  connected: boolean;
  name?: string;
  number?: string;
  qrcode?: string;
}

// Create instance if not exists
export async function createInstance(): Promise<any> {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      instanceName: INSTANCE_NAME,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
    }),
  });
  return res.json();
}

// Get connection status
export async function getConnectionStatus(): Promise<WhatsAppStatus> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${INSTANCE_NAME}`, {
      headers,
    });

    if (!res.ok) {
      // Instance might not exist yet
      return { connected: false };
    }

    const data = await res.json();
    const connected = data?.instance?.state === 'open';

    return {
      connected,
      name: data?.instance?.profileName,
      number: data?.instance?.wuid?.replace('@s.whatsapp.net', ''),
    };
  } catch {
    return { connected: false };
  }
}

// Get QR code
export async function getQRCode(): Promise<{ qrcode?: string; connected: boolean }> {
  try {
    // First try to create instance (idempotent if already exists)
    const createResult = await createInstance();
    console.log('[WhatsApp] createInstance:', JSON.stringify(createResult).substring(0, 300));

    const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${INSTANCE_NAME}`, {
      headers,
    });

    if (!res.ok) {
      console.log('[WhatsApp] connect failed:', res.status);
      return { connected: false };
    }

    const data = await res.json();
    console.log('[WhatsApp] connect response:', JSON.stringify(data).substring(0, 500));

    // Evolution API pode retornar o QR em diferentes campos
    const qr = data?.base64 || data?.qrcode?.base64 || data?.qrcode || data?.code;

    if (qr) {
      return { qrcode: qr, connected: false };
    }

    // Check if actually connected
    if (data?.instance?.state === 'open') {
      return { connected: true };
    }

    // Not connected and no QR code
    return { connected: false };
  } catch (err) {
    console.error('[WhatsApp] getQRCode error:', err);
    return { connected: false };
  }
}

// Logout / disconnect
export async function disconnectInstance(): Promise<boolean> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/logout/${INSTANCE_NAME}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Send text message
export async function sendTextMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Format phone number
    let number = phone.replace(/\D/g, '');
    if (!number.startsWith('55')) number = `55${number}`;

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        number,
        text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data?.message || 'Erro ao enviar mensagem' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro de conexão com Evolution API' };
  }
}
