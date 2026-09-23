import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  console.error('[ERROR]', err.message, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Limites do upload (tamanho/quantidade): mensagem clara em vez do texto interno do multer.
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'Um dos arquivos é muito grande. Envie fotos menores ou PDFs mais leves.'
      : 'Quantidade de arquivos acima do permitido. Envie apenas os documentos pedidos.';
    res.status(400).json({ success: false, error: msg });
    return;
  }

  // Erros do banco (Prisma) trazem consulta e caminhos de arquivo: nunca vão para o cliente.
  if (err.name.startsWith('PrismaClient')) {
    res.status(500).json({
      success: false,
      error: 'Não foi possível salvar sua solicitação agora. Tente novamente em instantes.',
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
  });
}
