/** Link do WhatsApp com a mensagem pronta para o número do cliente. */
export function whatsappLink(telefone: string, texto: string): string {
  const digits = (telefone || '').replace(/\D/g, '');
  // Números salvos sem DDI (10 ou 11 dígitos) recebem o 55 do Brasil.
  const numero = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** Abre a conversa do cliente no WhatsApp, em outra aba. */
export function abrirWhatsApp(telefone: string, texto: string) {
  window.open(whatsappLink(telefone, texto), '_blank', 'noopener');
}
