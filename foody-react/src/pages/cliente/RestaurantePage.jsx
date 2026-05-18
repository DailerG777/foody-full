import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantesAPI, resenasAPI } from '../../api/client';
import { useCartStore } from '../../hooks/useCart';

export default function RestaurantePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cart = useCartStore();
  const [catActiva, setCat] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurante', slug],
    queryFn: () => restaurantesAPI.ver(slug).then(r => r.data.restaurante),
  });

  const { data: resenasData } = useQuery({
    queryKey: ['resenas', slug],
    queryFn: () => resenasAPI.listar(slug).then(r => r.data.resenas),
    enabled: !!slug,
  });

  if (isLoading) return <div className="loading-screen">🍴 Cargando menú...</div>;
  if (!data) return <div className="error-screen">⚠️ No encontrado.</div>;

  const rest = data;
  const categorias = rest.categorias || [];
  const catsFiltro = catActiva ? categorias.filter(c=>c.id===catActiva) : categorias;
  const totalItems = cart.totalItems();
  const totalPrice = cart.totalPrice();
  const fmt = (n) => '$' + n.toLocaleString('es-CO');

  return (
    <div className="app-layout">
      <div className="rest-detail-header" style={{backgroundImage:`url('${rest.foto_portada_url||rest.foto_portada||''}')`}}>
        <div className="rest-header-overlay"/>
        <button className="back-btn" onClick={()=>navigate('/')}>←</button>
      </div>

      <div className="rest-info-bar">
        <h2>{rest.nombre}</h2>
        <p>{rest.categoria} · {rest.tiempo_min}–{rest.tiempo_max} min</p>
        <div className="rest-meta">
          <span>⭐ <strong>{rest.rating}</strong></span>
          <span>🕐 <strong>{rest.tiempo_min}–{rest.tiempo_max} min</strong></span>
          <span>📍 <strong>{rest.direccion}</strong></span>
          {!rest.abierto && <span className="tag tag-closed">Cerrado ahora</span>}
        </div>
        {rest.menu_pdf_url && (
          <a href={rest.menu_pdf_url} target="_blank" rel="noopener noreferrer" className="btn-download-menu" style={{display:'inline-block',marginTop:'10px',padding:'8px 16px',background:'#ff6b6b',color:'#fff',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>
            📄 Descargar Menú PDF
          </a>
        )}
      </div>

      <div className="menu-cat-scroll">
        <button className={`cat-tab ${!catActiva?'active':''}`} onClick={()=>setCat(null)}>Todos</button>
        {categorias.map(cat=>(
          <button key={cat.id} className={`cat-tab ${catActiva===cat.id?'active':''}`} onClick={()=>setCat(cat.id)}>
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="menu-section" style={{paddingBottom:totalItems>0?'120px':'30px'}}>
        {catsFiltro.map(cat=>(
          <div key={cat.id}>
            <p className="menu-section-title">{cat.nombre}</p>
            {(cat.productos||[]).map(prod=>{
              const qty = cart.getQty(prod.id);
              return (
                <div key={prod.id} className={`menu-item ${!prod.disponible?'unavailable':''}`}>
                  <div className="menu-item-info">
                    <p>
                      {prod.foto_url ? <img src={prod.foto_url} alt={prod.nombre} className="prod-thumb" style={{width:'32px',height:'32px',borderRadius:'6px',objectFit:'cover',verticalAlign:'middle',marginRight:'6px'}} /> : null}
                      {prod.emoji} {prod.nombre}
                    </p>
                    <span>{prod.descripcion}</span>
                  </div>
                  <div className="menu-item-right">
                    <span className="menu-item-price">{fmt(prod.precio)}</span>
                    {prod.disponible ? (
                      qty > 0 ? (
                        <div className="qty-control">
                          <button className="qty-btn minus" onClick={()=>cart.remove(prod.id)}>−</button>
                          <span className="qty-num">{qty}</span>
                          <button className="qty-btn" onClick={()=>cart.add(prod)}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={()=>cart.add(prod)}>Agregar</button>
                      )
                    ) : (
                      <span className="tag tag-closed">No disponible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

        {resenasData && resenasData.length > 0 && (
          <div className="reviews-section">
            <p className="menu-section-title">⭐ Reseñas ({resenasData.length})</p>
            {resenasData.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <strong>{r.user?.nombre} {r.user?.apellido}</strong>
                  <span>{'★'.repeat(r.estrellas)}{'☆'.repeat(5-r.estrellas)}</span>
                </div>
                {r.comentario && <p className="review-comment">{r.comentario}</p>}
              </div>
            ))}
          </div>
        )}

        {totalItems > 0 && (
        <div className="cart-bar visible">
          <div className="cart-bar-inner">
            <div className="cart-info">🛒 <span>{totalItems}</span> productos</div>
            <div className="cart-total">{fmt(totalPrice)}</div>
          </div>
          <button className="cart-cta" onClick={()=>{ cart.setRestaurante(rest); navigate('/checkout'); }}>
            Continuar pedido →
          </button>
        </div>
      )}
    </div>
  );
}
