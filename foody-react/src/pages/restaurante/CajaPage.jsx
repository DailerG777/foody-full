import { useState, useEffect } from 'react';
import { cajaAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function CajaPage() {
  const [data, setData] = useState({ movimientos:[], ingresos:0, egresos:0, balance:0, ventas_total:0, pedidos:0 });
  const [periodo, setPeriodo] = useState('hoy');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo:'ingreso', categoria:'venta', concepto:'', monto:'', referencia:'', nota:'' });

  const tipos = ['venta','domicilio','compra_insumo','nomina','servicio','mantenimiento','otro'];

  useEffect(() => { cargarDatos(); }, [periodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try { const r = await cajaAPI.listar({ periodo }); setData(r.data); }
    catch (e) {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await cajaAPI.crear(form); toast.success('Movimiento registrado'); setShowForm(false); setForm({ tipo:'ingreso', categoria:'venta', concepto:'', monto:'', referencia:'', nota:'' }); cargarDatos(); }
    catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar movimiento?')) return;
    try { await cajaAPI.eliminar(id); toast.success('Eliminado'); cargarDatos(); }
    catch (e) { toast.error('Error'); }
  };

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Caja</h1>
        <button className="btn-auth" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cerrar' : '+ Nuevo Movimiento'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">📈</span><span className="stat-value text-success">${(data.ingresos||0).toLocaleString()}</span><span className="stat-label">Ingresos</span></div>
        <div className="stat-card"><span className="stat-icon">📉</span><span className="stat-value text-danger">${(data.egresos||0).toLocaleString()}</span><span className="stat-label">Egresos</span></div>
        <div className="stat-card"><span className="stat-icon">⚖️</span><span className={`stat-value ${(data.balance||0)>=0?'text-success':'text-danger'}`}>${(data.balance||0).toLocaleString()}</span><span className="stat-label">Balance</span></div>
        <div className="stat-card"><span className="stat-icon">🛵</span><span className="stat-value">${(data.ventas_total||0).toLocaleString()}</span><span className="stat-label">Ventas ({data.pedidos})</span></div>
      </div>

      <div className="periodo-selector">
        {['hoy','semana','quincena','mes'].map(p => (
          <button key={p} className={`btn-sm ${periodo===p?'btn-active':''}`} onClick={() => setPeriodo(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field"><label>Tipo</label>
              <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <div className="field"><label>Categoría</label>
              <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
                {tipos.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="field full-width"><label>Concepto</label><input value={form.concepto} onChange={e=>setForm({...form,concepto:e.target.value})} required /></div>
            <div className="field"><label>Monto</label><input type="number" value={form.monto} onChange={e=>setForm({...form,monto:e.target.value})} required /></div>
            <div className="field"><label>Referencia</label><input value={form.referencia} onChange={e=>setForm({...form,referencia:e.target.value})} /></div>
            <div className="field full-width"><label>Nota</label><textarea value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-auth">Registrar</button></div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="panel-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Concepto</th><th>Monto</th><th>Registró</th><th></th></tr></thead>
          <tbody>
            {data.movimientos?.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td><span className={`tag ${m.tipo==='ingreso'?'tag-open':'tag-closed'}`}>{m.tipo}</span></td>
                <td>{m.categoria?.replace(/_/g,' ')}</td>
                <td>{m.concepto}</td>
                <td className={m.tipo==='ingreso'?'text-success':'text-danger'}>${(m.monto||0).toLocaleString()}</td>
                <td className="text-muted">{m.user?.nombre}</td>
                <td><button className="btn-sm" onClick={() => eliminar(m.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
