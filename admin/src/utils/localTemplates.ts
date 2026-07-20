/**
 * Mensagens montadas pelo próprio painel: as de recusa (uma por grupo/motivo) e
 * a de aprovação copiada no modal de aprovar.
 *
 * Ficam no localStorage e não no backend porque `MessageTemplate.status` é um
 * enum de LeadStatus — não caberia uma chave por grupo sem migração. Estas
 * mensagens não passam pelo template do servidor: o painel monta e envia/copia.
 */

const TEXTO_RECUSA = 'Olá, {{nome}}! Após análise da sua solicitação, infelizmente não foi possível aprovar seu crédito no momento.\nMotivo: {{motivo}}\nAgradecemos o interesse e ficamos à disposição.';

export const RECUSA_DEFAULTS: Record<number, string> = {
  1: TEXTO_RECUSA,
  2: TEXTO_RECUSA,
  3: TEXTO_RECUSA,
};

export const APROVACAO_DEFAULT = 'Olá, {{nome}}! Temos uma ótima notícia: seu crédito foi *APROVADO*!\n\n'
  + 'Valor aprovado: {{valor}}\n'
  + 'Total a pagar: {{total}}\n'
  + 'Pagamento: {{parcelas}}\n\n'
  + 'Nossa equipe entrará em contato para finalizar o processo.\n\n'
  + '*Equipe SP Apoio Financeiro*';

const RECUSA_KEY = 'sp-admin-recusa-templates';
const APROVACAO_KEY = 'sp-admin-aprovacao-template';

export function getRecusaTemplates(): Record<number, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(RECUSA_KEY) ?? '{}') as Record<string, string>;
    return {
      1: saved['1'] || RECUSA_DEFAULTS[1],
      2: saved['2'] || RECUSA_DEFAULTS[2],
      3: saved['3'] || RECUSA_DEFAULTS[3],
    };
  } catch {
    return { ...RECUSA_DEFAULTS };
  }
}

export function saveRecusaTemplate(grupo: number, content: string) {
  const atual = getRecusaTemplates();
  localStorage.setItem(RECUSA_KEY, JSON.stringify({ ...atual, [grupo]: content }));
}

export function getAprovacaoTemplate(): string {
  return localStorage.getItem(APROVACAO_KEY) || APROVACAO_DEFAULT;
}

export function saveAprovacaoTemplate(content: string) {
  localStorage.setItem(APROVACAO_KEY, content);
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}

/** Troca {{chave}} pelos valores informados (aceita espaços dentro das chaves). */
export function renderTemplate(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, chave: string) => vars[chave] ?? match);
}

export function renderRecusaTemplate(content: string, nome: string, motivo: string): string {
  return renderTemplate(content, { nome: primeiroNome(nome), motivo });
}

export function renderAprovacaoTemplate(content: string, vars: {
  nome: string; valor: string; total: string; modalidade: string; parcelas: string;
}): string {
  return renderTemplate(content, { ...vars, nome: primeiroNome(vars.nome) });
}
