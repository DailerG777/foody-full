import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

const pinIcon = L.divIcon({
  html: '<div style="background:#ff6432;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">📍</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapaClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function SelectorDireccion({ onChange }) {
  const [pinPos, setPinPos] = useState({ lat: 8.2340, lng: -73.3563 });
  const [direccionTexto, setDireccionTexto] = useState('');

  const handleMapClick = ({ lat, lng }) => {
    setPinPos({ lat, lng });
    setDireccionTexto(`${lat.toFixed(4)}, ${lng.toFixed(4)} — Ocaña, NS`);
    onChange?.({ lat, lng, texto: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  };

  return (
    <div className="selector-direccion">
      <p style={{ fontSize: '.82rem', color: '#888', marginBottom: '8px' }}>
        📍 Haz clic en el mapa para marcar tu dirección de entrega
      </p>
      <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #2a2a2a' }}>
        <MapContainer center={[pinPos.lat, pinPos.lng]} zoom={16} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM, CARTO' />
          <MapaClickHandler onClick={handleMapClick} />
          <Marker position={[pinPos.lat, pinPos.lng]} icon={pinIcon} />
        </MapContainer>
      </div>
      {direccionTexto && (
        <div style={{ background: 'var(--gris-card)', border: '1px solid var(--turquesa)', borderRadius: '10px', padding: '10px 14px', fontSize: '.85rem' }}>
          📍 {direccionTexto}
        </div>
      )}
    </div>
  );
}
