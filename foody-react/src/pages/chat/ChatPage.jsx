import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { conversacionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mensaje, setMensaje] = useState('');
  const [showConvList, setShowConvList] = useState(!conversacionId);
  const msgEndRef = useRef(null);

  const { data: conversaciones, isLoading: convLoading } = useQuery({
    queryKey: ['conversaciones'],
    queryFn: () => chatAPI.conversaciones().then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: chatData, isLoading: msgLoading } = useQuery({
    queryKey: ['mensajes', conversacionId],
    queryFn: () => chatAPI.mensajes(conversacionId).then(r => r.data),
    enabled: !!conversacionId,
    refetchInterval: 5000,
  });

  const enviarMsg = useMutation({
    mutationFn: (d) => chatAPI.enviarMensaje(conversacionId, d),
    onSuccess: () => {
      setMensaje('');
      queryClient.invalidateQueries({ queryKey: ['mensajes', conversacionId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al enviar'),
  });

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.mensajes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    enviarMsg.mutate({ contenido: mensaje, tipo: 'texto' });
  };

  const otroParticipante = (conv) => {
    const otroId = conv.participante_1_id === user?.id ? conv.participante_2_id : conv.participante_1_id;
    return conv.participante_1_id === user?.id ? conv.participante2 : conv.participante1;
  };

  const convActual = conversaciones?.find(c => c.id === Number(conversacionId));

  if (showConvList || !conversacionId) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <button className="back-btn-inline" onClick={()=>navigate(-1)}>←</button>
          <span style={{fontWeight:700}}>💬 Mensajes</span>
          <span/>
        </header>
        <main className="app-main" style={{paddingTop:'70px'}}>
          {convLoading && [1,2,3].map(i=><div key={i} className="skeleton-card"/>)}
          {conversaciones?.length === 0 && (
            <div className="empty-state" style={{textAlign:'center',padding:'60px 20px',color:'#888'}}>
              <p style={{fontSize:'3rem'}}>💬</p>
              <p>No tienes conversaciones aún.</p>
            </div>
          )}
          {conversaciones?.map(conv => {
            const otro = otroParticipante(conv);
            const ultimo = conv.ultimo_mensaje;
            return (
              <div key={conv.id}
                style={{background:'#161616',border:'1px solid #222',borderRadius:'14px',padding:'14px 16px',margin:'0 16px 10px',cursor:'pointer'}}
                onClick={() => { setShowConvList(false); navigate(`/chat/${conv.id}`); }}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#2a2a2a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>💬</div>
                  <div style={{flex:1}}>
                    <strong style={{fontSize:'.85rem'}}>{otro?.nombre_completo || 'Usuario'}</strong>
                    <p style={{fontSize:'.78rem',color:'#888',marginTop:'2px'}}>{ultimo?.contenido?.substring(0,60) || 'Sin mensajes'}</p>
                  </div>
                  <small style={{color:'#555',fontSize:'.7rem'}}>{conv.tipo.replace('_',' · ')}</small>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout" style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <header className="app-header">
        <button className="back-btn-inline" onClick={()=>{ setShowConvList(true); navigate('/chat'); }}>←</button>
        <div style={{flex:1,textAlign:'center'}}>
          <span style={{fontWeight:700,fontSize:'.85rem'}}>
            {convActual ? otroParticipante(convActual)?.nombre_completo || 'Chat' : 'Chat'}
          </span>
        </div>
        <span/>
      </header>

      <div style={{flex:1,overflowY:'auto',padding:'80px 16px 20px',display:'flex',flexDirection:'column',gap:'8px'}}>
        {msgLoading && <div className="loading-screen">Cargando mensajes...</div>}
        {chatData?.mensajes?.map(msg => {
          const esMio = msg.sender_id === user?.id;
          return (
            <div key={msg.id} style={{display:'flex',flexDirection:'column',alignItems:esMio?'flex-end':'flex-start'}}>
              <div style={{
                maxWidth:'80%',
                background: esMio ? 'rgba(64,224,208,.15)' : '#161616',
                border: `1px solid ${esMio ? '#D21E0F' : '#2a2a2a'}`,
                borderRadius: esMio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding:'10px 14px',
              }}>
                {msg.tipo === 'imagen' ? (
                  <img src={msg.imagen_path} alt="img" style={{maxWidth:'200px',borderRadius:'8px'}} />
                ) : (
                  <p style={{fontSize:'.85rem',wordBreak:'break-word'}}>{msg.contenido}</p>
                )}
                <div style={{display:'flex',justifyContent:'flex-end',gap:'3px',marginTop:'4px'}}>
                  <small style={{fontSize:'.65rem',color:'#666'}}>
                    {new Date(msg.created_at).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
                  </small>
                  {esMio && (
                    <span style={{fontSize:'.65rem',color: msg.estado === 'leido' ? '#D21E0F' : '#666'}}>
                      {msg.estado === 'leido' ? '✓✓' : msg.estado === 'entregado' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={msgEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        display:'flex',gap:'8px',padding:'12px 16px',
        borderTop:'1px solid #222',background:'#0a0a0a'
      }}>
        <input
          type="text"
          value={mensaje}
          onChange={e=>setMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{flex:1, background:'#161616',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'12px 16px',color:'white',fontFamily:'Outfit'}}
        />
        <button type="submit" disabled={enviarMsg.isPending||!mensaje.trim()}
          style={{background:'#D21E0F',border:'none',borderRadius:'12px',padding:'0 16px',color:'#000',fontWeight:700,fontSize:'.85rem',cursor:'pointer'}}>
          Enviar
        </button>
      </form>
    </div>
  );
}
