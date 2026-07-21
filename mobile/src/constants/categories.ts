import { CategoryOption, DocumentType, ParcelaOption, RendaOption } from '../types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'CARTEIRA_ASSINADA', label: 'CLT Registrado', icon: '👔',
    description: 'Para quem possui carteira assinada.' },
  { value: 'CLT_SEM_REGISTRO', label: 'CLT Informal', icon: '📝',
    description: 'Para quem trabalha com carteira assinada sem registro.' },
  { value: 'AUTONOMO', label: 'Autônomo', icon: '🔧',
    description: 'Para quem trabalha por conta própria.' },
  { value: 'BENEFICIARIO', label: 'Beneficiário', icon: '📋',
    description: 'Para quem recebe benefício do INSS.' },
  { value: 'ESTAGIARIO', label: 'Estagiário', icon: '🎓',
    description: 'Para quem é estudante e estagia.' },
  { value: 'COM_GARANTIA', label: 'Tenho um bem como garantia', icon: '🔒',
    description: 'Você oferece um bem como garantia para o empréstimo.',
    badge: 'Novo', highlight: 'verde' },
  { value: 'SEM_COMPROVACAO', label: 'Recebo, mas não preciso comprovar', icon: '❌',
    description: 'Para quem recebe renda, mas não tem ou não quer apresentar comprovante.',
    badge: 'Simples', highlight: 'azul' },
];

export const PARCELAS: ParcelaOption[] = [
  { value: 1, label: '1x', coeficiente: 1.30 },
  { value: 2, label: '2x', coeficiente: 1.35 },
  { value: 3, label: '3x', coeficiente: 1.40 },
  { value: 4, label: '4x', coeficiente: 1.45 },
];

export const RENDAS: RendaOption[] = [
  { value: '1000',  label: 'R$ 1.000,00' },
  { value: '1500',  label: 'R$ 1.500,00' },
  { value: '2000',  label: 'R$ 2.000,00' },
  { value: '2500',  label: 'R$ 2.500,00' },
  { value: '3000',  label: 'R$ 3.000,00' },
  { value: '3500',  label: 'R$ 3.500,00' },
  { value: '4000',  label: 'R$ 4.000,00' },
  { value: '5000',  label: 'R$ 5.000,00' },
  { value: '7000',  label: 'R$ 7.000,00' },
  { value: '10000', label: 'R$ 10.000,00' },
  { value: '15000', label: 'Acima de R$ 10.000' },
];

export const DOCUMENT_TYPES: Record<string, DocumentType[]> = {
  CARTEIRA_ASSINADA: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Foto da parte da frente', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Foto da parte de trás', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie', description: 'Rosto nítido, sem filtro', icon: '📷' },
    { key: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', label: 'Extrato bancário ou último pagamento', description: 'Últimos 30 dias ou comprovante recente', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  CLT_SEM_REGISTRO: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', label: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', description: 'Envie uma das duas opções', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  AUTONOMO: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário', label: 'Extrato bancário (últimos 30 dias)', description: 'Extrato completo do último mês', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  BENEFICIARIO: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário', label: 'Extrato bancário (últimos 30 dias)', description: 'Print do app com nome e valor visível', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  ESTAGIARIO: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Contrato de estágio ou comprovante do último pagamento', label: 'Contrato de estágio ou comprovante do último pagamento', description: 'Envie uma das duas opções', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  SEM_COMPROVACAO: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  COM_GARANTIA: [
    { key: 'RG ou CNH (frente)', label: 'RG ou CNH (frente)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'RG ou CNH (verso)', label: 'RG ou CNH (verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Documento da garantia', label: 'Documento da garantia', description: 'Documento do bem oferecido', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
};

export const REQUIRED_DOCUMENTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DOCUMENT_TYPES).map(([k, v]) => [k, v.map(d => d.key)])
);
