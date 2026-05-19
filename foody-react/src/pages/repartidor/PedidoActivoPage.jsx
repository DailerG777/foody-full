import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { repartidorAPI, pedidosAPI } from '../../api/client';
import toast from 'react-hot-toast';
import L from 'leaflet';

const ESTADOS = ['aceptado','preparando','listo','en_camino','entregado'];

const restIcon = L.divIcon({
  html: '<div style="background:#D21E0F;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">🍴</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
});
const destinoIcon = L.divIcon({
  html: '<div style="background:#ff6432;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏠</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
});

export default function PedidoActivoPage() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codigoInput, setCodigoInput] = useState('');

  useEffect(() => {
    repartidorAPI.pedidosDisponibles().then(r => {
      const pedidos = r.data.pedidos || r.data || [];
      const activo = pedidos.find(p => p.estado !== 'entregado' && p.estado !== 'cancelado' && p.repartidor_id);
      if (activo) setPedido(activo);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avanzarEstado = async () => {
    if (!pedido) return;
    const idx = ESTADOS.indexOf(pedido.estado);
    if (idx < 0 || idx >= ESTADOS.length - 1) return;
    const nuevo = ESTADOS[idx + 1];
    const payload = { estado: nuevo };
    if (nuevo === 'entregado') {
      if (!codigoInput) { toast.error('Ingresa el código de entrega'); return; }
      payload.codigo_entrega = codigoInput;
    }
    try {
      await pedidosAPI.actualizarEstado(pedido.id, payload);
      setPedido({ ...pedido, estado: nuevo });
      toast.success(`Estado: ${nuevo}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;

  if (!pedido) return (
    <div className="panel-layout">
      <div className="panel-header"><h1>Pedido Activo</h1></div>
      <div className="empty-state">
        <p>No tienes un pedido activo</p>
        <Link to="/repartidor/disponibles" className="btn-auth">Ver disponibles</Link>
      </div>
    </div>
  );

  const idx = ESTADOS.indexOf(pedido.estado);
  const tieneMapa = pedido.direccion_lat && pedido.direccion_lng && pedido.restaurante?.lat && pedido.restaurante?.lng;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Pedido #{pedido.referencia}</h1>
        <span className={`tag ${pedido.estado === 'entregado' ? 'tag-open' : 'tag-closed'}`}>{pedido.estado}</span>
      </div>

      <div className="progress-bar-container">
        {ESTADOS.map((e, i) => (
          <div key={e} className={`progress-step ${i <= idx ? 'active' : ''}`}>
            <div className="step-dot">{i <= idx ? '✓' : i + 1}</div>
            <span className="step-label">{e.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      {tieneMapa && (
        <div style={{ height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a', marginBottom: '12px' }}>
          <MapContainer center={[parseFloat(pedido.restaurante.lat), parseFloat(pedido.restaurante.lng)]} zoom={14} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM, CARTO' />
            <Marker position={[parseFloat(pedido.restaurante.lat), parseFloat(pedido.restaurante.lng)]} icon={restIcon} />
            <Marker position={[parseFloat(pedido.direccion_lat), parseFloat(pedido.direccion_lng)]} icon={destinoIcon} />
            <Polyline positions={[[parseFloat(pedido.restaurante.lat), parseFloat(pedido.restaurante.lng)], [parseFloat(pedido.direccion_lat), parseFloat(pedido.direccion_lng)]]} pathOptions={{ color: '#D21E0F', weight: 3, opacity: 0.7 }} />
          </MapContainer>
        </div>
      )}

      <div className="panel-card">
        <h3>Detalle del Pedido</h3>
        <p><strong>Cliente:</strong> {pedido.user?.nombre || '—'}</p>
        <p><strong>Dirección:</strong> {pedido.direccion_texto}</p>
        <p><strong>Restaurante:</strong> {pedido.restaurante?.nombre}</p>
        <p><strong>Total:</strong> ${pedido.total?.toLocaleString()}</p>
        {pedido.paga_con > 0 && <p><strong>Paga con:</strong> ${pedido.paga_con?.toLocaleString()} <span style={{color:'#22c55e'}}>(cambio: ${(pedido.paga_con - pedido.total)?.toLocaleString()})</span></p>}
        {pedido.nota && <p><strong>Nota:</strong> {pedido.nota}</p>}
      </div>

      <div className="panel-card">
        <h3>Items</h3>
        {pedido.items?.map(item => (
          <div key={item.id} className="pedido-item-row">
            <span>{item.cantidad}x</span>
            <span>{item.nombre_snapshot}</span>
            <span>${(item.precio_snapshot * item.cantidad)?.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {ESTADOS[idx + 1] === 'entregado' && pedido.codigo_entrega && (
        <div className="panel-card" style={{border:'2px dashed #f59e0b'}}>
          <h3 style={{color:'#f59e0b'}}>🔑 Código de entrega</h3>
          <p style={{fontSize:'.85rem',color:'#888',marginBottom:'8px'}}>Pídele al cliente el código para confirmar la entrega</p>
          <input
            type="text"
            maxLength={6}
            value={codigoInput}
            onChange={e => setCodigoInput(e.target.value.toUpperCase())}
            placeholder="Ej: 482731"
            style={{background:'#1e1e1e',border:'1px solid #333',borderRadius:'10px',padding:'12px',width:'100%',color:'#fff',textAlign:'center',fontSize:'1.4rem',letterSpacing:'8px'}}
          />
        </div>
      )}
      {ESTADOS[idx + 1] === 'entregado' && !pedido.codigo_entrega && (
        <div className="panel-card" style={{border:'2px dashed #888'}}>
          <p style={{fontSize:'.85rem',color:'#888',textAlign:'center'}}>⚠️ Este pedido no tiene código de entrega. Puedes marcarlo como entregado sin código.</p>
        </div>
      )}

      {idx < ESTADOS.length - 1 && (
        <button className="btn-auth" onClick={avanzarEstado} style={{ width: '100%', marginTop: '1rem' }}>
          Avanzar a "{ESTADOS[idx + 1].replace(/_/g, ' ')}"
        </button>
      )}

      <Link to="/repartidor/chat" className="btn-ghost" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
        💬 Chat con el cliente
      </Link>
    </div>
  );
}
