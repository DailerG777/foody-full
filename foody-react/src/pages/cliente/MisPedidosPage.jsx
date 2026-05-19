import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pedidosAPI } from '../../api/client';

const BADGE = { pendiente:'🔔 Pendiente', aceptado:'✅ Aceptado', preparando:'👨‍🍳 Preparando', listo:'📦 Listo', en_camino:'🛵 En camino', entregado:'✅ Entregado', cancelado:'❌ Cancelado' };
const BADGE_COLOR = { pendiente:'#ffc800', aceptado:'#D21E0F', preparando:'#D21E0F', listo:'#4ade80', en_camino:'#D21E0F', entregado:'#4ade80', cancelado:'#ff6b6b' };

export default function MisPedidosPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey:['mis-pedidos'], queryFn:()=>pedidosAPI.misPedidos().then(r=>r.data) });
  const pedidos = data?.data || [];
  const fmt = (n) => '$' + (n||0).toLocaleString('es-CO');

  return (
    <div className="app-layout">
      <header className="app-header">
        <button className="back-btn-inline" onClick={()=>navigate('/')}>←</button>
        <span style={{fontWeight:700}}>Mis pedidos</span>
        <span/>
      </header>
      <main className="app-main" style={{paddingTop:'80px'}}>
        {isLoading && [1,2,3].map(i=><div key={i} className="skeleton-card"/>)}
        {!isLoading && pedidos.length===0 && (
          <div className="empty-state" style={{textAlign:'center',padding:'60px 20px',color:'#888'}}>
            <p style={{fontSize:'3rem'}}>📦</p>
            <p>No tienes pedidos aún.</p>
            <button className="btn-auth mt-4" onClick={()=>navigate('/')}>Pedir ahora</button>
          </div>
        )}
        {pedidos.map(pedido=>(
          <div key={pedido.id} style={{background:'#161616',border:'1px solid #222',borderRadius:'14px',padding:'14px 16px',marginBottom:'10px',cursor:'pointer',transition:'.2s'}} onClick={()=>navigate(`/pedido/${pedido.referencia}`)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
              <span style={{fontWeight:700,fontSize:'.9rem'}}>{pedido.restaurante?.nombre}</span>
              <span style={{background:`rgba(${pedido.estado==='cancelado'?'255,80,80':'64,224,208'},.12)`,color:BADGE_COLOR[pedido.estado],fontSize:'.72rem',fontWeight:700,padding:'3px 9px',borderRadius:'20px'}}>{BADGE[pedido.estado]}</span>
            </div>
            <p style={{fontSize:'.8rem',color:'#888',marginBottom:'4px'}}>#{pedido.referencia} · {new Date(pedido.created_at).toLocaleDateString('es-CO')}</p>
            <p style={{fontSize:'.85rem',color:'#888'}}>{(pedido.items||[]).map(i=>`${i.nombre_snapshot || i.nombre} x${i.cantidad}`).join(', ')}</p>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
              <span style={{fontSize:'.85rem',color:'#888'}}>{pedido.metodo_pago}</span>
              <span style={{fontWeight:800,color:'#D21E0F'}}>{fmt(pedido.total)}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
