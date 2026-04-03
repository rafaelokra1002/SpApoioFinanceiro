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
}

export interface UploadedFile {
  file: File;
  preview: string;
}

export type CategoryType =
  | 'ASSALARIADO_CLT'
  | 'AUTONOMO'
  | 'APOSENTADO'
  | 'PENSIONISTA'
  | 'EMPRESARIO'
  | 'COM_GARANTIA'
  | 'RENOVACAO'
  | 'QUITAR_DIVIDAS';

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
