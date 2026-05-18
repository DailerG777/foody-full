import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permiso, setPermiso] = useState('prompt');

  useEffect(() => {
    const lat = sessionStorage.getItem('foody_user_lat');
    const lng = sessionStorage.getItem('foody_user_lng');
    if (lat && lng) {
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermiso(result.state);
        result.addEventListener('change', () => setPermiso(result.state));
      });
    }
  }, []);

  const pedirUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(loc);
        setPermiso('granted');
        setLoading(false);
        sessionStorage.setItem('foody_user_lat', loc.lat);
        sessionStorage.setItem('foody_user_lng', loc.lng);
      },
      (err) => {
        const mensajes = { 1: 'Permiso denegado. Actívalo en la configuración del navegador.', 2: 'No se pudo obtener tu ubicación.', 3: 'Se agotó el tiempo.' };
        setError(mensajes[err.code] || 'Error de ubicación.');
        setPermiso('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, error, loading, permiso, pedirUbicacion };
}
