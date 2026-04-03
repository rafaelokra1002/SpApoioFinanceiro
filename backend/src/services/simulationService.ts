import { PrismaClient } from '@prisma/client';
import { calcularEmprestimo } from '../utils/calculator';
import { SimulationResult } from '../types';

const prisma = new PrismaClient();

export async function createSimulation(
  valor: number,
  cidade: string
): Promise<SimulationResult> {
  const resultado = calcularEmprestimo(valor);

  await prisma.simulation.create({
    data: {
      valorSolicitado: resultado.valorSolicitado,
      valorTotal: resultado.valorTotal,
      taxaJuros: resultado.taxaJuros,
      prazo: resultado.prazo,
      cidade,
    },
  });

  return resultado;
}
