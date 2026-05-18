import { useState, useEffect } from 'react';
import { subcuentasAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function SubcuentasPage() {
  const [subcuentas, setSubcuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:'', email:'', password:'', telefono:'', rol:'mesero', pin:'' });

  useEffect(() => { subcuentasAPI.listar().then(r => setSubcuentas(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await subcuentasAPI.actualizar(editando, payload);
        toast.success('Actualizada');
      } else {
        await subcuentasAPI.crear(form);
        toast.success('Creada');
      }
      setShowForm(false); setEditando(null);
      setForm({ nombre:'', email:'', password:'', telefono:'', rol:'mesero', pin:'' });
      const r = await subcuentasAPI.listar(); setSubcuentas(r.data);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const toggleActivo = async (id) => {
    try { await subcuentasAPI.toggleActivo(id); setSubcuentas(subcuentas.map(s=>s.id===id?{...s,activo:!s.activo}:s)); }
    catch (e) { toast.error('Error'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar subcuenta?')) return;
    try { await subcuentasAPI.eliminar(id); setSubcuentas(subcuentas.filter(s=>s.id!==id)); toast.success('Eliminada'); }
    catch (e) { toast.error('Error'); }
  };

  const editar = (s) => { setEditando(s.id); setForm({ nombre:s.nombre, email:s.email, password:'', telefono:s.telefono||'', rol:s.rol, pin:s.pin||'' }); setShowForm(true); };

  if (loading) return <div className="loading-screen">Cargando subcuentas...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Subcuentas</h1>
        <button className="btn-auth" onClick={() => { setEditando(null); setForm({ nombre:'', email:'', password:'', telefono:'', rol:'mesero', pin:'' }); setShowForm(true); }}>
          + Nueva Subcuenta
        </button>
      </div>

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
            {!editando && <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required={!editando} /></div>}
            <div className="field"><label>Rol</label>
              <select value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
                <option value="mesero">Mesero</option><option value="cajero">Cajero</option>
                <option value="cocinero">Cocinero</option><option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} /></div>
            <div className="field"><label>PIN (4-6 dígitos)</label><input maxLength={6} value={form.pin} onChange={e=>setForm({...form,pin:e.target.value})} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-auth">{editando?'Actualizar':'Crear'}</button><button type="button" className="btn-ghost" onClick={()=>{setShowForm(false);setEditando(null);}}>Cancelar</button></div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="panel-table">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>PIN</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {subcuentas.map(s => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td className="text-muted">{s.email}</td>
                <td><span className="tag">{s.rol}</span></td>
                <td>{s.pin || '—'}</td>
                <td>{s.activo ? <span className="tag tag-open">Activo</span> : <span className="tag tag-closed">Inactivo</span>}</td>
                <td className="table-actions">
                  <button className="btn-sm" onClick={() => toggleActivo(s.id)}>{s.activo ? '🔴' : '🟢'}</button>
                  <button className="btn-sm" onClick={() => editar(s)}>✏️</button>
                  <button className="btn-sm" onClick={() => eliminar(s.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
