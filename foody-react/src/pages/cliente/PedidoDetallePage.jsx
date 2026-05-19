import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosAPI, resenasAPI } from '../../api/client';
import MapaSeguimiento from '../../components/MapaSeguimiento';

const ESTADOS = [
  { key:'pendiente',  icon:'🔔', label:'Pedido recibido',  desc:'Esperando al restaurante' },
  { key:'aceptado',   icon:'✅', label:'Aceptado',          desc:'El restaurante confirmó' },
  { key:'preparando', icon:'👨‍🍳', label:'Preparando',       desc:'Cocinando con amor' },
  { key:'listo',      icon:'📦', label:'Listo',             desc:'Esperando repartidor' },
  { key:'en_camino',  icon:'🛵', label:'En camino',         desc:'Tu repartidor va hacia ti' },
  { key:'entregado',  icon:'🎉', label:'Entregado',         desc:'¡Buen provecho!' },
];

const ESTRELLAS = [1,2,3,4,5];

export default function PedidoDetallePage() {
  const { referencia } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const reviewMutation = useMutation({
    mutationFn: (data) => resenasAPI.crear(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pedido', referencia]);
      setShowReviewForm(false);
      setReviewStars(0);
      setReviewComment('');
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['pedido', referencia],
    queryFn: () => pedidosAPI.ver(referencia).then(r => r.data.pedido),
    refetchInterval: (data) => {
      if (!data) return false;
      return ['pendiente','aceptado','preparando','listo','en_camino'].includes(data.estado) ? 15000 : false;
    },
  });

  if (isLoading) return <div className="loading-screen">🍴 Cargando pedido...</div>;
  if (!data) return <div className="error-screen">Pedido no encontrado.</div>;

  const pedido   = data;
  const idx      = ESTADOS.findIndex(e => e.key === pedido.estado);
  const cancelado= pedido.estado === 'cancelado';
  const fmt      = (n) => '$' + (n||0).toLocaleString('es-CO');

  return (
    <div className="app-layout">
      <header className="app-header">
        <button className="back-btn-inline" onClick={()=>navigate('/')}>←</button>
        <span style={{fontWeight:700}}>Pedido #{pedido.referencia}</span>
        <span/>
      </header>

      <main className="app-main" style={{paddingTop:'80px'}}>
        {cancelado ? (
          <div className="cancelled-box"><p style={{fontSize:'2rem'}}>❌</p><h3>Pedido cancelado</h3></div>
        ) : (
          <div className="order-status-card">
            <div className="status-icon-big">{ESTADOS[idx]?.icon}</div>
            <h3>{ESTADOS[idx]?.label}</h3>
            <p>{ESTADOS[idx]?.desc}</p>
          </div>
        )}

        {!cancelado && (
          <div className="order-timeline">
            {ESTADOS.filter(e=>e.key!=='pendiente').map((estado,i)=>(
              <div key={estado.key} className={`timeline-step ${i<=idx-1?'active':''}`}>
                <div className="tl-icon">{estado.icon}</div>
                <div><strong>{estado.label}</strong><small>{estado.desc}</small></div>
              </div>
            ))}
          </div>
        )}

        <div className="confirm-card" style={{margin:'16px 0'}}>
          <strong>{pedido.restaurante?.nombre}</strong>
          <small>#{pedido.referencia}</small>
        </div>

        <div className="confirm-items">
          {(pedido.items||[]).map((item,i)=>(
            <div key={i} className="confirm-item">
              <span>{item.nombre}</span>
              <span className="qty">x{item.cantidad}</span>
              <span className="price">{fmt(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="cost-summary" style={{margin:'12px 0'}}>
          <div className="cost-line"><span>Subtotal</span><span>{fmt(pedido.subtotal)}</span></div>
          <div className="cost-line"><span>Domicilio</span><span>{fmt(pedido.costo_domicilio)}</span></div>
          {pedido.descuento>0 && <div className="cost-line discount"><span>Descuento</span><span>- {fmt(pedido.descuento)}</span></div>}
          <div className="cost-line total"><span>Total</span><strong>{fmt(pedido.total)}</strong></div>
        </div>

        <div className="confirm-section"><p className="section-label">📍 Dirección</p><p>{pedido.direccion_texto}</p></div>

        {pedido.codigo_entrega && !cancelado && (
          <div className="confirm-section" style={{border:'2px dashed #D21E0F',borderRadius:'12px',padding:'12px',marginTop:'8px'}}>
            <p className="section-label" style={{color:'#D21E0F'}}>🔑 Código de entrega</p>
            <p style={{fontSize:'1.6rem',fontWeight:700,letterSpacing:'6px',color:'#D21E0F',textAlign:'center'}}>{pedido.codigo_entrega}</p>
            <p style={{fontSize:'.8rem',color:'#888',textAlign:'center',marginTop:'4px'}}>Entregue este código al repartidor para confirmar la entrega</p>
          </div>
        )}

        {pedido.repartidor && (
          <div className="confirm-section">
            <p className="section-label">🛵 Tu repartidor</p>
            <p>{pedido.repartidor.nombre} {pedido.repartidor.apellido}</p>
            {pedido.repartidor.telefono && <a href={`tel:${pedido.repartidor.telefono}`} className="btn-call-inline">📞 Llamar</a>}
          </div>
        )}

        {pedido.estado === 'en_camino' && pedido.direccion_lat && pedido.direccion_lng && (
          <MapaSeguimiento
            pedidoId={pedido.id}
            clienteLat={parseFloat(pedido.direccion_lat)}
            clienteLng={parseFloat(pedido.direccion_lng)}
          />
        )}

        {pedido.estado==='entregado' && !pedido.resena && !showReviewForm && (
          <button className="btn-auth mt-4" onClick={()=>setShowReviewForm(true)}>⭐ Calificar pedido</button>
        )}

        {pedido.estado==='entregado' && !pedido.resena && showReviewForm && (
          <div className="review-form-card">
            <h4>Califica tu pedido</h4>
            <div className="star-input">
              {ESTRELLAS.map(s => (
                <span key={s}
                  className={`star ${s <= (reviewHover || reviewStars) ? 'active' : ''}`}
                  onClick={() => setReviewStars(s)}
                  onMouseEnter={() => setReviewHover(s)}
                  onMouseLeave={() => setReviewHover(0)}
                >★</span>
              ))}
            </div>
            <textarea
              className="review-textarea"
              placeholder="Cuéntanos tu experiencia (opcional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              maxLength={500}
            />
            <div className="review-actions">
              <button className="btn-ghost btn-sm" onClick={() => setShowReviewForm(false)}>Cancelar</button>
              <button
                className="btn-auth"
                disabled={reviewStars === 0 || reviewMutation.isLoading}
                onClick={() => reviewMutation.mutate({ pedido_id: pedido.id, estrellas: reviewStars, comentario: reviewComment })}
              >
                {reviewMutation.isLoading ? 'Enviando...' : 'Enviar calificación'}
              </button>
            </div>
            {reviewMutation.isError && <p className="error-box" style={{marginTop:'8px'}}>⚠️ {reviewMutation.error?.response?.data?.message || 'Error al enviar'}</p>}
          </div>
        )}

        {pedido.resena && (
          <div className="review-summary">
            <p style={{fontSize:'1.1rem',marginBottom:'4px'}}>
              {'★'.repeat(pedido.resena.estrellas)}{'☆'.repeat(5-pedido.resena.estrellas)}
              <span style={{marginLeft:'8px',color:'#666'}}>Tu calificación</span>
            </p>
            {pedido.resena.comentario && <p style={{color:'#555',fontStyle:'italic'}}>"{pedido.resena.comentario}"</p>}
          </div>
        )}
      </main>
    </div>
  );
}
