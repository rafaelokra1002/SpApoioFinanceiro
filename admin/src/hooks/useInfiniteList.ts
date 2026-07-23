import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Rolagem infinita no lugar de paginação: mostra um bloco e vai carregando mais
 * conforme o usuário rola até o fim, sem renderizar centenas de itens de uma vez.
 */
export default function useInfiniteList<T>(items: T[], step = 12) {
  const [count, setCount] = useState(step);
  const observer = useRef<IntersectionObserver | null>(null);

  // Volta ao topo da contagem quando a lista muda (busca, filtro, novos dados).
  useEffect(() => { setCount(step); }, [items, step]);

  useEffect(() => () => observer.current?.disconnect(), []);

  // Recriado a cada bloco carregado para que o observer volte a disparar
  // enquanto a marca continuar visível.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    observer.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCount((c) => c + step); },
      { rootMargin: '240px' },
    );
    observer.current.observe(node);
  }, [step, count]);

  return { shown: items.slice(0, count), hasMore: count < items.length, sentinelRef };
}
