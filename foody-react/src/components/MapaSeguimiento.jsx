import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { repartidorAPI } from '../api/client';
import L from 'leaflet';
import { calcularDistancia } from '../utils/distancia';

const repartidorIcon = L.divIcon({
  html: '<div style="background:#D21E0F;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">🛵</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinoIcon = L.divIcon({
  html: '<div style="background:#ff6432;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏠</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function MapaSeguimiento({ pedidoId, clienteLat, clienteLng }) {
  const [repartidorPos, setRepartidorPos] = useState(null);

  useEffect(() => {
    const obtener = async () => {
      try {
        const { data } = await repartidorAPI.obtenerUbicacion(pedidoId);
        if (data.lat && data.lng) setRepartidorPos({ lat: data.lat, lng: data.lng });
      } catch {}
    };
    obtener();
    const interval = setInterval(obtener, 10000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  const center = repartidorPos || { lat: clienteLat, lng: clienteLng };
  const ruta = repartidorPos && clienteLat ? [[repartidorPos.lat, repartidorPos.lng], [clienteLat, clienteLng]] : [];

  return (
    <div style={{ height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a2a', marginTop: '12px' }}>
      <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM, CARTO' />
        {repartidorPos && (
          <Marker position={[repartidorPos.lat, repartidorPos.lng]} icon={repartidorIcon}>
          </Marker>
        )}
        <Marker position={[clienteLat, clienteLng]} icon={destinoIcon}>
        </Marker>
        {ruta.length === 2 && (
          <Polyline positions={ruta} pathOptions={{ color: '#D21E0F', weight: 3, opacity: 0.7 }} />
        )}
      </MapContainer>
    </div>
  );
}
