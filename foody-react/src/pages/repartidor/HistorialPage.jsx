import { useState, useEffect } from 'react';
import { repartidorAPI, pedidosAPI } from '../../api/client';

export default function HistorialPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    pedidosAPI.misPedidos({ role: 'repartidor' }).then(r => {
      setPedidos(r.data?.data || r.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtrados = pedidos.filter(p => {
    if (filtro === 'hoy') return new Date(p.created_at).toDateString() === new Date().toDateString();
    if (filtro === 'semana') {
      const semana = new Date(); semana.setDate(semana.getDate() - 7);
      return new Date(p.created_at) >= semana;
    }
    return true;
  });

  const ganancias = filtrados.reduce((s, p) => s + (p.estado === 'entregado' ? 4200 : 0), 0);

  if (loading) return <div className="loading-screen">Cargando historial...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Historial</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">📦</span><span className="stat-value">{filtrados.length}</span><span className="stat-label">Pedidos</span></div>
        <div className="stat-card"><span className="stat-icon">💰</span><span className="stat-value">${ganancias.toLocaleString()}</span><span className="stat-label">Ganancias</span></div>
        <div className="stat-card"><span className="stat-icon">✅</span><span className="stat-value">{filtrados.filter(p=>p.estado==='entregado').length}</span><span className="stat-label">Entregados</span></div>
      </div>

      <div className="periodo-selector">
        {['todos','hoy','semana'].map(f => (
          <button key={f} className={`btn-sm ${filtro===f?'btn-active':''}`} onClick={() => setFiltro(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="panel-table">
          <thead><tr><th>Ref</th><th>Restaurante</th><th>Fecha</th><th>Total</th><th>Ganancia</th><th>Estado</th></tr></thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id}>
                <td>#{p.referencia}</td>
                <td>{p.restaurante?.nombre || '—'}</td>
                <td className="text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                <td>${p.total?.toLocaleString()}</td>
                <td className="text-success">${p.estado === 'entregado' ? '4,200' : '0'}</td>
                <td><span className={`tag estado-${p.estado}`}>{p.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
