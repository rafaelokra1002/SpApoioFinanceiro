export interface SimulationInput {
  valor: number;
  cidade: string;
}

export interface SimulationResult {
  valorSolicitado: number;
  taxaJuros: number;
  valorJuros: number;
  valorTotal: number;
  prazo: number;
}

export interface LeadInput {
  nome: string;
  telefone: string;
  cpf?: string;
  email?: string;
  valorSolicitado: number;
  valorTotal: number;
  cidade: string;
  perfil: string;
  nomeEmpresa?: string;
  bairroTrabalho?: string;
}

export interface DocumentInput {
  leadId: string;
  tipo: string;
  url: string;
  filename: string;
}

export type LeadStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'EM_ANALISE';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
