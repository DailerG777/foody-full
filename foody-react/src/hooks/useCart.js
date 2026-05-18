import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(persist(
  (set, get) => ({
    items: [], restaurante: null,
    add: (p) => set(s => { const ex=s.items.find(i=>i.id===p.id); return ex?{items:s.items.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i)}:{items:[...s.items,{id:p.id,nombre:p.nombre,precio:p.precio,emoji:p.emoji,qty:1}]}; }),
    remove: (id) => set(s => { const item=s.items.find(i=>i.id===id); if(!item)return s; return item.qty===1?{items:s.items.filter(i=>i.id!==id)}:{items:s.items.map(i=>i.id===id?{...i,qty:i.qty-1}:i)}; }),
    getQty: (id) => get().items.find(i=>i.id===id)?.qty||0,
    totalItems: () => get().items.reduce((a,i)=>a+i.qty,0),
    totalPrice: () => get().items.reduce((a,i)=>a+i.precio*i.qty,0),
    setRestaurante: (r) => set({ restaurante: r }),
    clear: () => set({ items:[], restaurante:null }),
    toApiPayload: () => get().items.map(i=>({producto_id:i.id,cantidad:i.qty})),
  }),
  { name:'foody_cart', storage:createJSONStorage(()=>sessionStorage) }
));
