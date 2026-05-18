import { useState, useEffect, useRef } from 'react';
import { restaurantesAPI, productosAPI } from '../../api/client';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:'', descripcion:'', precio:'', emoji:'🍽️', menu_categoria_id:'', disponible:true });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fotoRef = useRef();

  useEffect(() => {
    restaurantesAPI.miPanel().then(r => {
      const rest = r.data.restaurante || r.data;
      setProductos(rest.productos || []);
      setCategorias(rest.categorias || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (fotoFile) fd.append('foto', fotoFile);
      if (editando) {
        fd.append('_method', 'PUT');
        await api.post(`/restaurante/productos/${editando}`, fd);
        toast.success('Producto actualizado');
      } else {
        await api.post('/restaurante/productos', fd);
        toast.success('Producto creado');
      }
      setShowForm(false); setEditando(null);
      setForm({ nombre:'', descripcion:'', precio:'', emoji:'🍽️', menu_categoria_id:'', disponible:true });
      setFotoFile(null); setFotoPreview(null);
      const r = await restaurantesAPI.miPanel();
      setProductos((r.data.restaurante || r.data).productos || []);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const editar = (p) => {
    setEditando(p.id); setForm(p); setShowForm(true);
    setFotoFile(null); setFotoPreview(null);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    try { await productosAPI.eliminar(id); toast.success('Eliminado'); setProductos(productos.filter(p=>p.id!==id)); }
    catch (e) { toast.error('Error'); }
  };

  const toggleDisponible = async (id) => {
    try {
      await productosAPI.toggleDisponible(id);
      setProductos(productos.map(p=>p.id===id?{...p,disponible:!p.disponible}:p));
    } catch (e) { toast.error('Error'); }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
  };

  if (loading) return <div className="loading-screen">Cargando menú...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Menú</h1>
        <button className="btn-auth" onClick={() => {
          setEditando(null); setFotoFile(null); setFotoPreview(null);
          setForm({ nombre:'', descripcion:'', precio:'', emoji:'🍽️', menu_categoria_id:categorias[0]?.id||'', disponible:true });
          setShowForm(true);
        }}>
          + Nuevo Producto
        </button>
      </div>

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div className="field"><label>Precio</label><input type="number" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} required /></div>
            <div className="field"><label>Categoría</label>
              <select value={form.menu_categoria_id} onChange={e=>setForm({...form,menu_categoria_id:e.target.value})} required>
                {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="field"><label>Emoji</label><input value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} /></div>
            <div className="field full-width"><label>Descripción</label><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></div>
            <div className="field full-width">
              <label>Foto del producto</label>
              <div className="file-upload-wrapper">
                <input type="file" ref={fotoRef} accept="image/*" onChange={handleFotoChange} style={{display:'none'}} />
                <button type="button" className="btn-ghost" onClick={()=>fotoRef.current.click()}>
                  {fotoFile ? 'Cambiar foto' : (editando && form.foto_url ? 'Cambiar foto' : 'Subir foto')}
                </button>
                {fotoFile && <span className="file-name">{fotoFile.name}</span>}
              </div>
              {(fotoPreview || (editando && form.foto_url)) && (
                <img src={fotoPreview || form.foto_url} alt="Preview" className="img-preview" style={{marginTop:'8px',maxWidth:'150px',borderRadius:'8px'}} />
              )}
            </div>
          </div>
          <div className="form-actions"><button type="submit" className="btn-auth">{editando?'Actualizar':'Crear'}</button><button type="button" className="btn-ghost" onClick={()=>{setShowForm(false);setEditando(null);setFotoFile(null);setFotoPreview(null);}}>Cancelar</button></div>
        </form>
      )}

      {categorias.map(cat => (
        <div key={cat.id} className="panel-card">
          <h3>{cat.nombre}</h3>
          <div className="productos-list">
            {productos.filter(p=>p.menu_categoria_id===cat.id).map(p => (
              <div key={p.id} className={`producto-item ${!p.disponible?'prod-agotado':''}`}>
                <div className="prod-img-emoji">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nombre} className="prod-thumb" />
                  ) : (
                    <span className="prod-emoji">{p.emoji||'🍽️'}</span>
                  )}
                </div>
                <div className="prod-info">
                  <span className="prod-nombre">{p.nombre}</span>
                  <span className="prod-precio">${p.precio?.toLocaleString()}</span>
                </div>
                <div className="prod-actions">
                  <button className={`btn-sm ${p.disponible?'btn-open':'btn-closed'}`} onClick={()=>toggleDisponible(p.id)}>
                    {p.disponible?'Disponible':'Agotado'}
                  </button>
                  <button className="btn-sm" onClick={()=>editar(p)}>✏️</button>
                  <button className="btn-sm" onClick={()=>eliminar(p.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}