import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService';
import { getUploadUrl, shouldUseCloudinary, uploadToCloudinary } from '../services/uploadService';
import { AppError } from '../middleware/errorHandler';
import { rejectedFilesOf } from '../middleware/upload';
import { ApiResponse } from '../types';

function getBaseUrl(req: Request): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const forwardedProto = req.header('x-forwarded-proto');
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

/**
 * O multer/busboy decodifica o nome do arquivo do multipart como latin1, o que
 * embaralha acentos e o travessão (ex.: "Imóvel — Vídeo" vira "ImÃ³vel â€” VÃ­deo").
 * Reinterpreta os bytes como UTF-8 para recuperar o nome original.
 */
function decodeFilename(name: string): string {
  if (!name) return name;
  try {
    const fixed = Buffer.from(name, 'latin1').toString('utf8');
    return fixed.includes('�') ? name : fixed;
  } catch {
    return name;
  }
}

/** Recusa a requisição se algum arquivo foi descartado por formato não aceito (ver middleware/upload). */
function assertFormatosAceitos(req: Request): void {
  const rejeitados = rejectedFilesOf(req);
  if (rejeitados.length > 0) {
    const nomes = rejeitados.map(decodeFilename).join(', ');
    throw new AppError(`Formato de arquivo não aceito: ${nomes}. Envie JPEG, PNG, WebP ou PDF.`, 400);
  }
}

/** Apaga os temporários de um upload que não virou solicitação (falha ao enviar/salvar). Ignora erros. */
async function discardFiles(files: Express.Multer.File[]): Promise<void> {
  await Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => undefined)));
}

async function persistDocument(file: Express.Multer.File, baseUrl: string) {
  const url = shouldUseCloudinary()
    ? await uploadToCloudinary(file.path)
    : getUploadUrl(file.filename, baseUrl);

  return {
    tipo: file.fieldname || 'documento',
    url,
    filename: decodeFilename(file.originalname) || file.filename,
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
  const files = (req.files as Express.Multer.File[]) || [];
  let salvo = false;
  try {
    assertFormatosAceitos(req);
    const { leadId } = req.params;

    if (files.length === 0) {
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
    salvo = true;

    res.status(200).json({
      success: true,
      data: documents,
      message: 'Documentos enviados com sucesso',
    });
  } catch (error) {
    if (!salvo) await discardFiles(files);
    next(error);
  }
}

export async function handleCreateLeadWithDocs(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  const files = (req.files as Express.Multer.File[]) || [];
  let leadCriado = false;
  try {
    assertFormatosAceitos(req);
    const body = req.body;

    const leadData = {
      nome: body.nome,
      telefone: body.telefone,
      cpf: body.cpf || undefined,
      email: body.email || undefined,
      instagram: body.instagram || undefined,
      renda: body.renda || undefined,
      valorSolicitado: parseFloat(body.valorSolicitado) || 0,
      valorTotal: parseFloat(body.valorTotal) || 0,
      parcelas: body.parcelas ? parseInt(body.parcelas, 10) : undefined,
      cidade: body.cidade || '',
      perfil: body.perfil || '',
      nomeEmpresa: body.nomeEmpresa || undefined,
      bairroTrabalho: body.bairroTrabalho || undefined,
      indicacao: body.indicacao || undefined,
      origem: body.origem || undefined,
      endereco: body.endereco || undefined,
      cep: body.cep || undefined,
      enderecoTrabalho: body.enderecoTrabalho || undefined,
      vinculoServidor: body.vinculoServidor || undefined,
      matriculaCargo: body.matriculaCargo || undefined,
      observacao: body.observacao || undefined,
      latitude: body.latitude ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude ? parseFloat(body.longitude) : undefined,
    };

    // Envia os documentos ANTES de criar a solicitação: se um envio falhar (arquivo grande demais,
    // rede), nada é criado e o cliente pode tentar de novo sem gerar solicitação duplicada ou
    // sem documentos (antes o lead nascia primeiro e ficava órfão quando um envio falhava).
    const baseUrl = getBaseUrl(req);
    const documents = [];
    for (const file of files) {
      documents.push(await persistDocument(file, baseUrl));
    }

    const lead = await leadService.createLead(leadData);
    if (documents.length > 0) {
      await leadService.addDocuments(lead.id, documents);
    }
    leadCriado = true;

    const leadCompleto = await leadService.getLeadById(lead.id);

    res.status(201).json({
      success: true,
      data: leadCompleto,
      message: 'Solicitação enviada com sucesso! Análise em até 24h.',
    });
  } catch (error) {
    // Sem solicitação criada, os arquivos não pertencem a ninguém: apaga os temporários.
    if (!leadCriado) await discardFiles(files);
    next(error);
  }
}
