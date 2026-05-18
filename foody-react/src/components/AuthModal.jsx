import { useNavigate } from 'react-router-dom';

export default function AuthModal({ onClose, message }) {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="auth-modal-content">
          <div className="auth-modal-icon">🍴</div>
          <h3>{message || 'Para continuar, inicia sesión o crea una cuenta'}</h3>
          <div className="auth-modal-buttons">
            <button className="btn-auth" onClick={() => { onClose(); navigate('/login'); }}>
              Iniciar sesión
            </button>
            <button className="btn-ghost" onClick={() => { onClose(); navigate('/registro'); }}>
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
