import { useEffect, useRef } from 'react';
import { repartidorAPI } from '../api/client';

export function useGPS({ activo = false, pedidoId = null }) {
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const posicionRef = useRef(null);

  useEffect(() => {
    if (!activo || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        posicionRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    intervalRef.current = setInterval(async () => {
      if (posicionRef.current) {
        try {
          await repartidorAPI.actualizarUbicacion({
            lat: posicionRef.current.lat,
            lng: posicionRef.current.lng,
            pedido_id: pedidoId,
          });
        } catch {}
      }
    }, 10000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activo, pedidoId]);
}
