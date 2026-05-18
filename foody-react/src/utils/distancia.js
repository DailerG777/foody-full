export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function ordenarPorDistancia(restaurantes, userLocation) {
  if (!userLocation) return restaurantes;
  return restaurantes.map(r => ({
    ...r,
    distancia_km: r.lat && r.lng ? calcularDistancia(userLocation.lat, userLocation.lng, r.lat, r.lng) : 999,
  })).sort((a, b) => a.distancia_km - b.distancia_km);
}

export function formatearDistancia(km) {
  if (!km || km >= 999) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
