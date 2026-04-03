import { SimulationResult } from '../types';

const TAXA_JUROS = 30;
const PRAZO_DIAS = 30;

export function calcularEmprestimo(valor: number): SimulationResult {
  const valorJuros = valor * (TAXA_JUROS / 100);
  const valorTotal = valor + valorJuros;

  return {
    valorSolicitado: valor,
    taxaJuros: TAXA_JUROS,
    valorJuros: Math.round(valorJuros * 100) / 100,
    valorTotal: Math.round(valorTotal * 100) / 100,
    prazo: PRAZO_DIAS,
  };
}
