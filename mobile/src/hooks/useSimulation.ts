import { useState, useCallback } from 'react';
import { SimulationResult } from '../types';
import { PARCELAS } from '../constants/categories';

/**
 * Cálculo puro da simulação — sem estado, para poder ser usado direto na
 * renderização (prévia ao vivo) sem disparar setState durante o render.
 */
export function simular(valor: number, numParcelas: number, categoria?: string): SimulationResult | null {
  if (valor <= 0 || numParcelas <= 0) return null;

  const isSemComprovacao = categoria === 'SEM_COMPROVACAO';
  const parcela = PARCELAS.find(p => p.value === numParcelas);
  const taxaJuros = isSemComprovacao ? 35 : 30;
  const coefBase = parcela?.coeficiente ?? 1.30;
  const coef = isSemComprovacao ? coefBase + 0.05 : coefBase;
  const valorTotal = Math.round(valor * coef * 100) / 100;
  const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;

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
