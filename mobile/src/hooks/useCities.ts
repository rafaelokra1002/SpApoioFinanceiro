import { useEffect, useState } from 'react';
import { City } from '../types';
import { CITIES } from '../constants/cities';
import { fetchCities } from '../services/api';

/**
 * Cidades atendidas. Começa pela lista fixa (para render imediato e como reserva
 * se o servidor estiver fora) e substitui pela lista do painel quando ela chega.
 */
export function useCities(): City[] {
  const [cities, setCities] = useState<City[]>(CITIES);

  useEffect(() => {
    let vivo = true;
    fetchCities()
      .then((data) => { if (vivo && data.length) setCities(data); })
      .catch(() => { /* mantém a lista fixa */ });
    return () => { vivo = false; };
  }, []);

  return cities;
}
