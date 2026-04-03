import { Request, Response, NextFunction } from 'express';
import {
  getConnectionStatus,
  getQRCode,
  disconnectInstance,
  sendTextMessage,
} from '../services/whatsappService';
import { ApiResponse } from '../types';

// GET /api/admin/whatsapp/status
export async function handleWhatsAppStatus(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const status = await getConnectionStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/whatsapp/qrcode
export async function handleWhatsAppQRCode(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getQRCode();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/whatsapp/disconnect
export async function handleWhatsAppDisconnect(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const ok = await disconnectInstance();
    res.json({ success: ok, message: ok ? 'Desconectado' : 'Erro ao desconectar' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/whatsapp/send
export async function handleWhatsAppSend(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'phone e message são obrigatórios' });
      return;
    }

    const result = await sendTextMessage(phone, message);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    next(error);
  }
}
