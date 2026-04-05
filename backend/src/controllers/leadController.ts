import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService';
import { getUploadUrl, shouldUseCloudinary, uploadToCloudinary } from '../services/uploadService';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

function getBaseUrl(req: Request): string {
  const forwardedProto = req.header('x-forwarded-proto');
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

async function persistDocument(file: Express.Multer.File, baseUrl: string) {
  const url = shouldUseCloudinary()
    ? await uploadToCloudinary(file.path)
    : getUploadUrl(file.filename, baseUrl);

  return {
    tipo: file.fieldname || 'documento',
    url,
    filename: file.originalname || file.filename,
  };
}

export async function handleCreateLead(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await leadService.createLead(req.body);
    res.status(201).json({
      success: true,
      data: lead,
      message: 'Solicitação criada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUploadDocuments(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { leadId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('Nenhum arquivo enviado', 400);
    }

    const lead = await leadService.getLeadById(leadId as string);
    if (!lead) {
      throw new AppError('Solicitação não encontrada', 404);
    }

    const baseUrl = getBaseUrl(req);
    const documents = [];
    for (const file of files) {
      documents.push(await persistDocument(file, baseUrl));
    }

    await leadService.addDocuments(leadId as string, documents);

    res.status(200).json({
      success: true,
      data: documents,
      message: 'Documentos enviados com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateLeadWithDocs(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    const body = req.body;

    const leadData = {
      nome: body.nome,
      telefone: body.telefone,
      cpf: body.cpf || undefined,
      email: body.email || undefined,
      valorSolicitado: parseFloat(body.valorSolicitado) || 0,
      valorTotal: parseFloat(body.valorTotal) || 0,
      cidade: body.cidade || '',
      perfil: body.perfil || '',
      nomeEmpresa: body.nomeEmpresa || undefined,
      bairroTrabalho: body.bairroTrabalho || undefined,
    };

    const lead = await leadService.createLead(leadData);

    if (files && files.length > 0) {
      const baseUrl = getBaseUrl(req);
      const documents = [];
      for (const file of files) {
        documents.push(await persistDocument(file, baseUrl));
      }
      await leadService.addDocuments(lead.id, documents);
    }

    const leadCompleto = await leadService.getLeadById(lead.id);

    res.status(201).json({
      success: true,
      data: leadCompleto,
      message: 'Solicitação enviada com sucesso! Análise em até 24h.',
    });
  } catch (error) {
    next(error);
  }
}
