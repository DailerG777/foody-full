import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantesAPI, pedidosAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      restaurantesAPI.miPanel(),
      restaurantesAPI.stats(),
      restaurantesAPI.pedidos(),
    ]).then(([r, s, p]) => {
      setRestaurante(r.data);
      setStats(s.data);
      setPedidos(p.data?.pedidos || p.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
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
            {pedidosHoy.slice(0, 5).map(p => (
              <div key={p.id} className="pedido-mini-item">
                <span className={`estado-badge estado-${p.estado}`}>{p.estado}</span>
                <span>#{p.referencia}</span>
                <span>${p.total?.toLocaleString()}</span>
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
