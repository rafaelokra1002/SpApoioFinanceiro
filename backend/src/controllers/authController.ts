import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { changePassword, checkCredentials, issueToken } from '../services/authService';

// POST /api/admin/auth/login  { email, password }
export async function handleLogin(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      res.status(400).json({ success: false, error: 'Informe e-mail e senha' });
      return;
    }
    if (!(await checkCredentials(email, password))) {
      res.status(401).json({ success: false, error: 'E-mail ou senha incorretos' });
      return;
    }
    res.json({ success: true, data: { token: await issueToken() } });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/auth/change-password  { currentPassword, newPassword }  (protegido)
export async function handleChangePassword(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ success: false, error: 'Dados inválidos' });
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (!result.ok) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: { token: result.token }, message: 'Senha alterada' });
  } catch (error) {
    next(error);
  }
}
