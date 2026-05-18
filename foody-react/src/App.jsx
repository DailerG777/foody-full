import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/cliente/HomePage';
import RestaurantePage from './pages/cliente/RestaurantePage';
import CheckoutPage from './pages/cliente/CheckoutPage';
import PedidoDetallePage from './pages/cliente/PedidoDetallePage';
import MisPedidosPage from './pages/cliente/MisPedidosPage';
import MapaPage from './pages/public/MapaPage';
import ChatPage from './pages/chat/ChatPage';
import DashboardPage from './pages/restaurante/DashboardPage';
import MenuPage from './pages/restaurante/MenuPage';
import InventarioPage from './pages/restaurante/InventarioPage';
import CajaPage from './pages/restaurante/CajaPage';
import NominaPage from './pages/restaurante/NominaPage';
import SubcuentasPage from './pages/restaurante/SubcuentasPage';
import PerfilPage from './pages/restaurante/PerfilPage';
import DashboardRepartidorPage from './pages/repartidor/DashboardRepartidorPage';
import PedidosDisponiblesPage from './pages/repartidor/PedidosDisponiblesPage';
import PedidoActivoPage from './pages/repartidor/PedidoActivoPage';
import HistorialPage from './pages/repartidor/HistorialPage';
import ChatRepartidorPage from './pages/repartidor/ChatRepartidorPage';

const queryClient = new QueryClient({ defaultOptions:{ queries:{ retry:1, staleTime:1000*60*5 } } });

function PrivateRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="loading-screen">🍴 Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="loading-screen">🍴 Cargando...</div>;
  if (!isAuthenticated) return <HomePage />;
  if (user.role === 'restaurante') return <Navigate to="/restaurante" replace />;
  if (user.role === 'repartidor') return <Navigate to="/repartidor" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <HomePage />;
}

function ThemeToggleBtn() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="theme-toggle" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/"         element={<RoleRedirect />} />
            <Route path="/explorar" element={<MapaPage />} />
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/restaurante/:slug" element={<RestaurantePage />} />
            <Route path="/checkout" element={<PrivateRoute roles={['cliente','admin']}><CheckoutPage /></PrivateRoute>} />
            <Route path="/pedido/:referencia" element={<PrivateRoute><PedidoDetallePage /></PrivateRoute>} />
            <Route path="/mis-pedidos" element={<PrivateRoute roles={['cliente','admin']}><MisPedidosPage /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/chat/:conversacionId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

            {/* Restaurante Panel */}
            <Route path="/restaurante" element={<PrivateRoute roles={['restaurante','admin']}><DashboardPage /></PrivateRoute>} />
            <Route path="/restaurante/panel" element={<PrivateRoute roles={['restaurante','admin']}><DashboardPage /></PrivateRoute>} />
            <Route path="/restaurante/menu" element={<PrivateRoute roles={['restaurante','admin']}><MenuPage /></PrivateRoute>} />
            <Route path="/restaurante/inventario" element={<PrivateRoute roles={['restaurante','admin']}><InventarioPage /></PrivateRoute>} />
            <Route path="/restaurante/caja" element={<PrivateRoute roles={['restaurante','admin']}><CajaPage /></PrivateRoute>} />
            <Route path="/restaurante/nomina" element={<PrivateRoute roles={['restaurante','admin']}><NominaPage /></PrivateRoute>} />
            <Route path="/restaurante/subcuentas" element={<PrivateRoute roles={['restaurante','admin']}><SubcuentasPage /></PrivateRoute>} />
            <Route path="/restaurante/perfil" element={<PrivateRoute roles={['restaurante','admin']}><PerfilPage /></PrivateRoute>} />

            {/* Repartidor Panel */}
            <Route path="/repartidor" element={<PrivateRoute roles={['repartidor','admin']}><DashboardRepartidorPage /></PrivateRoute>} />
            <Route path="/repartidor/panel" element={<PrivateRoute roles={['repartidor','admin']}><DashboardRepartidorPage /></PrivateRoute>} />
            <Route path="/repartidor/disponibles" element={<PrivateRoute roles={['repartidor','admin']}><PedidosDisponiblesPage /></PrivateRoute>} />
            <Route path="/repartidor/activo" element={<PrivateRoute roles={['repartidor','admin']}><PedidoActivoPage /></PrivateRoute>} />
            <Route path="/repartidor/historial" element={<PrivateRoute roles={['repartidor','admin']}><HistorialPage /></PrivateRoute>} />
            <Route path="/repartidor/chat" element={<PrivateRoute roles={['repartidor','admin']}><ChatRepartidorPage /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-center" toastOptions={{ style:{ background:'var(--gris-card)',color:'var(--blanco)',border:'1px solid var(--primario)',fontFamily:'Outfit, sans-serif',fontSize:'0.9rem' }, success:{ iconTheme:{ primary:'var(--primario)',secondary:'#000' } } }} />
        <ThemeToggleBtn />
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
