/** Dispatch mínimo aceito por este módulo (compatível com o do LoanContext). */
type SetField = (action: { type: 'SET_FIELD'; field: string; value: unknown }) => void;

/** Converte coordenadas em endereço legível + CEP (OpenStreetMap, sem chave). */
async function reverseGeocode(lat: number, lon: number): Promise<{ endereco: string; cep: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=pt-BR`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    const a = data.address || {};
    const linha1 = [a.road, a.house_number].filter(Boolean).join(', ');
    const bairro = a.suburb || a.neighbourhood || a.city_district || '';
    const cidade = a.city || a.town || a.village || a.municipality || '';
    const cidadeUf = [cidade, a.state].filter(Boolean).join(' - ');
    const endereco = [linha1, bairro, cidadeUf].filter(Boolean).join(', ') || data.display_name || '';
    return { endereco, cep: a.postcode || '' };
  } catch {
    return { endereco: '', cep: '' };
  }
}

/**
 * Pede a localização e grava o resultado no estado (`geo`).
 * A permissão é obrigatória: sem ela o cliente não avança na solicitação.
 */
export function requestLocation(dispatch: SetField) {
  if (!('geolocation' in navigator)) {
    dispatch({ type: 'SET_FIELD', field: 'geo', value: 'denied' });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      dispatch({ type: 'SET_FIELD', field: 'latitude', value: latitude });
      dispatch({ type: 'SET_FIELD', field: 'longitude', value: longitude });
      dispatch({ type: 'SET_FIELD', field: 'geo', value: 'granted' });

      const { endereco, cep } = await reverseGeocode(latitude, longitude);
      if (endereco) dispatch({ type: 'SET_FIELD', field: 'endereco', value: endereco });
      if (cep) dispatch({ type: 'SET_FIELD', field: 'cep', value: cep });
    },
    () => dispatch({ type: 'SET_FIELD', field: 'geo', value: 'denied' }),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
}
