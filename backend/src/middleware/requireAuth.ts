import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';

/** Exige um token válido no header Authorization: Bearer <token>. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (await verifyToken(token)) {
    next();
    return;
  }
  res.status(401).json({ success: false, error: 'Não autenticado' });
}
