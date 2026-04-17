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
      res.status(400).json({ success: false, error: 'value e label sÃ£o obrigatÃ³rios' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        value: value.toUpperCase().replace(/\s+/g, '_'),
        label,
        icon: icon || 'ðŸ“‹',
        order: order ?? 0,
        documents: documents?.length
          ? {
              create: documents.map((doc: any, i: number) => ({
                key: doc.key,
                label: doc.label,
                description: doc.description || '',
                icon: doc.icon || 'ðŸ“„',
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
      res.status(400).json({ success: false, error: 'key e label sÃ£o obrigatÃ³rios' });
      return;
    }

    const doc = await prisma.categoryDocument.create({
      data: {
        categoryId: id,
        key,
        label,
        description: description || '',
        icon: icon || 'ðŸ“„',
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
    const existing = await prisma.category.count();
    if (existing > 0) {
      res.json({ success: true, message: 'Categorias jÃ¡ existem, seed ignorado' });
      return;
    }

    const categories = [
      {
        value: 'CARTEIRA_ASSINADA', label: 'Carteira Assinada', icon: 'ðŸ‘”', order: 0,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
          { key: 'Carteira de trabalho digital', label: 'Carteira de trabalho digital (PDF)', description: 'Envie em formato PDF', icon: 'ðŸ’¼' },
        ],
      },
      {
        value: 'CLT_SEM_REGISTRO', label: 'CLT sem Registro', icon: 'ðŸ“', order: 1,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
          { key: 'Extrato bancÃ¡rio (Ãºltimos 30 dias) ou comprovante do Ãºltimo pagamento', label: 'Extrato bancÃ¡rio (Ãºltimos 30 dias) ou comprovante do Ãºltimo pagamento', description: 'Envie uma das duas opÃ§Ãµes', icon: 'ðŸ“„' },
        ],
      },
      {
        value: 'AUTONOMO', label: 'AutÃ´nomo', icon: 'ðŸ”§', order: 2,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
          { key: 'Extrato bancÃ¡rio', label: 'Extrato bancÃ¡rio (Ãºltimos 30 dias)', description: 'Extrato completo do Ãºltimo mÃªs', icon: 'ðŸ“„' },
        ],
      },
      {
        value: 'BENEFICIARIO', label: 'BeneficiÃ¡rio', icon: 'ðŸ“‹', order: 3,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
          { key: 'Extrato bancÃ¡rio', label: 'Extrato bancÃ¡rio (Ãºltimos 30 dias)', description: 'Print do app com nome e valor visÃ­vel', icon: 'ðŸ“„' },
        ],
      },
      {
        value: 'ESTAGIARIO', label: 'EstagiÃ¡rio', icon: 'ðŸŽ“', order: 4,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
          { key: 'Contrato de estÃ¡gio ou comprovante do Ãºltimo pagamento', label: 'Contrato de estÃ¡gio ou comprovante do Ãºltimo pagamento', description: 'Envie uma das duas opÃ§Ãµes', icon: 'ðŸ“„' },
        ],
      },
      {
        value: 'SEM_COMPROVACAO', label: 'NÃ£o Precisa Comprovar Renda', icon: 'âŒ', order: 5,
        documents: [
          { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificaÃ§Ã£o', icon: 'ðŸªª' },
          { key: 'Selfie (rosto)', label: 'Selfie (rosto nÃ­tido)', description: 'Sem filtro, rosto bem visÃ­vel', icon: 'ðŸ“·' },
          { key: 'Comprovante de residÃªncia', label: 'Comprovante de residÃªncia', description: 'Ãgua ou luz â€“ Ãºltimos 2 meses', icon: 'ðŸ ' },
        ],
      },
    ];

    for (const cat of categories) {
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

    res.status(201).json({ success: true, message: `${categories.length} categorias criadas` });
  } catch (error) {
    next(error);
  }
}
