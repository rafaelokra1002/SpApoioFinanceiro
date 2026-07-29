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
  indicacao: string | null;
  endereco: string | null;
  cep: string | null;
  enderecoTrabalho: string | null;
  observacao: string | null;
  latitude: number | null;
  longitude: number | null;
  evitarGolpes: boolean;
  analiseCliente: boolean;
  /** Grupo em que o lead caiu na recusa: 1, 2 ou 3 (null se não definido). */
  grupo: number | null;
  /** Motivo da recusa, preenchido pelo painel. */
  motivoRecusa: string | null;
  /** Valor efetivamente aprovado (pode diferir do solicitado). */
  valorAprovado: number | null;
  /** Modalidade aprovada pelo painel: 'AVISTA' | 'PARCELADO'. */
  modalidadeAprovada: string | null;
  /** "Deve alguém": anotação de análise enviada ao grupo. */
  deveAlguem: string | null;
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

export interface City {
  id: string;
  nome: string;
  uf: string;
  order: number;
  active: boolean;
}
