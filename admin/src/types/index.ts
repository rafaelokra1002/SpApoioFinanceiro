export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  cpf: string | null;
  email: string | null;
  instagram: string | null;
  renda: string | null;
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

export interface CategoryDocument {
  id: string;
  categoryId: string;
  key: string;
  label: string;
  description: string;
  icon: string;
  order: number;
}

export interface Category {
  id: string;
  value: string;
  label: string;
  icon: string;
  order: number;
  active: boolean;
  documents: CategoryDocument[];
}
