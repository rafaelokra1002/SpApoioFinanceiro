import { useState, useCallback } from 'react';
import { SimulationResult } from '../types';
import { PARCELAS } from '../constants/categories';

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);

  const calculate = useCallback((valor: number, numParcelas: number, categoria?: string) => {
    if (valor <= 0 || numParcelas <= 0) { setResult(null); return null; }

    const isSemComprovacao = categoria === 'SEM_COMPROVACAO';
    const parcela = PARCELAS.find(p => p.value === numParcelas);
    const taxaJuros = isSemComprovacao ? 35 : 30;
    const coefBase = parcela?.coeficiente ?? 1.30;
    const coef = isSemComprovacao ? coefBase + 0.05 : coefBase;
    const valorTotal = Math.round(valor * coef * 100) / 100;
    const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;

    // 1ª parcela: 30 dias a partir de hoje
    const hoje = new Date();
    const primParcela = new Date(hoje);
    primParcela.setDate(primParcela.getDate() + 30);
    const primParcelaStr = primParcela.toLocaleDateString('pt-BR');

    const sim: SimulationResult = {
      valorSolicitado: valor,
      taxaJuros,
      valorTotal,
      parcelas: numParcelas,
      valorParcela,
      primeiraParcela: primParcelaStr,
    };
    setResult(sim);
    return sim;
  }, []);

  const reset = useCallback(() => setResult(null), []);
  return { result, calculate, reset };
}
