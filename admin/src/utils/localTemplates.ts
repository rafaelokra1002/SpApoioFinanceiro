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

/**
 * Modalidade de aprovação: cada uma tem sua própria mensagem para o cliente.
 * AVISTA_DE_PARCELADO = cliente pediu parcelado, mas foi aprovado só à vista.
 */
export type ModalidadeAprovacao = 'AVISTA' | 'PARCELADO' | 'AVISTA_DE_PARCELADO';

export const APROVACAO_PARCELADO_DEFAULT = 'Olá, {{nome}}!\n\n'
  + 'Sua solicitação foi *APROVADA*! ✅\n\n'
  + '💰 Valor aprovado: {{valor}}\n'
  + '💳 Parcelamento: {{parcelas}}\n'
  + '📌 Total a pagar: {{total}}\n\n'
  + 'Para continuar, fale com nossa equipe no WhatsApp:\n\n'
  + 'https://wa.me/5571983024664\n\n'
  + 'Ao chamar, envie:\n'
  + '* Nome completo\n'
  + '* Data escolhida para pagamento';

export const APROVACAO_AVISTA_DEFAULT = 'Olá, {{nome}}!\n\n'
  + 'Sua solicitação foi *APROVADA*! ✅\n\n'
  + '💰 Valor aprovado: {{valor}}\n'
  + '💳 Pagamento: à vista (até 30 dias)\n'
  + '📌 Total a pagar: {{total}}\n\n'
  + '📲 Para concluir a contratação, fale com nossa equipe pelo WhatsApp:\n\n'
  + '👉 https://wa.me/5571983024664\n\n'
  + 'Ao chamar, envie:\n'
  + '* Nome completo\n'
  + '* Data escolhida para pagamento';

export const APROVACAO_AVISTA_DE_PARCELADO_DEFAULT = '🎉 Olá, {{nome}}!\n\n'
  + 'Sua solicitação foi *ANALISADA*! ✅\n\n'
  + '📋 Você solicitou o parcelamento, porém, no momento, foi aprovado apenas o crédito à vista.\n\n'
  + '💰 Valor aprovado: {{valor}}\n'
  + '💳 Pagamento: à vista (até 30 dias)\n'
  + '📌 Total a pagar: {{total}}\n\n'
  + '📲 Para concluir a contratação, fale com nossa equipe pelo WhatsApp:\n\n'
  + '👉 https://wa.me/5571983024664\n\n'
  + 'Ao chamar, envie:\n'
  + '* Nome completo\n'
  + '* Data escolhida para pagamento';

const RECUSA_KEY = 'sp-admin-recusa-templates';
/** Chave antiga = parcelado (preserva edições já salvas); as demais têm chave própria. */
const APROVACAO_KEY_PARCELADO = 'sp-admin-aprovacao-template';
const APROVACAO_KEY_AVISTA = 'sp-admin-aprovacao-avista-template';
const APROVACAO_KEY_AVISTA_DE_PARCELADO = 'sp-admin-aprovacao-avista-de-parcelado-template';

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

const APROVACAO_CONFIG: Record<ModalidadeAprovacao, { key: string; padrao: string }> = {
  PARCELADO: { key: APROVACAO_KEY_PARCELADO, padrao: APROVACAO_PARCELADO_DEFAULT },
  AVISTA: { key: APROVACAO_KEY_AVISTA, padrao: APROVACAO_AVISTA_DEFAULT },
  AVISTA_DE_PARCELADO: { key: APROVACAO_KEY_AVISTA_DE_PARCELADO, padrao: APROVACAO_AVISTA_DE_PARCELADO_DEFAULT },
};

export function getAprovacaoTemplate(modalidade: ModalidadeAprovacao): string {
  const { key, padrao } = APROVACAO_CONFIG[modalidade];
  return localStorage.getItem(key) || padrao;
}

export function saveAprovacaoTemplate(modalidade: ModalidadeAprovacao, content: string) {
  localStorage.setItem(APROVACAO_CONFIG[modalidade].key, content);
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
