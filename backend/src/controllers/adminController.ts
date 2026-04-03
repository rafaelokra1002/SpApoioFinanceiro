import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, LeadStatus } from '../types';

export async function handleGetLeads(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;
    const leads = await leadService.getAllLeads(status as string | undefined);

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetLeadById(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    if (!lead) {
      throw new AppError('Solicitação não encontrada', 404);
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateStatus(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await leadService.updateLeadStatus(id, status as LeadStatus);

    res.json({
      success: true,
      data: lead,
      message: `Status atualizado para ${status}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteLead(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await leadService.deleteLead(id);

    res.json({
      success: true,
      message: 'Solicitação removida',
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetStats(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await leadService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
