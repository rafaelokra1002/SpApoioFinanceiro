import {
  ArrowLeft, ArrowRight, CalendarDays, Clock, CreditCard, Database, Diamond, FileCheck, FileText,
  Landmark, MessageCircle, Percent, UserRoundCheck, Users, type LucideIcon,
} from 'lucide-react';

// Tema escuro com dourado (mesma paleta das outras telas).
const BG = '#060c15';
const CARD = '#0b1422';
const LINE = '#2a3850';
const GOLD = '#e0b96f';
const MUTED = '#b3bdd0';

const FAQ: { icon: LucideIcon; q: string; a: string }[] = [
  { icon: Percent, q: 'Qual é a taxa de juros?', a: 'À vista: 30% em 30 dias.' },
  { icon: Landmark, q: 'Vocês são banco?', a: 'Não. Trabalhamos com análise própria.' },
  { icon: Clock, q: 'Em quanto tempo recebo o retorno?', a: 'Até 24h.' },
  { icon: MessageCircle, q: 'Por onde recebo o retorno?', a: 'Pelo WhatsApp informado.' },
  { icon: Diamond, q: 'Como o dinheiro é liberado?', a: 'Via Pix, após aprovação.' },
  { icon: UserRoundCheck, q: 'Posso solicitar com nome sujo?', a: 'Sim. Seu pedido passa por análise.' },
  { icon: Database, q: 'Tem valor mínimo para solicitar?', a: 'Não. Não tem valor mínimo.' },
  { icon: CreditCard, q: 'Tem opção parcelada?', a: 'Sim. Consulte a proposta.' },
  { icon: CalendarDays, q: 'Como funciona o pagamento?', a: 'Pagamento na data combinada.' },
  { icon: Users, q: 'Quem pode solicitar?', a: 'CLT, autônomo, informal e mais perfis.' },
  { icon: FileText, q: 'Preciso comprovar renda?', a: 'Depende do perfil e da análise.' },
  { icon: FileCheck, q: 'Quais documentos preciso enviar?', a: 'RG/CNH e comprovante; pode variar.' },
];

/**
 * Página "Como funciona": dúvidas rápidas. Abre por cima da Home (tela cheia) e fecha no "Voltar".
 * O botão de solicitar é do chamador, para passar pelo mesmo bloqueio de localização da Home.
 */
export function ComoFunciona({ onClose, onSolicitar }: { onClose: () => void; onSolicitar: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: BG, overflowY: 'auto', colorScheme: 'dark' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '18px 16px 8px' }}>
          <button onClick={onClose} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fff', fontWeight: 500, fontSize: 17,
          }}>
            <ArrowLeft size={22} strokeWidth={2.2} />
            Voltar
          </button>

          <h1 style={{
            margin: '18px 0 4px', fontSize: 'clamp(28px, 8vw, 36px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff',
          }}>
            Como funciona
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 18, color: MUTED }}>Tire suas dúvidas.</p>

          <h2 style={{
            margin: '0 0 14px', fontSize: 'clamp(24px, 6.6vw, 30px)', fontWeight: 800,
            letterSpacing: '-0.02em', color: '#fff',
          }}>
            Dúvidas rápidas
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map(({ icon: Icon, q, a }) => (
              <div key={q} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 12,
              }}>
                <span style={{ display: 'flex', width: 34, justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={30} color={GOLD} strokeWidth={1.8} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{q}</span>
                  <span style={{ display: 'block', marginTop: 2, fontSize: 15, color: MUTED, lineHeight: 1.35 }}>{a}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA fixo no rodapé */}
        <div style={{
          position: 'sticky', bottom: 0, padding: '14px 16px 18px',
          background: `linear-gradient(to top, ${BG} 72%, rgba(6,12,21,0))`,
        }}>
          <button onClick={onSolicitar} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '19px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(180deg, #e8c885 0%, #c9a05a 100%)',
            color: '#111827', fontWeight: 800, fontSize: 19,
          }}>
            Solicitar empréstimo
            <ArrowRight size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
