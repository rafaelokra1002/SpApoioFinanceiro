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
  instagram?: string;
  renda?: string;
  valorSolicitado: number;
  valorTotal: number;
  /** Nº de parcelas escolhido pelo cliente (1 = à vista). */
  parcelas?: number;
  cidade: string;
  perfil: string;
  nomeEmpresa?: string;
  bairroTrabalho?: string;
  indicacao?: string;
  origem?: string;
  endereco?: string;
  cep?: string;
  enderecoTrabalho?: string;
  /** Servidor público: vínculo escolhido (EFETIVO/COMISSIONADO). */
  vinculoServidor?: string;
  /** Servidor público: matrícula funcional (efetivo) ou cargo ocupado (comissionado). */
  matriculaCargo?: string;
  observacao?: string;
  latitude?: number;
  longitude?: number;
}

export interface DocumentInput {
  leadId: string;
  tipo: string;
  url: string;
  filename: string;
}

export type LeadStatus =
  | 'PENDENTE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'EM_ANALISE'
  | 'NAO_CONTRATOU'
  | 'PASSEI_COLABORADOR';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
