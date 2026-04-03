import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

export const simulationSchema = z.object({
  valor: z
    .number({ required_error: 'Valor é obrigatório' })
    .min(100, 'Valor mínimo é R$ 100,00')
    .max(50000, 'Valor máximo é R$ 50.000,00'),
  cidade: z
    .string({ required_error: 'Cidade é obrigatória' })
    .min(2, 'Cidade inválida'),
});

export const leadSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z
    .string({ required_error: 'Telefone é obrigatório' })
    .min(10, 'Telefone inválido'),
  cpf: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  valorSolicitado: z
    .number({ required_error: 'Valor é obrigatório' })
    .min(100, 'Valor mínimo é R$ 100,00'),
  valorTotal: z
    .number({ required_error: 'Valor total é obrigatório' })
    .min(100),
  cidade: z.string().min(2, 'Cidade inválida'),
  perfil: z.string().min(2, 'Perfil é obrigatório'),
  nomeEmpresa: z.string().optional().or(z.literal('')),
  bairroTrabalho: z.string().optional().or(z.literal('')),
});

export const statusSchema = z.object({
  status: z.enum(['PENDENTE', 'APROVADO', 'RECUSADO', 'EM_ANALISE']),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => e.message).join(', ');
        next(new AppError(messages, 422));
      } else {
        next(error);
      }
    }
  };
}
