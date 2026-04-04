import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { whatsAppService } from './whatsappService';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3015);
const SERVICE_TOKEN = process.env.WHATSAPP_SERVICE_TOKEN || '';

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!SERVICE_TOKEN) {
    return next();
  }

  const headerToken = req.header('x-service-token') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (headerToken !== SERVICE_TOKEN) {
    return res.status(401).json({ success: false, error: 'Não autorizado' });
  }

  next();
});

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'WhatsApp VPS service online' });
});

app.get('/status', async (_req, res) => {
  const status = await whatsAppService.getConnectionStatus();
  res.json({ success: true, data: status });
});

app.get('/qrcode', async (_req, res) => {
  const qr = await whatsAppService.getQRCode();
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: qr });
});

app.post('/connect', async (_req, res) => {
  await whatsAppService.connect();
  const status = await whatsAppService.getConnectionStatus();
  res.json({ success: true, data: status, message: 'Conexão iniciada' });
});

app.delete('/disconnect', async (_req, res) => {
  const ok = await whatsAppService.disconnect();
  res.json({ success: ok, message: ok ? 'Desconectado' : 'Erro ao desconectar' });
});

app.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'phone e message são obrigatórios' });
  }

  const result = await whatsAppService.sendTextMessage(phone, message);
  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  res.json({ success: true, message: 'Mensagem enviada com sucesso' });
});

app.listen(PORT, () => {
  console.log(`WhatsApp VPS service running on port ${PORT}`);
});
