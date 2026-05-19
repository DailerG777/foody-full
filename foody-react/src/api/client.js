import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foody_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) { localStorage.removeItem('foody_token'); localStorage.removeItem('foody_user'); window.location.href = '/login'; }
    if (error.response?.status === 422) { const errors = error.response?.data?.errors || {}; error.validationMessage = Object.values(errors).flat()[0] || error.response?.data?.message; }
    return Promise.reject(error);
  }
);

export default api;
export const authAPI        = { register:(d)=>api.post('/auth/register',d), login:(d)=>api.post('/auth/login',d), logout:()=>api.post('/auth/logout'), me:()=>api.get('/auth/me'), updateProfile:(d)=>api.put('/auth/profile',d), changePassword:(d)=>api.put('/auth/password',d) };
export const restaurantesAPI= { listar:(p)=>api.get('/restaurantes',{params:p}), ver:(slug)=>api.get(`/restaurantes/${slug}`), explorar:(p)=>api.get('/explorar',{params:p}), miPanel:()=>api.get('/restaurante/mi-restaurante'), actualizar:(d)=>api.put('/restaurante/mi-restaurante',d), pedidos:(p)=>api.get('/restaurante/pedidos',{params:p}), stats:(p)=>api.get('/restaurante/estadisticas',{params:p}) };
export const productosAPI   = { crear:(d)=>api.post('/restaurante/productos',d), actualizar:(id,d)=>api.put(`/restaurante/productos/${id}`,d), eliminar:(id)=>api.delete(`/restaurante/productos/${id}`), toggleDisponible:(id)=>api.patch(`/restaurante/productos/${id}/disponibilidad`) };
export const pedidosAPI     = { crear:(d)=>api.post('/pedidos',d), misPedidos:(p)=>api.get('/pedidos',{params:p}), ver:(id)=>api.get(`/pedidos/${id}`), actualizarEstado:(id,data)=>api.put(`/pedidos/${id}/estado`,data) };
export const pagosAPI       = { iniciar:(d)=>api.post('/pagos/iniciar',d), consultarEstado:(ref)=>api.get(`/pagos/${ref}/estado`), subirComprobante:(d)=>api.post('/pagos/subir-comprobante',d) };
export const repartidorAPI  = { pedidosDisponibles:()=>api.get('/repartidor/pedidos-disponibles'), tomarPedido:(id)=>api.post(`/repartidor/pedidos/${id}/tomar`), actualizarUbicacion:(d)=>api.put('/repartidor/ubicacion',d), stats:()=>api.get('/repartidor/estadisticas'), toggleDisponibilidad:(d)=>api.put('/repartidor/disponibilidad',d), obtenerUbicacion:(pedidoId)=>api.get(`/pedidos/${pedidoId}/repartidor-ubicacion`) };
export const adminAPI       = { dashboard:()=>api.get('/admin/dashboard'), usuarios:(p)=>api.get('/admin/usuarios',{params:p}), toggleUsuario:(id)=>api.put(`/admin/usuarios/${id}/estado`), restaurantes:()=>api.get('/admin/restaurantes'), aprobarRestaurante:(id)=>api.put(`/admin/restaurantes/${id}/aprobar`), pedidos:(p)=>api.get('/admin/pedidos',{params:p}), pagos:(p)=>api.get('/admin/pagos',{params:p}), stats:()=>api.get('/admin/estadisticas'), cupones:()=>api.get('/admin/cupones'), crearCupon:(d)=>api.post('/admin/cupones',d), actualizarCupon:(id,d)=>api.put(`/admin/cupones/${id}`,d), eliminarCupon:(id)=>api.delete(`/admin/cupones/${id}`) };
export const chatAPI        = { conversaciones:()=>api.get('/chat/conversaciones'), crearConversacion:(d)=>api.post('/chat/conversaciones',d), mensajes:(id)=>api.get(`/chat/conversaciones/${id}`), enviarMensaje:(id,d)=>api.post(`/chat/conversaciones/${id}/mensajes`,d), marcarLeido:(id)=>api.put(`/mensajes/${id}/leer`) };
export const inventarioAPI  = { listar:()=>api.get('/restaurante/inventario'), crear:(d)=>api.post('/restaurante/inventario',d), actualizar:(id,d)=>api.put(`/restaurante/inventario/${id}`,d), eliminar:(id)=>api.delete(`/restaurante/inventario/${id}`), alertas:()=>api.get('/restaurante/inventario/alertas'), movimientos:(id)=>api.get(`/restaurante/inventario/${id}/movimientos`), registrarMovimiento:(id,d)=>api.post(`/restaurante/inventario/${id}/movimientos`,d) };
export const cajaAPI        = { listar:(p)=>api.get('/restaurante/caja',{params:p}), crear:(d)=>api.post('/restaurante/caja',d), ver:(id)=>api.get(`/restaurante/caja/${id}`), eliminar:(id)=>api.delete(`/restaurante/caja/${id}`) };
export const nominaAPI      = { listar:()=>api.get('/restaurante/nomina'), crear:(d)=>api.post('/restaurante/nomina',d), actualizar:(id,d)=>api.put(`/restaurante/nomina/${id}`,d), eliminar:(id)=>api.delete(`/restaurante/nomina/${id}`), pagar:(id)=>api.post(`/restaurante/nomina/${id}/pagar`) };
export const subcuentasAPI  = { listar:()=>api.get('/restaurante/subcuentas'), crear:(d)=>api.post('/restaurante/subcuentas',d), actualizar:(id,d)=>api.put(`/restaurante/subcuentas/${id}`,d), eliminar:(id)=>api.delete(`/restaurante/subcuentas/${id}`), toggleActivo:(id)=>api.patch(`/restaurante/subcuentas/${id}/toggle`) };
export const resenasAPI     = { crear:(d)=>api.post('/resenas',d), listar:(slug)=>api.get(`/resenas/${slug}`) };
