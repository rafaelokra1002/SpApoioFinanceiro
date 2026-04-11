import { CategoryOption, DocumentType, ParcelaOption, RendaOption } from '../types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'CARTEIRA_ASSINADA', label: 'Carteira Assinada', icon: '👔' },
  { value: 'CLT_SEM_REGISTRO', label: 'CLT sem Registro', icon: '📝' },
  { value: 'AUTONOMO', label: 'Autônomo', icon: '🔧' },
  { value: 'BENEFICIARIO', label: 'Beneficiário', icon: '📋' },
  { value: 'ESTAGIARIO', label: 'Estagiário', icon: '🎓' },
  { value: 'SEM_COMPROVACAO', label: 'Não Precisa Comprovar Renda', icon: '❌' },
  // { value: 'COM_GARANTIA', label: 'Solicite com Garantia', icon: '🔒' },
];

export const PARCELAS: ParcelaOption[] = [
  { value: 1,  label: '1x',  coeficiente: 1.30 },
  { value: 2,  label: '2x',  coeficiente: 1.35 },
  { value: 3,  label: '3x',  coeficiente: 1.40 },
  { value: 4,  label: '4x',  coeficiente: 1.45 },
  { value: 5,  label: '5x',  coeficiente: 1.50 },
  { value: 6,  label: '6x',  coeficiente: 1.55 },
  { value: 8,  label: '8x',  coeficiente: 1.65 },
  { value: 10, label: '10x', coeficiente: 1.75 },
  { value: 12, label: '12x', coeficiente: 1.80 },
  { value: 18, label: '18x', coeficiente: 2.10 },
  { value: 24, label: '24x', coeficiente: 2.40 },
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
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Carteira de trabalho digital', label: 'Envie a Carteira de Trabalho em PDF', description: 'Envie em formato PDF', icon: '💼' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  CLT_SEM_REGISTRO: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', label: 'Extrato bancário (últimos 30 dias) ou comprovante do último pagamento', description: 'Envie uma das duas opções', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  AUTONOMO: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário', label: 'Extrato bancário (últimos 30 dias)', description: 'Extrato completo do último mês', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  BENEFICIARIO: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Extrato bancário', label: 'Extrato bancário (últimos 30 dias)', description: 'Print do app com nome e valor visível', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  ESTAGIARIO: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Contrato de estágio ou comprovante do último pagamento', label: 'Contrato de estágio ou comprovante do último pagamento', description: 'Envie uma das duas opções', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  SEM_COMPROVACAO: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
  COM_GARANTIA: [
    { key: 'RG ou CNH (frente e verso)', label: 'RG ou CNH (frente e verso)', description: 'Documento de identificação', icon: '🪪' },
    { key: 'Selfie (rosto)', label: 'Selfie (rosto nítido)', description: 'Sem filtro, rosto bem visível', icon: '📷' },
    { key: 'Documento da garantia', label: 'Documento da garantia', description: 'Documento do bem oferecido', icon: '📄' },
    { key: 'Comprovante de residência', label: 'Comprovante de residência', description: 'Água ou luz – últimos 2 meses', icon: '🏠' },
  ],
};

export const REQUIRED_DOCUMENTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DOCUMENT_TYPES).map(([k, v]) => [k, v.map(d => d.key)])
);
