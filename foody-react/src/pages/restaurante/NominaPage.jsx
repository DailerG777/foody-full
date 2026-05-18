import { useState, useEffect } from 'react';
import { nominaAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function NominaPage() {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ empleado_nombre:'', empleado_cedula:'', cargo:'', tipo_contrato:'fijo', salario_base:0, bonificaciones:0, deducciones:0, periodo:new Date().toISOString().slice(0,7), sub_cuenta_id:'' });

  useEffect(() => { nominaAPI.listar().then(r => setNominas(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) { await nominaAPI.actualizar(editando, form); toast.success('Actualizado'); }
      else { await nominaAPI.crear(form); toast.success('Creado'); }
      setShowForm(false); setEditando(null);
      const r = await nominaAPI.listar(); setNominas(r.data);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const pagar = async (id) => {
    try { await nominaAPI.pagar(id); toast.success('Pagado'); const r = await nominaAPI.listar(); setNominas(r.data); }
    catch (e) { toast.error('Error'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar registro de nómina?')) return;
    try { await nominaAPI.eliminar(id); setNominas(nominas.filter(n=>n.id!==id)); toast.success('Eliminado'); }
    catch (e) { toast.error('Error'); }
  };

  const totalPendiente = nominas.filter(n=>!n.pagado).reduce((s,n)=>s+parseFloat(n.total||0),0);
  const totalPagado = nominas.filter(n=>n.pagado).reduce((s,n)=>s+parseFloat(n.total||0),0);

  if (loading) return <div className="loading-screen">Cargando nómina...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Nómina</h1>
        <button className="btn-auth" onClick={() => { setEditando(null); setForm({ empleado_nombre:'', empleado_cedula:'', cargo:'', tipo_contrato:'fijo', salario_base:0, bonificaciones:0, deducciones:0, periodo:new Date().toISOString().slice(0,7), sub_cuenta_id:'' }); setShowForm(true); }}>
          + Nuevo Registro
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">💰</span><span className="stat-value">${(totalPendiente).toLocaleString()}</span><span className="stat-label">Pendiente</span></div>
        <div className="stat-card"><span className="stat-icon">✅</span><span className="stat-value">${(totalPagado).toLocaleString()}</span><span className="stat-label">Pagado</span></div>
        <div className="stat-card"><span className="stat-icon">👥</span><span className="stat-value">{nominas.length}</span><span className="stat-label">Registros</span></div>
      </div>

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field"><label>Nombre</label><input value={form.empleado_nombre} onChange={e=>setForm({...form,empleado_nombre:e.target.value})} required /></div>
            <div className="field"><label>Cédula</label><input value={form.empleado_cedula} onChange={e=>setForm({...form,empleado_cedula:e.target.value})} /></div>
            <div className="field"><label>Cargo</label><input value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})} /></div>
            <div className="field"><label>Contrato</label>
              <select value={form.tipo_contrato} onChange={e=>setForm({...form,tipo_contrato:e.target.value})}>
                <option value="fijo">Fijo</option><option value="tiempo_completo">Tiempo Completo</option>
                <option value="medio_tiempo">Medio Tiempo</option><option value="por_horas">Por Horas</option><option value="destajo">Destajo</option>
              </select>
            </div>
            <div className="field"><label>Salario Base</label><input type="number" value={form.salario_base} onChange={e=>setForm({...form,salario_base:e.target.value})} required /></div>
            <div className="field"><label>Bonificaciones</label><input type="number" value={form.bonificaciones} onChange={e=>setForm({...form,bonificaciones:e.target.value})} /></div>
            <div className="field"><label>Deducciones</label><input type="number" value={form.deducciones} onChange={e=>setForm({...form,deducciones:e.target.value})} /></div>
            <div className="field"><label>Periodo</label><input type="month" value={form.periodo} onChange={e=>setForm({...form,periodo:e.target.value})} required /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-auth">{editando?'Actualizar':'Crear'}</button><button type="button" className="btn-ghost" onClick={()=>{setShowForm(false);setEditando(null);}}>Cancelar</button></div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="panel-table">
          <thead><tr><th>Empleado</th><th>Cargo</th><th>Contrato</th><th>Período</th><th>Base</th><th>Bonif.</th><th>Deduc.</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {nominas.map(n => (
              <tr key={n.id}>
                <td>{n.empleado_nombre}</td>
                <td>{n.cargo}</td>
                <td><span className="tag">{n.tipo_contrato?.replace(/_/g,' ')}</span></td>
                <td>{n.periodo}</td>
                <td>${(n.salario_base||0).toLocaleString()}</td>
                <td className="text-success">+${(n.bonificaciones||0).toLocaleString()}</td>
                <td className="text-danger">-${(n.deducciones||0).toLocaleString()}</td>
                <td><strong>${(n.total||0).toLocaleString()}</strong></td>
                <td>{n.pagado ? <span className="tag tag-open">Pagado</span> : <span className="tag tag-closed">Pendiente</span>}</td>
                <td className="table-actions">
                  {!n.pagado && <button className="btn-sm" onClick={() => pagar(n.id)}>✅</button>}
                  <button className="btn-sm" onClick={() => eliminar(n.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
