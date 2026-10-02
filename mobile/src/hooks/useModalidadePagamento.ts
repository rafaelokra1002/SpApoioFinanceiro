import { useEffect, useState } from 'react';
import { fetchModalidadePagamento } from '../services/api';

/**
 * Forma de pagamento oferecida (à vista ou parcelado): decidida pelo admin, não
 * pelo cliente. Começa em 'VISTA' (reserva, caso o servidor esteja fora) e troca
 * pela configuração real do painel assim que ela chega.
 */
export function useModalidadePagamento(): 'VISTA' | 'PARCELADO' {
  const [modalidade, setModalidade] = useState<'VISTA' | 'PARCELADO'>('VISTA');

  useEffect(() => {
    let vivo = true;
    fetchModalidadePagamento()
      .then((valor) => { if (vivo) setModalidade(valor); })
      .catch(() => { /* mantém o padrão (à vista) */ });
    return () => { vivo = false; };
  }, []);

  return modalidade;
}
