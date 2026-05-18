import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repartidorAPI, pedidosAPI } from '../../api/client';
import toast from 'react-hot-toast';

const ESTADOS = ['aceptado','preparando','listo','en_camino','entregado'];

export default function PedidoActivoPage() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await pedidosAPI.actualizarEstado(pedido.id, nuevo);
      setPedido({ ...pedido, estado: nuevo });
      toast.success(`Estado: ${nuevo}`);
    } catch (e) { toast.error('Error'); }
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

      <div className="panel-card">
        <h3>Detalle del Pedido</h3>
        <p><strong>Cliente:</strong> {pedido.user?.nombre || '—'}</p>
        <p><strong>Dirección:</strong> {pedido.direccion_texto}</p>
        <p><strong>Restaurante:</strong> {pedido.restaurante?.nombre}</p>
        <p><strong>Total:</strong> ${pedido.total?.toLocaleString()}</p>
        <p><strong>Tipo:</strong> {pedido.tipo_servicio}</p>
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
