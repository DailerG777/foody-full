import { useState, useEffect } from 'react';
import { inventarioAPI, restaurantesAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function InventarioPage() {
  const [items, setItems] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [showMov, setShowMov] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({ nombre:'', categoria:'', unidad:'unidad', stock:0, stock_minimo:0, costo_unitario:0, producto_id:'' });
  const [movForm, setMovForm] = useState({ tipo:'entrada', cantidad:1, motivo:'' });

  const categorias = ['Carnes','Verduras','Lácteos','Bebidas','Despensa','Limpieza','Otro'];

  useEffect(() => {
    Promise.all([inventarioAPI.listar(), inventarioAPI.alertas(), restaurantesAPI.miPanel()])
      .then(([r, a, m]) => { setItems(r.data); setAlertas(a.data); setProductos((m.data.restaurante || m.data).productos || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) { await inventarioAPI.actualizar(editando, form); toast.success('Actualizado'); }
      else { await inventarioAPI.crear(form); toast.success('Creado'); }
      setShowForm(false); setEditando(null);
      setForm({ nombre:'', categoria:'', unidad:'unidad', stock:0, stock_minimo:0, costo_unitario:0, producto_id:'' });
      const r = await inventarioAPI.listar(); setItems(r.data);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar item?')) return;
    try { await inventarioAPI.eliminar(id); setItems(items.filter(i=>i.id!==id)); toast.success('Eliminado'); }
    catch (e) { toast.error('Error'); }
  };

  const verMovimientos = async (id) => {
    try {
      const r = await inventarioAPI.movimientos(id);
      setMovimientos(r.data); setShowMov(id);
    } catch (e) { toast.error('Error'); }
  };

  const registrarMovimiento = async (e) => {
    e.preventDefault();
    try {
      await inventarioAPI.registrarMovimiento(showMov, movForm);
      toast.success('Movimiento registrado');
      setMovForm({ tipo:'entrada', cantidad:1, motivo:'' });
      verMovimientos(showMov);
      const r = await inventarioAPI.listar(); setItems(r.data);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  if (loading) return <div className="loading-screen">Cargando inventario...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Inventario</h1>
        <button className="btn-auth" onClick={() => { setEditando(null); setForm({ nombre:'', categoria:'', unidad:'unidad', stock:0, stock_minimo:0, costo_unitario:0, producto_id:'' }); setShowForm(true); }}>
          + Nuevo Item
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="alertas-banner">
          <span>⚠️ {alertas.length} item(s) con stock bajo</span>
        </div>
      )}

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div className="field"><label>Categoría</label>
              <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
                <option value="">Seleccionar</option>
                {categorias.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Unidad</label>
              <select value={form.unidad} onChange={e=>setForm({...form,unidad:e.target.value})}>
                <option value="unidad">Unidad</option>
                <option value="kg">Kg</option>
                <option value="litro">Litro</option>
                <option value="paquete">Paquete</option>
              </select>
            </div>
            <div className="field"><label>Stock</label><input type="number" step="0.01" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required /></div>
            <div className="field"><label>Stock Mínimo</label><input type="number" step="0.01" value={form.stock_minimo} onChange={e=>setForm({...form,stock_minimo:e.target.value})} required /></div>
            <div className="field"><label>Costo Unitario</label><input type="number" step="100" value={form.costo_unitario} onChange={e=>setForm({...form,costo_unitario:e.target.value})} required /></div>
            <div className="field"><label>Producto vinculado</label>
              <select value={form.producto_id} onChange={e=>setForm({...form,producto_id:e.target.value})}>
                <option value="">— Sin vínculo —</option>
                {productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-auth">{editando?'Actualizar':'Crear'}</button><button type="button" className="btn-ghost" onClick={()=>{setShowForm(false);setEditando(null);}}>Cancelar</button></div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="panel-table">
          <thead><tr><th>Nombre</th><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Stock</th><th>Min</th><th>Costo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className={i.stock <= i.stock_minimo ? 'row-alerta' : ''}>
                <td>{i.nombre}</td>
                <td>{i.producto?.nombre ? <span className="tag">{i.producto.nombre}</span> : '—'}</td>
                <td><span className="tag">{i.categoria}</span></td>
                <td>{i.unidad}</td>
                <td className={i.stock <= i.stock_minimo ? 'text-danger' : ''}>{i.stock}</td>
                <td>{i.stock_minimo}</td>
                <td>${(i.costo_unitario||0).toLocaleString()}</td>
                <td>{i.stock <= i.stock_minimo ? <span className="tag tag-closed">⚠️ Bajo</span> : <span className="tag tag-open">OK</span>}</td>
                <td className="table-actions">
                  <button className="btn-sm" onClick={() => { setEditando(i.id); setForm(i); setShowForm(true); }}>✏️</button>
                  <button className="btn-sm" onClick={() => verMovimientos(i.id)}>📋</button>
                  <button className="btn-sm" onClick={() => eliminar(i.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMov && (
        <div className="modal-overlay" onClick={() => setShowMov(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMov(null)}>✕</button>
            <h3>Movimientos</h3>
            <form onSubmit={registrarMovimiento} className="mov-form-inline">
              <select value={movForm.tipo} onChange={e=>setMovForm({...movForm,tipo:e.target.value})}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
                <option value="merma">Merma</option>
              </select>
              <input type="number" step="0.01" value={movForm.cantidad} onChange={e=>setMovForm({...movForm,cantidad:e.target.value})} required />
              <input placeholder="Motivo" value={movForm.motivo} onChange={e=>setMovForm({...movForm,motivo:e.target.value})} />
              <button type="submit" className="btn-auth btn-sm">Registrar</button>
            </form>
            <div className="movimientos-list">
              {movimientos.map(m => (
                <div key={m.id} className="mov-item">
                  <span className={`tag ${m.tipo==='entrada'?'tag-open':'tag-closed'}`}>{m.tipo}</span>
                  <span>{m.cantidad}</span>
                  <span className="text-muted">{m.motivo}</span>
                  <span className="text-muted">{m.user?.nombre} {m.user?.apellido}</span>
                  <span className="text-muted">{new Date(m.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
