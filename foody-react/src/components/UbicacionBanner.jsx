import { useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

export default function UbicacionBanner({ onUbicacionObtenida }) {
  const { location, error, loading, permiso, pedirUbicacion } = useGeolocation();

  useEffect(() => {
    if (location) onUbicacionObtenida?.(location);
  }, [location]);

  if (permiso === 'granted' && location) return null;

  return (
    <div className="ubicacion-banner">
      <div className="ubicacion-banner-inner">
        <span className="ubicacion-icon">📍</span>
        <div className="ubicacion-texto">
          <strong>¿Estás en Ocaña?</strong>
          <p>Activa tu ubicación para ver los restaurantes más cercanos a ti.</p>
        </div>
        {permiso === 'denied' ? (
          <div className="ubicacion-denegada">
            <small>Permiso denegado. Actívalo en ajustes del navegador.</small>
          </div>
        ) : (
          <button className="btn-ubicacion" onClick={pedirUbicacion} disabled={loading}>
            {loading ? <span className="spinner" style={{width:14,height:14}}/> : '📍 Usar mi ubicación'}
          </button>
        )}
      </div>
      {error && <p className="ubicacion-error">{error}</p>}
    </div>
  );
}
