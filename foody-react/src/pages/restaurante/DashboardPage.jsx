import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantesAPI, pedidosAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    Promise.all([
      restaurantesAPI.miPanel(),
      restaurantesAPI.stats(),
      restaurantesAPI.pedidos(),
    ]).then(([r, s, p]) => {
      setRestaurante(r.data);
      setStats(s.data);
      setPedidos(p.data?.pedidos || p.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const cambiarEstado = (pedidoId, estado) => {
    pedidosAPI.actualizarEstado(pedidoId, estado)
      .then(() => { toast.success(`Pedido ${estado}`); cargar(); })
      .catch(err => toast.error(err.response?.data?.message || 'Error'));
  };

  useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 15000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <div className="loading-screen">Cargando panel...</div>;

  const pedidosHoy = Array.isArray(pedidos) ? pedidos.filter(p => {
    const d = new Date(p.created_at); const h = new Date();
    return d.toDateString() === h.toDateString();
  }) : [];

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>{restaurante?.nombre || 'Panel'}</h1>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <span className={`tag ${restaurante?.abierto ? 'tag-open' : 'tag-closed'}`}>
            {restaurante?.abierto ? 'Abierto' : 'Cerrado'}
          </span>
          <button onClick={()=>{ logout(); navigate('/'); }} className="btn-ghost btn-sm" title="Cerrar sesión">🚪 Salir</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <span className="stat-value">{stats?.pedidos_hoy ?? pedidosHoy.length}</span>
          <span className="stat-label">Pedidos Hoy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">${(stats?.ventas_hoy ?? 0).toLocaleString()}</span>
          <span className="stat-label">Ventas Hoy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{restaurante?.rating ?? '0.0'}</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <span className="stat-value">{stats?.total_pedidos ?? pedidos.length}</span>
          <span className="stat-label">Total Pedidos</span>
        </div>
      </div>

      <div className="panel-grid-2">
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Pedidos Recientes</h3>
            <Link to="/restaurante/pedidos" className="btn-sm">Ver todos</Link>
          </div>
          <div className="pedidos-mini-list">
            {pedidosHoy.slice(0, 10).map(p => (
              <div key={p.id} className="pedido-mini-item">
                <div className="pedido-mini-info">
                  <span className={`estado-badge estado-${p.estado}`}>{p.estado}</span>
                  <span style={{fontWeight:600}}>#{p.referencia}</span>
                  <span style={{color:'#888'}}>${p.total?.toLocaleString()}</span>
                  <small style={{color:'#666'}}>{p.user?.nombre}</small>
                </div>
                {p.estado === 'pendiente' && (
                  <div className="pedido-mini-acciones">
                    <button className="btn-sm" style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontSize:'.75rem'}} onClick={()=>cambiarEstado(p.id,'aceptado')}>Aceptar</button>
                    <button className="btn-sm" style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontSize:'.75rem'}} onClick={()=>cambiarEstado(p.id,'cancelado')}>Cancelar</button>
                  </div>
                )}
                {p.estado === 'aceptado' && (
                  <button className="btn-sm" style={{background:'#f59e0b',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontSize:'.75rem'}} onClick={()=>cambiarEstado(p.id,'preparando')}>Preparar</button>
                )}
                {p.estado === 'preparando' && (
                  <button className="btn-sm" style={{background:'#3b82f6',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontSize:'.75rem'}} onClick={()=>cambiarEstado(p.id,'listo')}>Marcar listo</button>
                )}
              </div>
            ))}
            {pedidosHoy.length === 0 && <p className="empty-state">Sin pedidos hoy</p>}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Acciones Rápidas</h3>
          </div>
          <div className="quick-actions">
            <Link to="/restaurante/menu" className="quick-action-btn">📝 Menu</Link>
            <Link to="/restaurante/inventario" className="quick-action-btn">📦 Inventario</Link>
            <Link to="/restaurante/caja" className="quick-action-btn">💵 Caja</Link>
            <Link to="/restaurante/nomina" className="quick-action-btn">👥 Nómina</Link>
            <Link to="/restaurante/subcuentas" className="quick-action-btn">🔑 Subcuentas</Link>
            <Link to="/restaurante/perfil" className="quick-action-btn">⚙️ Perfil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
