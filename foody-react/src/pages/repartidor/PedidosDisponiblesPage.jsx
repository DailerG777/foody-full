import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { repartidorAPI } from '../../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';

export default function PedidosDisponiblesPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tomando, setTomando] = useState(null);
  const [timers, setTimers] = useState({});

  const cargar = useCallback(async () => {
    try {
      const r = await repartidorAPI.pedidosDisponibles();
      setPedidos((r.data.pedidos || r.data)?.filter(p => !p.repartidor_id) || []);
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); const iv = setInterval(cargar, 15000); return () => clearInterval(iv); }, [cargar]);

  const tomarPedido = async (id) => {
    setTomando(id);
    toast.success('Buscando pedido...');
    try {
      await repartidorAPI.tomarPedido(id);
      toast.success('Pedido tomado!');
      navigate('/repartidor/activo');
    } catch (e) {
      toast.error(e.response?.data?.message || 'No disponible');
    } finally { setTomando(null); }
  };

  if (loading) return <div className="loading-screen">Buscando pedidos...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Pedidos Disponibles</h1>
        <button className="btn-sm" onClick={cargar}>🔄 Actualizar</button>
      </div>

      <div className="panel-grid-2">
        <div className="pedidos-disponibles-list">
          {pedidos.length === 0 ? (
            <div className="empty-state">No hay pedidos disponibles ahora</div>
          ) : (
            pedidos.map(p => (
              <div key={p.id} className="pedido-card">
                <div className="pedido-card-header">
                  <span className="tag tag-open">{p.tipo_servicio}</span>
                  <span className="text-muted">#{p.referencia}</span>
                </div>
                <div className="pedido-card-body">
                  <p><strong>{p.restaurante?.nombre}</strong></p>
                  <p className="text-muted">{p.direccion_texto}</p>
                  <div className="pedido-card-meta">
                    <span>💰 ${p.total?.toLocaleString()}</span>
                    <span>📦 {p.items?.length || 0} items</span>
                  </div>
                </div>
                <button className="btn-auth" onClick={() => tomarPedido(p.id)} disabled={tomando === p.id}>
                  {tomando === p.id ? 'Tomando...' : 'Tomar Pedido'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mapa-small">
          {pedidos.length > 0 && (
            <MapContainer center={[8.2342, -73.3561]} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {pedidos.map(p => p.restaurante?.lat && p.restaurante?.lng && (
                <Marker key={p.id} position={[p.restaurante.lat, p.restaurante.lng]}>
                  <Popup>{p.restaurante.nombre}<br />${p.total?.toLocaleString()}</Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
