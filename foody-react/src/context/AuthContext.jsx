import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('foody_user')); } catch { return null; } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('foody_token');
    if (token) {
      authAPI.me().then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('foody_token'); localStorage.removeItem('foody_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('foody_token', data.token);
    localStorage.setItem('foody_user', JSON.stringify(data.user));
    setUser(data.user); return data.user;
  }, []);

  const register = useCallback(async (formData) => { const { data } = await authAPI.register(formData); return data; }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('foody_token'); localStorage.removeItem('foody_user');
    setUser(null); toast.success('Sesión cerrada');
  }, []);

  const homeRoute = useCallback((role) => ({ admin:'/admin', restaurante:'/restaurante', repartidor:'/repartidor', cliente:'/' })[role] || '/', []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated:!!user, isAdmin:user?.role==='admin', isRestaurante:user?.role==='restaurante', isRepartidor:user?.role==='repartidor', isCliente:user?.role==='cliente', isPremium:user?.plan==='premium', login, register, logout, homeRoute }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}
