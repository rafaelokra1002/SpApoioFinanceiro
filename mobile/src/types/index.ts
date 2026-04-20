export interface SimulationResult {
  valorSolicitado: number;
  taxaJuros: number;
  valorTotal: number;
  parcelas: number;
  valorParcela: number;
  primeiraParcela: string;
}

export interface LeadData {
  nome: string;
  telefone: string;
  cpf?: string;
  email?: string;
  instagram?: string;
  valorSolicitado: number;
  valorTotal: number;
  parcelas: number;
  valorParcela: number;
  cidade: string;
  perfil: string;
  renda: string;
  nomeEmpresa?: string;
  bairroTrabalho?: string;
  indicacao?: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
}

export type CategoryType =
  | 'CARTEIRA_ASSINADA'
  | 'CLT_SEM_REGISTRO'
  | 'AUTONOMO'
  | 'BENEFICIARIO'
  | 'ESTAGIARIO'
  | 'SEM_COMPROVACAO'
  | 'COM_GARANTIA';

export interface CategoryOption {
  value: CategoryType;
  label: string;
  icon: string;
}

export interface DocumentType {
  key: string;
  label: string;
  description: string;
  icon: string;
}

export interface City {
  value: string;
  label: string;
}

export interface RendaOption {
  value: string;
  label: string;
}

export interface ParcelaOption {
  value: number;
  label: string;
  coeficiente: number;
}
