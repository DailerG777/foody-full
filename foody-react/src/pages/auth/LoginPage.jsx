import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, homeRoute } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`¡Bienvenido, ${user.nombre}!`);
      navigate(homeRoute(user.role), { replace: true });
    } catch (err) {
      setError(err.validationMessage || err.response?.data?.message || 'Error al ingresar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-block">
        <img src="/assets/logo-foody.png" alt="Foody" className="brand-logo-auth"/>
        <small>Ocaña Delivery</small>
      </div>
      <div className="auth-card">
        <h2>Ingresar</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Correo electrónico</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="tucorreo@email.com" required autoComplete="email"/>
          </div>
          <div className="field">
            <label>Contraseña</label>
            <div className="input-pass">
              <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required autoComplete="current-password"/>
              <button type="button" onClick={()=>setShowPass(p=>!p)}>{showPass?'🙈':'👁'}</button>
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Ingresar'}
          </button>
        </form>
        <p className="auth-link">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </div>
    </div>
  );
}
