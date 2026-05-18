import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantesAPI } from '../../api/client';
import { useGeolocation } from '../../hooks/useGeolocation';
import MapaRestaurantes from '../../components/MapaRestaurantes';

export default function MapaPage() {
  const navigate = useNavigate();
  const { location, pedirUbicacion, permiso } = useGeolocation();

  const { data } = useQuery({
    queryKey: ['restaurantes-mapa'],
    queryFn: () => restaurantesAPI.listar().then(r => r.data),
  });

  const restaurantes = data?.data || [];

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="brand">
          <img src="/assets/logo-foody.png" alt="Foody" className="brand-logo"/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button className="btn-ghost btn-sm" onClick={() => navigate('/')}>← Lista</button>
          {permiso !== 'granted' && (
            <button className="btn-ubicacion" onClick={pedirUbicacion}>📍 Ubicación</button>
          )}
        </div>
      </header>

      <div style={{ position: 'fixed', top: '68px', left: 0, right: 0, bottom: 0 }}>
        <MapaRestaurantes
          restaurantes={restaurantes}
          userLocation={location}
          onRestauranteClick={(rest) => navigate(`/restaurante/${rest.slug}`)}
        />
      </div>
    </div>
  );
}
