import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { pedidosAPI, pagosAPI } from '../../api/client';
import { useCartStore } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 3500;
const METODO_MAP = { efectivo:'efectivo', nequi_manual:'nequi', daviplata_manual:'daviplata', tarjeta_wompi:'tarjeta' };
const METODOS = [
  { id:'efectivo', label:'Efectivo', icon:'💵', desc:'Pagas al recibir' },
  { id:'nequi_manual', label:'Nequi', icon:'📱', desc:'Transferencia manual' },
  { id:'daviplata_manual', label:'Daviplata', icon:'🔴', desc:'Transferencia manual' },
  { id:'tarjeta_wompi', label:'Tarjeta (Wompi)', icon:'💳', desc:'Visa, Mastercard, PSE' },
];
const CUPONES_DEMO = {
  'FOODY10':    { tipo:'pct', valor:10, label:'10% de descuento' },
  'BIENVENIDO': { tipo:'fijo', valor:5000, label:'$5.000 de descuento' },
  'GRATIS':     { tipo:'delivery', label:'Domicilio gratis' },
};
const DATOS_PAGO = {
  nequi_manual:    { numero: '300 123 4567', titular: 'Foody Ocaña' },
  daviplata_manual:{ numero: '310 987 6543', titular: 'Foody Ocaña' },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore();
  const fileRef = useRef(null);
  const [step, setStep] = useState(1);
  const [direccion, setDir] = useState('');
  const [nota, setNota] = useState('');
  const [metodo, setMetodo] = useState('efectivo');
  const [cupon, setCupon] = useState('');
  const [descuento, setDesc] = useState(0);
  const [domicilioGratis, setDomGratis] = useState(false);
  const [cuponMsg, setCupMsg] = useState('');
  const [pedidoOk, setPedOk] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [subiendoComp, setSubiendoComp] = useState(false);

  const esManual = metodo === 'nequi_manual' || metodo === 'daviplata_manual';

  useEffect(() => { if (cart.items.length===0 && !pedidoOk) navigate('/'); }, [cart.items]);

  const subtotal  = cart.totalPrice();
  const domicilio = domicilioGratis ? 0 : DELIVERY_FEE;
  const total     = Math.max(0, subtotal + domicilio - descuento);
  const fmt       = (n) => '$' + Math.round(n).toLocaleString('es-CO');

  const validarCupon = () => {
    const c = CUPONES_DEMO[cupon.toUpperCase()];
    if (!c) { setCupMsg('❌ Cupón inválido'); return; }
    if (c.tipo==='pct')      { setDesc(Math.round(subtotal*c.valor/100)); setDomGratis(false); }
    if (c.tipo==='fijo')     { setDesc(c.valor); setDomGratis(false); }
    if (c.tipo==='delivery') { setDesc(0); setDomGratis(true); }
    setCupMsg(`✅ ${c.label}`);
    toast.success(c.label);
  };

  const crearPedido = useMutation({
    mutationFn: async () => {
      const { data } = await pedidosAPI.crear({
        restaurante_id: cart.restaurante?.id,
        direccion_texto: direccion,
        items: cart.toApiPayload(),
        metodo_pago: METODO_MAP[metodo],
        nota: nota || undefined,
        codigo_cupon: cupon || undefined,
      });
      return data;
    },
    onSuccess: async ({ pedido }) => {
      if (esManual && comprobante) {
        setSubiendoComp(true);
        try {
          const fd = new FormData();
          fd.append('pedido_id', pedido.id);
          fd.append('comprobante', comprobante);
          await pagosAPI.subirComprobante(fd);
          toast.success('Comprobante recibido');
        } catch { toast.error('Error al subir comprobante'); }
        setSubiendoComp(false);
      }
      if (metodo === 'tarjeta_wompi') {
        try {
          const { data: pd } = await pagosAPI.iniciar({ pedido_id: pedido.id });
          const checkout = new window.WidgetCheckout({ currency:'COP', amountInCents:pd.monto_en_centavos, reference:pd.referencia, publicKey:pd.public_key, signature:{ integrity:pd.firma_integridad }, redirectUrl:pd.redirect_url });
          checkout.open((result) => {
            cart.clear();
            if (result.transaction?.status==='APPROVED') { toast.success('¡Pago aprobado!'); setPedOk(pedido); setStep(4); }
            else toast.error('Pago no completado.');
          });
        } catch { toast.error('Error iniciando Wompi'); }
      } else { cart.clear(); setPedOk(pedido); setStep(4); }
    },
    onError: (err) => toast.error(err.validationMessage || err.response?.data?.message || 'Error creando el pedido'),
  });

  if (step===4 && pedidoOk) return (
    <div className="checkout-success">
      <div className="success-anim">🎉</div>
      <h2>¡Pedido enviado!</h2>
      <p>{esManual ? 'Recibimos tu comprobante, pendiente de verificación.' : 'Tu pedido fue recibido por el restaurante.'}</p>
      <div className="order-id-box"><small>Número de pedido</small><strong>#{pedidoOk.referencia}</strong></div>
      <button className="btn-auth" onClick={()=>navigate(`/pedido/${pedidoOk.referencia}`)}>Ver estado del pedido</button>
      <button className="btn-ghost mt-2" onClick={()=>navigate('/')}>Volver al inicio</button>
    </div>
  );

  return (
    <div className="checkout-layout">
      <header className="app-header">
        <button className="back-btn-inline" onClick={()=>step>1?setStep(s=>s-1):navigate(-1)}>←</button>
        <span style={{fontWeight:700}}>Confirmar pedido</span>
        <span/>
      </header>

      <div className="steps-bar">
        {['Dirección','Pago','Confirmar'].map((s,i)=>(
          <div key={i} className={`step ${step>i+1?'done':''} ${step===i+1?'active':''}`}>
            <div className="step-circle">{step>i+1?'✓':i+1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="checkout-body">
        {step===1 && (
          <div className="checkout-step">
            <h2 className="checkout-title">¿Dónde entregamos?</h2>
            <div className="field"><label>Dirección completa</label><input type="text" value={direccion} onChange={e=>setDir(e.target.value)} placeholder="Barrio, calle, número"/></div>
            <div className="field"><label>Nota para el domiciliario</label><textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Ej: portón azul..." rows={2}/></div>
            <div className="eta-card">
              <div className="eta-item"><strong>{cart.restaurante?.tiempo_min}–{cart.restaurante?.tiempo_max} min</strong><small>Tiempo estimado</small></div>
              <div className="eta-item"><strong>{fmt(DELIVERY_FEE)}</strong><small>Costo domicilio</small></div>
            </div>
            <button className="btn-auth" disabled={!direccion.trim()} onClick={()=>setStep(2)}>Continuar al pago →</button>
          </div>
        )}

        {step===2 && (
          <div className="checkout-step">
            <h2 className="checkout-title">¿Cómo pagas?</h2>
            <div className="payment-methods">
              {METODOS.map(m=>(
                <div key={m.id} className={`pay-option ${metodo===m.id?'active':''}`} onClick={()=>setMetodo(m.id)}>
                  <span className="pay-icon">{m.icon}</span>
                  <div className="pay-info"><strong>{m.label}</strong><small>{m.desc}</small></div>
                  {metodo===m.id && <span className="pay-check">✓</span>}
                </div>
              ))}
            </div>

            {esManual && (
              <div style={{background:'#161616',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'14px',margin:'12px 0'}}>
                <p style={{fontWeight:700,fontSize:'.85rem',marginBottom:'8px'}}>📲 Datos para transferencia</p>
                <p style={{fontSize:'.82rem',color:'#888'}}>
                  {metodo === 'nequi_manual' ? 'Nequi' : 'Daviplata'}: <strong style={{color:'#D21E0F'}}>{DATOS_PAGO[metodo]?.numero}</strong>
                </p>
                <p style={{fontSize:'.82rem',color:'#888',marginTop:'4px'}}>
                  Titular: <strong>{DATOS_PAGO[metodo]?.titular}</strong>
                </p>
                <p style={{fontSize:'.78rem',color:'#888',marginTop:'8px',borderTop:'1px solid #2a2a2a',paddingTop:'8px'}}>
                  Valor a transferir: <strong style={{color:'#D21E0F'}}>{fmt(total)}</strong>
                </p>
                <div className="field" style={{marginTop:'10px'}}>
                  <label>📷 Sube el comprobante de pago (obligatorio)</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={e => setComprobante(e.target.files[0])}
                    style={{background:'#1e1e1e',border:'1px dashed #D21E0F',borderRadius:'10px',padding:'20px',width:'100%',color:'#888',cursor:'pointer'}}
                  />
                  {comprobante && <p style={{fontSize:'.75rem',color:'#D21E0F',marginTop:'4px'}}>✅ {comprobante.name}</p>}
                </div>
              </div>
            )}

            <div className="coupon-row">
              <input type="text" value={cupon} onChange={e=>setCupon(e.target.value.toUpperCase())} placeholder="Código de descuento"/>
              <button onClick={validarCupon}>Aplicar</button>
            </div>
            {cuponMsg && <p className={`coupon-msg ${cuponMsg.startsWith('✅')?'ok':'err'}`}>{cuponMsg}</p>}
            <div className="cost-summary">
              <div className="cost-line"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="cost-line"><span>Domicilio</span><span>{domicilioGratis?'Gratis':fmt(DELIVERY_FEE)}</span></div>
              {descuento>0 && <div className="cost-line discount"><span>🎉 Descuento</span><span>- {fmt(descuento)}</span></div>}
              <div className="cost-line total"><span>Total</span><strong>{fmt(total)}</strong></div>
            </div>
            <button className="btn-auth" onClick={()=>setStep(3)}>Ver resumen →</button>
          </div>
        )}

        {step===3 && (
          <div className="checkout-step">
            <h2 className="checkout-title">Confirma tu pedido</h2>
            <div className="confirm-card"><strong>{cart.restaurante?.nombre}</strong><small>{cart.restaurante?.categoria}</small></div>
            <div className="confirm-items">
              {cart.items.map(item=>(
                <div key={item.id} className="confirm-item">
                  <span>{item.emoji} {item.nombre}</span>
                  <span className="qty">x{item.qty}</span>
                  <span className="price">{fmt(item.precio*item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="confirm-section"><p className="section-label">📍 Dirección</p><p>{direccion}</p></div>
            <div className="confirm-section"><p className="section-label">💳 Pago</p><p>{METODOS.find(m=>m.id===metodo)?.label}</p></div>
            {esManual && comprobante && (
              <div className="confirm-section">
                <p className="section-label">📷 Comprobante</p>
                <p style={{color:'#D21E0F',fontSize:'.82rem'}}>✅ {comprobante.name}</p>
              </div>
            )}
            {esManual && !comprobante && (
              <div className="confirm-section">
                <p style={{color:'#ff6432',fontSize:'.82rem'}}>⚠️ Debes subir el comprobante de pago</p>
              </div>
            )}
            <div className="confirm-total"><span>Total a pagar</span><strong>{fmt(total)}</strong></div>
            <button className="btn-auth" disabled={crearPedido.isPending||(esManual&&!comprobante)||subiendoComp} onClick={()=>crearPedido.mutate()}>
              {crearPedido.isPending||subiendoComp ? <span className="spinner"/> : '✅ Hacer pedido'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
