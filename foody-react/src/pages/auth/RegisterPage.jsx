import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { id:'cliente',     icon:'🛒', label:'Cliente',    desc:'Pedir domicilios' },
  { id:'restaurante', icon:'🍽️', label:'Negocio',    desc:'Registrar mi local' },
  { id:'repartidor',  icon:'🛵', label:'Repartidor', desc:'Hacer entregas' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', password:'', password_confirmation:'', role:'cliente' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (form.password !== form.password_confirmation) { setError('Las contraseñas no coinciden.'); setLoading(false); return; }
    try {
      await register(form);
      setSuccess(true);
      toast.success('¡Cuenta creada! Revisa tu correo.');
    } catch (err) {
      setError(err.validationMessage || err.response?.data?.message || 'Error al registrarse.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'12px'}}>✅</div>
        <h2>¡Cuenta creada!</h2>
        <p style={{color:'#888',margin:'8px 0 20px',fontSize:'.9rem'}}>Revisa tu correo para verificar tu cuenta.</p>
        <button className="btn-auth" onClick={()=>navigate('/login')}>Ir al login</button>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-logo-block">
        <img src="/assets/logo-foody.png" alt="Foody" className="brand-logo-auth"/>
      </div>
      <div className="auth-card">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div className="field"><label>Nombre</label><input type="text" value={form.nombre} onChange={f('nombre')} placeholder="Juan" required/></div>
            <div className="field"><label>Apellido</label><input type="text" value={form.apellido} onChange={f('apellido')} placeholder="Pérez" required/></div>
          </div>
          <div className="field"><label>Correo electrónico</label><input type="email" value={form.email} onChange={f('email')} placeholder="tucorreo@email.com" required/></div>
          <div className="field"><label>Teléfono (WhatsApp)</label><input type="tel" value={form.telefono} onChange={f('telefono')} placeholder="300 000 0000"/></div>
          <div className="field"><label>Contraseña</label><input type="password" value={form.password} onChange={f('password')} placeholder="Mínimo 8 caracteres" required/></div>
          <div className="field"><label>Confirmar contraseña</label><input type="password" value={form.password_confirmation} onChange={f('password_confirmation')} placeholder="Repite tu contraseña" required/></div>
          <div className="field">
            <label>Tipo de cuenta</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {ROLES.map(r=>(
                <div key={r.id} onClick={()=>setForm(p=>({...p,role:r.id}))} style={{background:form.role===r.id?'rgba(210,30,15,.15)':'#161616',border:`1px solid ${form.role===r.id?'#D21E0F':'#2a2a2a'}`,borderRadius:'10px',padding:'10px 6px',textAlign:'center',cursor:'pointer',transition:'.2s'}}>
                  <div style={{fontSize:'1.3rem'}}>{r.icon}</div>
                  <strong style={{display:'block',fontSize:'.82rem',color:form.role===r.id?'#D21E0F':'white'}}>{r.label}</strong>
                  <small style={{fontSize:'.72rem',color:'#888'}}>{r.desc}</small>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Ingresar</Link></p>
      </div>
    </div>
  );
}
