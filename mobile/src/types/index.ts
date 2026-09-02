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
  /** Origem escolhida pelo cliente: 'PANFLETO' | 'INSTAGRAM' | 'INDICACAO'. */
  origem?: string;
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
  | 'SERVIDOR_PUBLICO'
  | 'SEM_COMPROVACAO'
  | 'COM_GARANTIA';

/** Vínculo do servidor público (só usado quando categoria = SERVIDOR_PUBLICO). */
export type VinculoServidor = 'EFETIVO' | 'COMISSIONADO' | '';

export interface CategoryOption {
  value: CategoryType;
  label: string;
  icon: string;
  description?: string;
  badge?: string;
  highlight?: 'verde' | 'azul';
}

export type BemGarantiaType =
  | 'IMOVEL'
  | 'VEICULO'
  | 'ELETRONICO'
  | 'OUTRO';

export type TipoDocImovel = 'ESCRITURA' | 'CONTRATO' | 'SEM_DOC' | '';

export interface GarantiaImovel {
  tipoImovel: string;
  descricao: string;
  endereco: string;
  valorMercado: string;
  tipoDocumentacao: TipoDocImovel;
}

export type TipoVeiculo = 'CARRO' | 'MOTO';

export interface GarantiaVeiculo {
  tipo: TipoVeiculo;
  marca: string;
  modelo: string;
  quilometragem: string;
  placa: string;
  valorMercado: string;
  possuiManual: boolean;
  possuiChaveReserva: boolean;
}

export interface GarantiaEletronico {
  tipoItem: string;
  marca: string;
  modelo: string;
  estadoConservacao: string;
  capacidade: string;
  temCaixa: boolean;
  temNotaFiscal: boolean;
  temCarregador: boolean;
  valorMercado: string;
}

export interface GarantiaOutro {
  nome: string;
  descricao: string;
  estadoConservacao: string;
  valorMercado: string;
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
