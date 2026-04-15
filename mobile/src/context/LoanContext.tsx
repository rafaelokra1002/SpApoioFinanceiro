import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CategoryType, SimulationResult, UploadedFile } from '../types';

export interface LoanState {
  // step: 0=home, 1=category, 2=simulation, 3=result, 4=documents, 5=confirmation
  step: number;
  categoria: CategoryType | '';
  valor: number;
  parcelas: number;
  cidade: string;
  renda: string;
  instagram: string;
  indicacao: string;
  simulation: SimulationResult | null;
  // personal data (documents page)
  nome: string;
  telefone: string;
  cpf: string;
  email: string;
  nomeEmpresa: string;
  bairroTrabalho: string;
  documents: Record<string, UploadedFile | null>;
  loading: boolean;
  // modals
  showComoFunciona: boolean;
  showDocumentosInfo: boolean;
  showDuvidas: boolean;
}

type Action =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_SIMULATION'; payload: SimulationResult }
  | { type: 'SET_DOCUMENT'; key: string; file: UploadedFile | null }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SHOW_MODAL'; modal: 'comoFunciona' | 'documentosInfo' | 'duvidas'; show: boolean }
  | { type: 'RESET' };

const initial: LoanState = {
  step: 0, categoria: '', valor: 0, parcelas: 12, cidade: '',
  renda: '', instagram: '', indicacao: '', simulation: null,
  nome: '', telefone: '', cpf: '', email: '',
  nomeEmpresa: '', bairroTrabalho: '',
  documents: {}, loading: false,
  showComoFunciona: false, showDocumentosInfo: false, showDuvidas: false,
};

function reducer(state: LoanState, action: Action): LoanState {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.value };
    case 'SET_SIMULATION': return { ...state, simulation: action.payload };
    case 'SET_DOCUMENT': return { ...state, documents: { ...state.documents, [action.key]: action.file } };
    case 'SET_STEP': return { ...state, step: action.step };
    case 'SHOW_MODAL':
      if (action.modal === 'comoFunciona') return { ...state, showComoFunciona: action.show };
      if (action.modal === 'documentosInfo') return { ...state, showDocumentosInfo: action.show };
      if (action.modal === 'duvidas') return { ...state, showDuvidas: action.show };
      return state;
    case 'RESET': return initial;
    default: return state;
  }
}

const Ctx = createContext<{ state: LoanState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useLoan() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLoan deve ser usado dentro de LoanProvider');
  return ctx;
}
