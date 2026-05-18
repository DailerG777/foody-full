import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantesAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { ordenarPorDistancia, formatearDistancia } from '../../utils/distancia';
import AuthModal from '../../components/AuthModal';
import UbicacionBanner from '../../components/UbicacionBanner';

const CATEGORIAS = [
  { label:'Todos', value:'', icon:'🍴' },
  { label:'Gourmet', value:'Gourmet', icon:'🍽️' },
  { label:'Comida Típica', value:'Comida Típica', icon:'🥘' },
  { label:'Hamburguesas', value:'Hamburguesas', icon:'🍔' },
  { label:'Italiana', value:'Italiana', icon:'🍝' },
  { label:'Pizza', value:'Pizza', icon:'🍕' },
  { label:'Café', value:'Café', icon:'☕' },
  { label:'Fusión', value:'Fusión', icon:'🥗' },
  { label:'Bar & Comida', value:'Bar & Comida', icon:'🍻' },
  { label:'Corriente', value:'Corriente', icon:'🍛' },
  { label:'Alitas', value:'Alitas', icon:'🍗' },
  { label:'Broaster', value:'Broaster', icon:'🍗' },
  { label:'Empanadas', value:'Empanadas', icon:'🥟' },
];

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { location, pedirUbicacion } = useGeolocation();
  const [userLocation, setUserLocation] = useState(null);
  const [categoria, setCat] = useState('');
  const [busqueda, setBus] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurantes', categoria, busqueda],
    queryFn: () => restaurantesAPI.listar({ categoria, q: busqueda }).then(r => r.data),
  });

  const restaurantes = useMemo(() => {
    const lista = data?.data || [];
    const conImagen = r => r.foto_portada && !r.foto_portada.startsWith('http');
    const conDistancia = ordenarPorDistancia(lista, userLocation);
    return [...conDistancia].sort((a, b) => {
      if (conImagen(a) && !conImagen(b)) return -1;
      if (!conImagen(a) && conImagen(b)) return 1;
      const da = a.distancia_km ?? 999;
      const db = b.distancia_km ?? 999;
      return da - db;
    });
  }, [data, userLocation]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="brand">
          <img src="/assets/logo-foody.png" alt="Foody" className="brand-logo"/>
        </div>
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="¿Qué quieres comer?" value={busqueda} onChange={e=>setBus(e.target.value)}/>
        </div>
        <div className="header-user">
          {isAuthenticated ? (
            <>
              <button onClick={()=>navigate('/chat')} className="btn-ghost btn-sm" title="Chat">💬</button>
              <button onClick={()=>navigate('/mis-pedidos')} className="btn-ghost btn-sm" title="Mis pedidos">📦</button>
              <span className="header-user-name">{user?.nombre}</span>
              <button onClick={logout} className="btn-ghost btn-sm">Salir</button>
            </>
          ) : (
            <button onClick={()=>setShowAuth(true)} className="btn-login">Iniciar sesión / Registrarse</button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} />}

      <main className="app-main">
        <UbicacionBanner onUbicacionObtenida={setUserLocation} />

        <div className="hero-banner">
          <h1>Ocaña come <span>diferente</span> 🍽️</h1>
          {userLocation
            ? <p>📍 Mostrando restaurantes más cercanos a ti</p>
            : <p>{isAuthenticated ? `Hola ${user?.nombre}, ¿qué vas a pedir hoy?` : 'Descubre los mejores restaurantes de Ocaña'}</p>
          }
          <button className="btn-ghost" style={{marginTop:'8px',fontSize:'.8rem'}} onClick={()=>navigate('/mapa')}>🗺️ Ver en mapa</button>
        </div>

        <div className="categories-scroll">
          {CATEGORIAS.map(cat=>(
            <button key={cat.value} className={`cat-btn ${categoria===cat.value?'active':''}`} onClick={()=>setCat(cat.value)}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <p className="section-title">Restaurantes en Ocaña</p>

        {isLoading && <div className="loading-list">{[1,2,3].map(i=><div key={i} className="skeleton-card"/>)}</div>}
        {error && <div className="error-box">⚠️ Error cargando restaurantes.</div>}
        {!isLoading && restaurantes.length===0 && <div className="empty-state"><p>🍴</p><p>No hay restaurantes disponibles.</p></div>}

        <div className="restaurant-list">
          {restaurantes.map(rest=>(
            <div key={rest.id} className="restaurant-card" onClick={()=>navigate(`/restaurante/${rest.slug}`)} role="button" tabIndex={0}>
              <div className="restaurant-img" style={{backgroundImage:`url('${rest.foto_portada_url||rest.foto_portada||'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}')`}}/>
              <div className="restaurant-info">
                <div className="rating">★ {rest.rating} · {rest.categoria}</div>
                <h3>{rest.nombre}</h3>
                <p>{rest.categoria} · {rest.tiempo_min}–{rest.tiempo_max} min</p>
                {rest.distancia_km && rest.distancia_km < 999 && (
                  <p style={{color:'var(--turquesa)',fontWeight:600,fontSize:'.82rem',marginTop:'2px'}}>📍 {formatearDistancia(rest.distancia_km)}</p>
                )}
                <p style={{fontSize:'.78rem'}}>{rest.direccion}</p>
                <div style={{display:'flex',gap:'6px',marginTop:'6px',flexWrap:'wrap'}}>
                  {!rest.abierto && <span className="tag tag-closed">Cerrado</span>}
                  {rest.envio_gratis && <span className="tag">Envío Gratis</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
