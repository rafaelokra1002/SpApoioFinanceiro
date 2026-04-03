export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  cpf: string | null;
  email: string | null;
  valorSolicitado: number;
  valorTotal: number;
  taxaJuros: number;
  prazo: number;
  cidade: string;
  perfil: string;
  nomeEmpresa: string | null;
  bairroTrabalho: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  documentos: Document[];
}

export interface Document {
  id: string;
  leadId: string;
  tipo: string;
  url: string;
  filename: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pendentes: number;
  aprovados: number;
  recusados: number;
  valorTotalSolicitado: number;
}
