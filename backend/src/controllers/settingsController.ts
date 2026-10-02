import { Request, Response, NextFunction } from 'express';
import { getSetting, setSetting } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const KEY = 'modalidade_pagamento';
const VALORES_VALIDOS = ['VISTA', 'PARCELADO'] as const;
type Modalidade = (typeof VALORES_VALIDOS)[number];

const DEFAULT_MODALIDADE: Modalidade = 'VISTA';

/**
 * Forma de pagamento oferecida no app: decidida pelo admin, não pelo cliente.
 * Guardada em `app_settings` (mesma tabela chave-valor da senha do painel).
 */

// GET /api/settings/modalidade-pagamento — público, consumido pelo app mobile.
export async function handleGetModalidadePagamento(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const valor = await getSetting(KEY);
    const modalidade: Modalidade = (VALORES_VALIDOS as readonly string[]).includes(valor || '')
      ? (valor as Modalidade)
      : DEFAULT_MODALIDADE;
    res.json({ success: true, data: { modalidade } });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/settings/modalidade-pagamento — protegido, usado pelo painel.
export async function handleUpdateModalidadePagamento(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { modalidade } = req.body as { modalidade?: string };
    if (!modalidade || !(VALORES_VALIDOS as readonly string[]).includes(modalidade)) {
      throw new AppError('Modalidade inválida. Use VISTA ou PARCELADO.', 400);
    }
    await setSetting(KEY, modalidade);
    res.json({ success: true, data: { modalidade } });
  } catch (error) {
    next(error);
  }
}
