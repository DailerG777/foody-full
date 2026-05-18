import { useState, useEffect, useRef } from 'react';
import { restaurantesAPI } from '../../api/client';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre:'', descripcion:'', categoria:'', telefono:'', whatsapp:'', direccion:'', pedido_minimo:'', tiempo_min:'', tiempo_max:'', envio_gratis:false, envio_gratis_desde:'' });
  const [portadaFile, setPortadaFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [menuPdfFile, setMenuPdfFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const portadaRef = useRef();
  const logoRef = useRef();
  const menuPdfRef = useRef();

  useEffect(() => {
    restaurantesAPI.miPanel().then(r => {
      const rest = r.data.restaurante || r.data;
      setRestaurante(rest);
      setForm({
        nombre: rest.nombre || '',
        descripcion: rest.descripcion || '',
        categoria: rest.categoria || '',
        telefono: rest.telefono || '',
        whatsapp: rest.whatsapp || '',
        direccion: rest.direccion || '',
        pedido_minimo: rest.pedido_minimo || '',
        tiempo_min: rest.tiempo_min || '',
        tiempo_max: rest.tiempo_max || '',
        envio_gratis: rest.envio_gratis || false,
        envio_gratis_desde: rest.envio_gratis_desde || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePortada = (e) => {
    const file = e.target.files[0];
    if (file) { setPortadaFile(file); setPortadaPreview(URL.createObjectURL(file)); }
  };
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (portadaFile) fd.append('foto_portada', portadaFile);
      if (logoFile) fd.append('logo', logoFile);
      if (menuPdfFile) fd.append('menu_pdf', menuPdfFile);
      await api.post('/restaurante/mi-restaurante', fd);
      toast.success('Perfil actualizado');
      const r = await restaurantesAPI.miPanel();
      const rest = r.data.restaurante || r.data;
      setRestaurante(rest);
      setPortadaFile(null); setLogoFile(null); setMenuPdfFile(null);
      setPortadaPreview(null); setLogoPreview(null);
    } catch (e) { toast.error(e.validationMessage || 'Error'); }
  };

  const toggleAbierto = async () => {
    try {
      await restaurantesAPI.actualizar({ abierto: !restaurante.abierto });
      setRestaurante({ ...restaurante, abierto: !restaurante.abierto });
      toast.success(restaurante.abierto ? 'Restaurante cerrado' : 'Restaurante abierto');
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return <div className="loading-screen">Cargando perfil...</div>;

  return (
    <div className="panel-layout">
      <div className="panel-header">
        <h1>Perfil del Restaurante</h1>
        <button className={`btn-auth ${restaurante?.abierto ? 'btn-closed' : ''}`} onClick={toggleAbierto}>
          {restaurante?.abierto ? '🔴 Cerrar' : '🟢 Abrir'}
        </button>
      </div>

      <div className="perfil-banner">
        <div className="perfil-logo" style={logoPreview || restaurante?.logo_url ? {backgroundImage:`url('${logoPreview || restaurante?.logo_url}')`,backgroundSize:'cover',backgroundPosition:'center'} : {}}>
          {!logoPreview && !restaurante?.logo_url ? (restaurante?.nombre?.charAt(0) || '🍴') : null}
        </div>
        <div>
          <h2>{restaurante?.nombre}</h2>
          <p className="text-muted">{restaurante?.categoria} · ⭐ {restaurante?.rating || '0.0'} ({restaurante?.total_resenas || 0} reseñas)</p>
        </div>
      </div>

      {restaurante?.foto_portada_url && (
        <div className="perfil-portada-preview">
          <img src={portadaPreview || restaurante.foto_portada_url} alt="Portada" style={{width:'100%',maxHeight:'200px',objectFit:'cover',borderRadius:'8px'}} />
        </div>
      )}
      {restaurante?.menu_pdf_url && (
        <div style={{margin:'10px 0',textAlign:'center'}}>
          <a href={restaurante.menu_pdf_url} target="_blank" rel="noopener noreferrer" className="btn-auth" style={{display:'inline-flex',alignItems:'center',gap:'6px',textDecoration:'none'}}>
            📄 Descargar Menú PDF
          </a>
        </div>
      )}

      <form className="panel-form" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
          <div className="field"><label>Categoría</label>
            <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
              {['Gourmet','Italiana','Peruana','Pizza','Comida Típica','Hamburguesas','Café','Bar & Comida','Fusión'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field full-width"><label>Descripción</label><textarea rows={3} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></div>
          <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} /></div>
          <div className="field"><label>WhatsApp</label><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} /></div>
          <div className="field full-width"><label>Dirección</label><input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} /></div>
          <div className="field"><label>Pedido Mínimo ($)</label><input type="number" value={form.pedido_minimo} onChange={e=>setForm({...form,pedido_minimo:e.target.value})} /></div>
          <div className="field"><label>Tiempo Mín (min)</label><input type="number" value={form.tiempo_min} onChange={e=>setForm({...form,tiempo_min:e.target.value})} /></div>
          <div className="field"><label>Tiempo Máx (min)</label><input type="number" value={form.tiempo_max} onChange={e=>setForm({...form,tiempo_max:e.target.value})} /></div>
          <div className="field">
            <label><input type="checkbox" checked={form.envio_gratis} onChange={e=>setForm({...form,envio_gratis:e.target.checked})} /> Envío gratis</label>
          </div>
          {form.envio_gratis && <div className="field"><label>Envío gratis desde ($)</label><input type="number" value={form.envio_gratis_desde} onChange={e=>setForm({...form,envio_gratis_desde:e.target.value})} /></div>}

          <div className="field"><label>Foto de Portada</label>
            <div className="file-upload-wrapper">
              <input type="file" ref={portadaRef} accept="image/*" onChange={handlePortada} style={{display:'none'}} />
              <button type="button" className="btn-ghost" onClick={()=>portadaRef.current.click()}>
                {portadaFile ? 'Cambiar portada' : 'Subir portada'}
              </button>
              {portadaFile && <span className="file-name">{portadaFile.name}</span>}
            </div>
          </div>
          <div className="field"><label>Logo</label>
            <div className="file-upload-wrapper">
              <input type="file" ref={logoRef} accept="image/*" onChange={handleLogo} style={{display:'none'}} />
              <button type="button" className="btn-ghost" onClick={()=>logoRef.current.click()}>
                {logoFile ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {logoFile && <span className="file-name">{logoFile.name}</span>}
            </div>
          </div>
          <div className="field full-width"><label>Menú PDF / Imagen</label>
            <div className="file-upload-wrapper">
              <input type="file" ref={menuPdfRef} accept=".pdf,image/*" onChange={e=>{const f=e.target.files[0];if(f)setMenuPdfFile(f);}} style={{display:'none'}} />
              <button type="button" className="btn-ghost" onClick={()=>menuPdfRef.current.click()}>
                {menuPdfFile ? 'Cambiar menú' : 'Subir menú (PDF o imagen)'}
              </button>
              {menuPdfFile && <span className="file-name">{menuPdfFile.name}</span>}
            </div>
          </div>
        </div>
        <div className="form-actions"><button type="submit" className="btn-auth">Guardar Cambios</button></div>
      </form>

      {(portadaFile || logoFile) && (
        <div className="preview-section">
          {portadaPreview && <div><p>Vista previa portada:</p><img src={portadaPreview} alt="Preview portada" className="img-preview" /></div>}
          {logoPreview && <div><p>Vista previa logo:</p><img src={logoPreview} alt="Preview logo" className="img-preview" /></div>}
        </div>
      )}
    </div>
  );
}