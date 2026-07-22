import { useState, useCallback } from 'react';
import { SimulationResult } from '../types';

/**
 * Cálculo puro da simulação — sem estado, para poder ser usado direto na
 * renderização (prévia ao vivo) sem disparar setState durante o render.
 *
 * Juros pela Tabela Price (parcela fixa):
 *   parcela = valor * i / (1 - (1 + i)^-n)
 * Com n = 1 o resultado é o mesmo do crédito à vista (valor * (1 + i)).
 */
export function simular(valor: number, numParcelas: number, categoria?: string): SimulationResult | null {
  if (valor <= 0 || numParcelas <= 0) return null;

  const isSemComprovacao = categoria === 'SEM_COMPROVACAO';
  const taxaJuros = isSemComprovacao ? 35 : 30;
  const i = taxaJuros / 100;

  const parcelaExata = (valor * i) / (1 - Math.pow(1 + i, -numParcelas));
  const valorParcela = Math.round(parcelaExata * 100) / 100;
  const valorTotal = Math.round(valorParcela * numParcelas * 100) / 100;

  // 1ª parcela: 30 dias a partir de hoje
  const primParcela = new Date();
  primParcela.setDate(primParcela.getDate() + 30);

  return {
    valorSolicitado: valor,
    taxaJuros,
    valorTotal,
    parcelas: numParcelas,
    valorParcela,
    primeiraParcela: primParcela.toLocaleDateString('pt-BR'),
  };
}

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);

  const calculate = useCallback((valor: number, numParcelas: number, categoria?: string) => {
    const sim = simular(valor, numParcelas, categoria);
    setResult(sim);
    return sim;
  }, []);

  const reset = useCallback(() => setResult(null), []);
  return { result, calculate, reset };
}
