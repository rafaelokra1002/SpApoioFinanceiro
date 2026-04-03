import { Request, Response, NextFunction } from 'express';
import { createSimulation } from '../services/simulationService';
import { ApiResponse, SimulationResult } from '../types';

export async function handleSimulation(
  req: Request,
  res: Response<ApiResponse<SimulationResult>>,
  next: NextFunction
): Promise<void> {
  try {
    const { valor, cidade } = req.body;
    const resultado = await createSimulation(valor, cidade);

    res.status(200).json({
      success: true,
      data: resultado,
      message: 'Simulação realizada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}
