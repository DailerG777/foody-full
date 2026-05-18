import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChatRepartidorPage() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const msgsEnd = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    chatAPI.conversaciones().then(r => setConversaciones(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    msgsEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    if (selectedConv) {
      chatAPI.mensajes(selectedConv).then(r => setMensajes(r.data || []));
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        chatAPI.mensajes(selectedConv).then(r => setMensajes(r.data || []));
      }, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !selectedConv) return;
    try {
      await chatAPI.enviarMensaje(selectedConv, { contenido: texto, tipo: 'texto' });
      setTexto('');
      const r = await chatAPI.mensajes(selectedConv);
      setMensajes(r.data || []);
    } catch (e) { toast.error('Error al enviar'); }
  };

  if (loading) return <div className="loading-screen">Cargando chat...</div>;

  return (
    <div className="panel-layout chat-panel">
      <div className="panel-header"><h1>Chat</h1></div>
      <div className="chat-container">
        <div className="chat-sidebar">
          {conversaciones.map(c => {
            const otro = c.participante_1_id === user?.id ? c.participante_2 : c.participante_1;
            return (
              <div key={c.id} className={`chat-conv-item ${selectedConv === c.id ? 'active' : ''}`} onClick={() => setSelectedConv(c.id)}>
                <span className="conv-nombre">{otro?.nombre || 'Usuario'}</span>
                <span className="conv-tipo tag">{c.tipo?.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
          {conversaciones.length === 0 && <p className="empty-state">Sin conversaciones</p>}
        </div>
        <div className="chat-main">
          {selectedConv ? (
            <>
              <div className="chat-mensajes">
                {mensajes.map(m => (
                  <div key={m.id} className={`mensaje ${m.sender_id === user?.id ? 'propio' : 'otro'}`}>
                    <div className="mensaje-burbuja">
                      <p>{m.contenido}</p>
                      <span className="mensaje-hora">{new Date(m.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                <div ref={msgsEnd} />
              </div>
              <form className="chat-input" onSubmit={enviar}>
                <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe un mensaje..." />
                <button type="submit" className="btn-auth btn-sm">Enviar</button>
              </form>
            </>
          ) : (
            <div className="empty-state">Selecciona una conversación</div>
          )}
        </div>
      </div>
    </div>
  );
}
