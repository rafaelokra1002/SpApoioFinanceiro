import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

/** Lista pública das cidades atendidas, no formato que o app espera. */
// GET /api/cities
export async function handleGetActiveCities(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const cities = await prisma.city.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { nome: 'asc' }],
    });
    // O app consome { value, label } — mantém compatível com a lista antiga.
    const data = cities.map((c) => ({ value: c.nome, label: `${c.nome} - ${c.uf}` }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/cities
export async function handleGetCities(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ order: 'asc' }, { nome: 'asc' }],
    });
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/cities
export async function handleCreateCity(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { nome, uf, order, active } = req.body;

    if (!nome || !String(nome).trim()) {
      res.status(400).json({ success: false, error: 'nome é obrigatório' });
      return;
    }

    const city = await prisma.city.create({
      data: {
        nome: String(nome).trim(),
        uf: (uf && String(uf).trim()) || 'BA',
        order: order ?? 0,
        active: active ?? true,
      },
    });

    res.status(201).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/cities/:id
export async function handleUpdateCity(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { nome, uf, order, active } = req.body;

    const city = await prisma.city.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: String(nome).trim() }),
        ...(uf !== undefined && { uf: String(uf).trim() || 'BA' }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    res.json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/cities/:id
export async function handleDeleteCity(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.city.delete({ where: { id } });
    res.json({ success: true, message: 'Cidade removida' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/cities/seed - popula a partir da lista fixa antiga do app
export async function handleSeedCities(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.city.count();
    if (existing > 0) {
      res.json({ success: true, message: 'Cidades já existem, seed ignorado' });
      return;
    }

    const nomes = [
      'Camaçari', 'Dias d\'Ávila', 'Catu', 'Abrantes', 'Lauro de Freitas',
      'Feira de Santana', 'São Sebastião do Passé', 'Mata de São João', 'Pojuca',
    ];

    await prisma.city.createMany({
      data: nomes.map((nome, i) => ({ nome, uf: 'BA', order: i })),
    });

    res.status(201).json({ success: true, message: `${nomes.length} cidades criadas` });
  } catch (error) {
    next(error);
  }
}
