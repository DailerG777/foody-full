import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function AuthGuardAction({ children, message }) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (isAuthenticated) return children;

  return (
    <>
      <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      {showModal && <AuthModal onClose={() => setShowModal(false)} message={message} />}
    </>
  );
}
