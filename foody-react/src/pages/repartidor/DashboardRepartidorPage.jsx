import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { repartidorAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardRepartidorPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pedidos_hoy:0, ganancias_hoy:0, pedidos_total:0 });
  const [enLinea, setEnLinea] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([repartidorAPI.stats()]).then(([s]) => {
      setStats(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleLinea = async () => {
    try {
      await repartidorAPI.toggleDisponibilidad({ en_linea: !enLinea });
      setEnLinea(!enLinea);
      toast.success(enLinea ? 'Desconectado' : 'En línea');
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return <div className="loading-screen">Cargando panel...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Panel Repartidor</h1>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button className={`btn-auth ${enLinea ? '' : 'btn-closed'}`} onClick={toggleLinea} style={{padding:'6px 14px',fontSize:'.8rem'}}>
            {enLinea ? '🟢 En Línea' : '🔴 Desconectado'}
          </button>
          <button onClick={()=>{ logout(); navigate('/'); }} className="btn-ghost btn-sm" title="Cerrar sesión">🚪 Salir</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🛵</span>
          <span className="stat-value">{stats.pedidos_hoy}</span>
          <span className="stat-label">Pedidos Hoy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">${(stats.ganancias_hoy || 0).toLocaleString()}</span>
          <span className="stat-label">Ganancias Hoy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <span className="stat-value">{stats.pedidos_total}</span>
          <span className="stat-label">Total Entregados</span>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/repartidor/disponibles" className="quick-action-btn">📋 Ver Pedidos Disponibles</Link>
        <Link to="/repartidor/activo" className="quick-action-btn">🚚 Pedido Activo</Link>
        <Link to="/repartidor/historial" className="quick-action-btn">📊 Historial</Link>
        <Link to="/repartidor/chat" className="quick-action-btn">💬 Chat</Link>
      </div>
    </div>
  );
}
