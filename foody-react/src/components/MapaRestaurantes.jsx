import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OCANA = [8.2340, -73.3563];

function createIcon(url, size) {
  return L.icon({
    iconUrl: url,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const userIcon = createIcon('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', 32);
const restIcon = L.divIcon({
  html: '<div style="background:#D21E0F;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">🍴</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function MapaRestaurantes({ restaurantes = [], userLocation = null, onRestauranteClick, height = '100%' }) {
  const [center, setCenter] = useState(OCANA);

  useEffect(() => {
    if (userLocation) setCenter([userLocation.lat, userLocation.lng]);
  }, [userLocation]);

  return (
    <MapContainer center={center} zoom={14} style={{ width: '100%', height }} scrollWheelZoom={true}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO'
      />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Tú estás aquí</Popup>
        </Marker>
      )}
      {restaurantes.map(rest => rest.lat && rest.lng && (
        <Marker key={rest.id} position={[parseFloat(rest.lat), parseFloat(rest.lng)]} icon={restIcon}>
          <Popup>
            <div style={{ fontFamily:'Outfit,sans-serif', minWidth:'160px' }}>
              <strong style={{ display:'block', fontSize:'14px', marginBottom:'4px' }}>{rest.nombre}</strong>
              <small style={{ color:'#666' }}>{rest.categoria}</small><br/>
              <small style={{ color:'#666' }}>⭐ {rest.rating} · {rest.tiempo_min}–{rest.tiempo_max} min</small><br/>
              <button
                onClick={() => onRestauranteClick?.(rest)}
                style={{ marginTop:'6px', background:'#D21E0F', border:'none', color:'#000', padding:'5px 12px', borderRadius:'20px', fontWeight:700, cursor:'pointer', fontSize:'13px', width:'100%' }}
              >
                Ver perfil →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
