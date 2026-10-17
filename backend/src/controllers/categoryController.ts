import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

// GET /api/admin/categories
export async function handleGetCategories(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: { documents: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories (public - for mobile)
export async function handleGetActiveCategories(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: { documents: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/categories
export async function handleCreateCategory(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { value, label, icon, order, documents } = req.body;

    if (!value || !label) {
      res.status(400).json({ success: false, error: 'value e label são obrigatórios' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        value: value.toUpperCase().replace(/\s+/g, '_'),
        label,
        icon: icon || '📋',
        order: order ?? 0,
        documents: documents?.length
          ? {
              create: documents.map((doc: any, i: number) => ({
                key: doc.key,
                label: doc.label,
                description: doc.description || '',
                icon: doc.icon || '📄',
                order: i,
              })),
            }
          : undefined,
      },
      include: { documents: true },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/categories/:id
export async function handleUpdateCategory(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { label, icon, order, active } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
      include: { documents: true },
    });

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/categories/:id
export async function handleDeleteCategory(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Categoria removida' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/categories/:id/documents
export async function handleAddDocument(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { key, label, description, icon, order } = req.body;

    if (!key || !label) {
      res.status(400).json({ success: false, error: 'key e label são obrigatórios' });
      return;
    }

    const doc = await prisma.categoryDocument.create({
      data: {
        categoryId: id,
        key,
        label,
        description: description || '',
        icon: icon || '📄',
        order: order ?? 0,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/categories/documents/:docId
export async function handleUpdateDocument(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const docId = req.params.docId as string;
    const { key, label, description, icon, order } = req.body;

    const doc = await prisma.categoryDocument.update({
      where: { id: docId },
      data: {
        ...(key !== undefined && { key }),
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
      },
    });

    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/categories/documents/:docId
export async function handleDeleteDocument(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const docId = req.params.docId as string;
    await prisma.categoryDocument.delete({ where: { id: docId } });
    res.json({ success: true, message: 'Documento removido' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/categories/seed - Seed initial categories from mobile constants
export async function handleSeedCategories(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // A migração 20261018 já insere MOTORISTA_APP e TRABALHO_JOB: elas não contam como
    // "banco já populado", senão um banco novo ficaria sem as demais categorias.
    const INSERIDAS_POR_MIGRACAO = ['MOTORISTA_APP', 'TRABALHO_JOB'];
    const existing = await prisma.category.count({ where: { value: { notIn: INSERIDAS_POR_MIGRACAO } } });
    if (existing > 0) {
      res.json({ success: true, message: 'Categorias já existem, seed ignorado' });
      return;
    }

    const categories = [
      {
        value: 'CARTEIRA_ASSINADA', label: 'Carteira Assinada', icon: '👔', order: 0,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Carteira de trabalho digital', label: 'Carteira de Trabalho Digital', description: 'Arquivo em PDF.', icon: '💼' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
        ],
      },
      {
        value: 'CLT_SEM_REGISTRO', label: 'Trabalho Informal', icon: '📝', order: 1,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
          { key: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', label: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', description: 'Envie uma das duas opções', icon: '📄' },
        ],
      },
      {
        value: 'AUTONOMO', label: 'Autônomo / conta própria', icon: '🔧', order: 2,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
          { key: 'Extrato bancário', label: 'Extrato bancário (últimos 30 dias)', description: 'Extrato completo do último mês', icon: '📄' },
        ],
      },
      {
        value: 'BENEFICIARIO', label: 'Beneficiário', icon: '📋', order: 3,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Extrato bancário', label: 'Extrato do benefício', description: 'Envie o extrato do último mês com seu nome e o valor do benefício visíveis.', icon: '📄' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
        ],
      },
      {
        value: 'ESTAGIARIO', label: 'Estagiário', icon: '🎓', order: 4,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Contrato de estágio ou comprovante do último pagamento', label: 'Comprovante de estágio', description: 'Contrato de estágio ou comprovante do último pagamento. Envie uma das opções.', icon: '📄' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
        ],
      },
      {
        value: 'SERVIDOR_PUBLICO', label: 'Servidor público', icon: '🏛️', order: 5,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
        ],
      },
      {
        value: 'RECEBE_SEGURO', label: 'Recebe seguro', icon: '🛡️', order: 6,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Comprovante do seguro', label: 'Comprovante do seguro', description: 'Envie o extrato ou comprovante do recebimento.', icon: '📄' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
        ],
      },
      {
        value: 'MOTORISTA_APP', label: 'Motorista de aplicativo', icon: '🚗', order: 7,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
          { key: 'Comprovante de ganhos', label: 'Comprovante de ganhos', description: 'Extratos ou prints dos últimos 30 dias da Uber ou 99. Se trabalha nos dois, envie dos dois.', icon: '📊' },
        ],
      },
      {
        value: 'TRABALHO_JOB', label: 'Trabalho com job (GP)', icon: '💼', order: 9,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Foto do rosto', description: 'Foto nítida, sem filtro.', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz dos últimos 2 meses.', icon: '🏠' },
          { key: 'Extrato bancário', label: 'Extrato bancário', description: 'Últimos 30 dias.', icon: '📄' },
        ],
      },
      {
        value: 'SEM_COMPROVACAO', label: 'Sem comprovação de renda', icon: '❌', order: 8,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
          { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
        ],
      },
    ];

    const jaExistem = new Set(
      (await prisma.category.findMany({ select: { value: true } })).map((c) => c.value),
    );
    const faltando = categories.filter((cat) => !jaExistem.has(cat.value));

    for (const cat of faltando) {
      await prisma.category.create({
        data: {
          value: cat.value,
          label: cat.label,
          icon: cat.icon,
          order: cat.order,
          documents: {
            create: cat.documents.map((doc, i) => ({
              key: doc.key,
              label: doc.label,
              description: doc.description,
              icon: doc.icon,
              order: i,
            })),
          },
        },
      });
    }

    res.status(201).json({ success: true, message: `${faltando.length} categorias criadas` });
  } catch (error) {
    next(error);
  }
}
