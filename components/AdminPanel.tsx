
import React, { useState, useEffect } from 'react';
import { AppConfig, Order, CakeSize, Flavor, Filling, DecorationInfo, CakeColor, Notification } from '../types';
import { db, handleFirestoreError, OperationType, safeJsonStringify } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (_newConfig: AppConfig) => void;
  onRefreshFromSheets: () => Promise<void>;
  orders: Order[];
  onDeleteOrder: (_id: string) => void;
  onUpdateOrderStatus: (_id: string, _status: 'PENDING' | 'COMPLETED') => void;
  onExit: () => void;
  user: User | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, onRefreshFromSheets, orders, onDeleteOrder, onUpdateOrderStatus, onExit, user }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SIZES' | 'FLAVORS' | 'DECORATIONS' | 'COLORS' | 'GALLERY' | 'PRICES' | 'PAYMENTS' | 'SETTINGS' | 'NOTIFICATIONS' | 'SPECIALS'>('ORDERS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!db || !user || user.email !== 'enmanueljose3431@gmail.com') {
      setNotifications([]);
      return;
    }
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
      setNotifications(notifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "notifications");
    });
    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const isAdminAuthenticated = user && user.email === 'enmanueljose3431@gmail.com';

  useEffect(() => {
    if (isSaving) {
      const timer = setTimeout(() => setIsSaving(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  const updateConfig = (newPart: Partial<AppConfig>) => {
    setIsSaving(true);
    onUpdateConfig({ ...config, ...newPart });
  };

  // --- MOLDES ---
  const updateSize = (id: string, f: keyof CakeSize, v: any) => {
    updateConfig({ sizes: config.sizes.map(s => s.id === id ? { ...s, [f]: v } : s) });
  };
  const addSize = () => {
    const n: CakeSize = { id: `sz_${Date.now()}`, diameter: 14, heightType: 'SHORT', portions: '8 Porc', basePrice: 20, costMultiplier: 1.0 };
    updateConfig({ sizes: [...config.sizes, n] });
  };
  const removeSize = (id: string) => {
    updateConfig({ sizes: config.sizes.filter(s => s.id !== id) });
  };

  // --- SABORES Y RELLENOS ---
  const updateFlavor = (id: string, f: keyof Flavor, v: any) => {
    updateConfig({ flavors: config.flavors.map(fl => fl.id === id ? { ...fl, [f]: v } : fl) });
  };
  const addFlavor = () => {
    const n: Flavor = { id: `fl_${Date.now()}`, name: 'Nuevo', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ flavors: [...config.flavors, n] });
  };
  const removeFlavor = (id: string) => {
    updateConfig({ flavors: config.flavors.filter(f => f.id !== id) });
  };

  const updateFilling = (id: string, f: keyof Filling, v: any) => {
    updateConfig({ fillings: config.fillings.map(fill => fill.id === id ? { ...fill, [f]: v } : fill) });
  };
  const addFilling = () => {
    const n: Filling = { id: `fill_${Date.now()}`, name: 'Nuevo', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ fillings: [...config.fillings, n] });
  };
  const removeFilling = (id: string) => {
    updateConfig({ fillings: config.fillings.filter(f => f.id !== id) });
  };

  // --- PRODUCTOS ESPECIALES ---
  const addSpecialProduct = () => {
    const n = {
      id: `sp_${Date.now()}`,
      title: 'Nuevo Producto',
      description: 'Descripción del producto',
      imageUrl: 'https://picsum.photos/seed/new/400/300',
      characteristics: ['Característica 1'],
      price: 10
    };
    updateConfig({ specialProducts: [...(config.specialProducts || []), n] });
  };

  const removeSpecialProduct = (id: string) => {
    updateConfig({ specialProducts: (config.specialProducts || []).filter(p => p.id !== id) });
  };

  const updateSpecialProduct = (id: string, field: string, value: any) => {
    updateConfig({
      specialProducts: (config.specialProducts || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const handleSpecialImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => updateSpecialProduct(id, 'imageUrl', r.result as string);
      r.readAsDataURL(file);
    }
  };

  // --- COLORES ---
  const addColor = () => {
    const n: CakeColor = { name: 'Nuevo Color', hex: '#E2E2E2', isSaturated: false, priceModifier: 0 };
    updateConfig({ colors: [...config.colors, n] });
  };
  const removeColor = (idx: number) => {
    updateConfig({ colors: config.colors.filter((_, i) => i !== idx) });
  };
  const updateColor = (idx: number, field: keyof CakeColor, value: any) => {
    const next = [...config.colors];
    next[idx] = { ...next[idx], [field]: value };
    updateConfig({ colors: next });
  };

  // --- DECORACIONES ---
  const updateDecoration = (id: string, f: keyof DecorationInfo, v: any) => {
    const next = { ...config.decorations };
    next[id] = { ...next[id], [f]: v };
    updateConfig({ decorations: next });
  };

  const handleImageUpload = (id: string, type: 'flavor' | 'filling' | 'decoration', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        const b64 = r.result as string;
        if (type === 'flavor') updateFlavor(id, 'textureUrl', b64);
        else if (type === 'filling') updateFilling(id, 'textureUrl', b64);
        else if (type === 'decoration') updateDecoration(id, 'textureUrl', b64);
      };
      r.readAsDataURL(file);
    }
  };

  // --- GALERÍA DE INSPIRACIÓN ---
  const addGalleryItem = async () => {
    const newItem = { url: 'https://picsum.photos/seed/new/600/800', style: 'liso', description: 'Nueva foto de inspiración' };
    try {
      await addDoc(collection(db, "inspiration"), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "inspiration");
    }
  };

  const removeGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "inspiration", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `inspiration/${id}`);
    }
  };

  const updateGalleryItem = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, "inspiration", id), { [field]: value });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `inspiration/${id}`);
    }
  };

  const handleGalleryImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => updateGalleryItem(id, 'url', r.result as string);
      r.readAsDataURL(file);
    }
  };

  const menuItems = [
    { id: 'ORDERS', label: 'Ventas', icon: 'analytics', badge: 0 },
    { id: 'NOTIFICATIONS', label: 'Notificaciones', icon: 'notifications', badge: unreadCount },
    { id: 'SPECIALS', label: 'Especiales', icon: 'auto_awesome', badge: 0 },
    { id: 'SIZES', label: 'Moldes', icon: 'straighten', badge: 0 },
    { id: 'FLAVORS', label: 'Sabores/Rellenos', icon: 'restaurant_menu', badge: 0 },
    { id: 'DECORATIONS', label: 'Estilos', icon: 'auto_fix_high', badge: 0 },
    { id: 'COLORS', label: 'Colores', icon: 'palette', badge: 0 },
    { id: 'GALLERY', label: 'Galería', icon: 'collections', badge: 0 },
    { id: 'PRICES', label: 'Precios Extras', icon: 'sell', badge: 0 },
    { id: 'PAYMENTS', label: 'Banco/Pagos', icon: 'account_balance', badge: 0 },
    { id: 'SETTINGS', label: 'Marca/Logo', icon: 'settings', badge: 0 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-quicksand overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-[120] transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col shadow-2xl`}>
        <div className="p-8 border-b border-slate-800 text-white font-display uppercase tracking-widest flex items-center gap-3">
          <span className="material-icons-round text-primary">cake</span>
          Admin Mathi
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-800'}`}>
              <div className="flex items-center gap-4">
                <span className="material-icons-round text-xl">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={onExit} className="w-full bg-slate-800 hover:bg-red-600 text-white py-4 rounded-xl font-black uppercase text-xs transition-colors">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600"><span className="material-icons-round">menu</span></button>
             <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{menuItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] animate-pulse">
              <span className="material-icons-round text-sm">sync</span>
              Sincronizando...
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar bg-slate-50/30">
          <div className="max-w-6xl mx-auto space-y-10 pb-20">

            {activeTab === 'ORDERS' && (
               <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-black uppercase text-slate-800">Pedidos ({orders.length})</h3>
                     <button 
                        onClick={async () => {
                           if (window.confirm("¿Deseas sincronizar todos los pedidos actuales de Firestore a Google Sheets?")) {
                              setIsSaving(true);
                              try {
                                 const res = await fetch('/api/sync-all-orders-to-sheets', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: safeJsonStringify(orders)
                                 });
                                 if (res.ok) {
                                    alert("✅ Pedidos sincronizados exitosamente");
                                 } else {
                                    const errorData = await res.json();
                                    alert(`❌ Error al sincronizar: ${errorData.message || errorData.error || 'Error desconocido'}`);
                                 }
                              } catch (_e) {
                                 alert("❌ Error de conexión");
                              } finally {
                                 setIsSaving(false);
                              }
                           }
                        }}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-700 transition-all"
                     >
                        <span className="material-icons-round text-xs">sync</span>
                        Sincronizar Excel
                     </button>
                  </div>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aún no hay pedidos registrados</p>
                  </div>
                ) : (
                  orders.map(o => (
                    <div key={o.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center font-display text-primary border text-xl shrink-0">{o.id.slice(-4)}</div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 uppercase text-sm">{o.customerName}</h4>
                        <p className="text-[9px] text-slate-400 font-bold mb-2">{o.date}</p>
                        <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{o.details}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3 shrink-0">
                        <div className="flex flex-col items-end">
                            <p className="text-3xl font-display text-primary">${o.total.toFixed(2)}</p>
                            <div className="flex flex-col items-end gap-1 mt-1">
                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${o.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {o.status === 'COMPLETED' ? 'Entregado' : 'Pendiente'}
                                </span>
                                {o.paymentStrategy === 'FIFTY_PERCENT' && (
                                    <div className="flex gap-2 text-[8px] font-bold uppercase">
                                        <span className="text-green-600">Pagado: ${(o.total / 2).toFixed(2)}</span>
                                        <span className="text-rose-600">Pend: ${(o.total / 2).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-32">
                           {o.status === 'PENDING' && (
                             <button 
                                onClick={() => onUpdateOrderStatus(o.id, 'COMPLETED')}
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-md active:scale-95"
                             >
                                <span className="material-icons-round text-xs">check_circle</span>
                                ENTREGADO
                             </button>
                           )}
                           {confirmDeleteId === o.id ? (
                             <div className="flex gap-2">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onDeleteOrder(o.id);
                                   setConfirmDeleteId(null);
                                 }}
                                 className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 shadow-sm"
                               >
                                 SÍ, ELIMINAR
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setConfirmDeleteId(null);
                                 }}
                                 className="flex-1 bg-slate-200 text-slate-600 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 shadow-sm"
                               >
                                 NO
                               </button>
                             </div>
                           ) : (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setConfirmDeleteId(o.id);
                               }}
                               className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-600 text-slate-400 hover:text-white py-2.5 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 shadow-sm border border-slate-200"
                             >
                               <span className="material-icons-round text-sm">delete_forever</span>
                               ELIMINAR
                             </button>
                           )}

                           {(o.referenceImage || o.paymentProof) && (
                              <div className="flex gap-2 mt-1">
                                {o.referenceImage && (
                                  <button onClick={() => setViewingImage(o.referenceImage!)} className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-[8px] font-black uppercase border border-blue-100">
                                    <span className="material-icons-round text-xs">image</span> REF
                                  </button>
                                )}
                                {o.paymentProof && (
                                  <button onClick={() => setViewingImage(o.paymentProof!)} className="flex-1 flex items-center justify-center gap-1 bg-amber-50 text-amber-600 py-2 rounded-xl text-[8px] font-black uppercase border border-amber-100">
                                    <span className="material-icons-round text-xs">receipt</span> PAGO
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
             )}

            {activeTab === 'NOTIFICATIONS' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-500">Notificaciones de Usuarios</h3>
                  {isAdminAuthenticated && notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                
                {!isAdminAuthenticated ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-10 text-center">
                    <span className="material-icons-round text-amber-500 text-5xl mb-4">warning</span>
                    <h3 className="text-lg font-display text-amber-900 uppercase mb-2">Acceso Restringido</h3>
                    <p className="text-amber-700 text-xs font-medium max-w-md mx-auto">
                      Para ver las notificaciones en tiempo real, debes iniciar sesión con tu cuenta de Google de administrador ({'enmanueljose3431@gmail.com'}).
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${n.read ? 'bg-white border-slate-100 opacity-60' : 'bg-primary/5 border-primary/20 shadow-sm'}`}>
                        <div className="flex gap-4 items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.type === 'ORDER_MODIFIED' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            <span className="material-icons-round text-lg">{n.type === 'ORDER_MODIFIED' ? 'edit' : 'shopping_cart'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{n.message}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {n.userName} • {new Date(n.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!n.read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="p-2 text-slate-400 hover:text-primary transition-all"
                              title="Marcar como leída"
                            >
                              <span className="material-icons-round">done</span>
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(n.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-all"
                            title="Eliminar"
                          >
                            <span className="material-icons-round">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'SPECIALS' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-800">Productos Especiales (Carrusel)</h3>
                  <button onClick={addSpecialProduct} className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-icons-round text-sm">add</span>
                    Añadir Producto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(config.specialProducts || []).map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6 relative group">
                      <button onClick={() => removeSpecialProduct(p.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-icons-round">delete</span>
                      </button>
                      
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="relative w-full md:w-40 h-40 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-md shrink-0">
                          <img src={p.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleSpecialImageUpload(p.id, e)} />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full pointer-events-none">
                            <span className="material-icons-round text-[10px]">edit</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Título</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 rounded-xl p-3 font-black text-sm border-none" 
                              value={p.title} 
                              onChange={(e) => updateSpecialProduct(p.id, 'title', e.target.value)} 
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Precio ($)</label>
                            <input 
                              type="number" 
                              className="w-full bg-slate-50 rounded-xl p-3 font-black text-sm border-none" 
                              value={p.price} 
                              onChange={(e) => updateSpecialProduct(p.id, 'price', Number(e.target.value))} 
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Descripción</label>
                            <textarea 
                              className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border-none h-20 resize-none" 
                              value={p.description} 
                              onChange={(e) => updateSpecialProduct(p.id, 'description', e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase text-slate-400">Características</h4>
                          <button 
                            onClick={() => {
                              const next = [...p.characteristics, 'Nueva característica'];
                              updateSpecialProduct(p.id, 'characteristics', next);
                            }}
                            className="text-primary text-[10px] font-black uppercase"
                          >
                            + Añadir
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {p.characteristics.map((char, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input 
                                type="text" 
                                className="flex-1 bg-slate-50 rounded-lg p-2 text-[10px] font-bold border-none" 
                                value={char} 
                                onChange={(e) => {
                                  const next = [...p.characteristics];
                                  next[idx] = e.target.value;
                                  updateSpecialProduct(p.id, 'characteristics', next);
                                }} 
                              />
                              <button 
                                onClick={() => {
                                  const next = p.characteristics.filter((_, i) => i !== idx);
                                  updateSpecialProduct(p.id, 'characteristics', next);
                                }}
                                className="text-slate-300 hover:text-red-500"
                              >
                                <span className="material-icons-round text-sm">remove_circle</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'SIZES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button onClick={addSize} className="bg-primary/5 border-2 border-dashed border-primary/20 p-10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-all min-h-[150px]">
                  <span className="material-icons-round text-primary text-5xl">add_circle</span>
                  <span className="text-[10px] font-black uppercase text-primary">Nuevo Molde</span>
                </button>
                {config.sizes.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative group">
                    <button onClick={() => removeSize(s.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><span className="material-icons-round text-sm">delete</span></button>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Diámetro</label>
                         <input type="number" className="w-full bg-slate-50 rounded-xl p-3 font-bold border-none text-sm" value={s.diameter} onChange={(e) => updateSize(s.id, 'diameter', parseInt(e.target.value))} />
                       </div>
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Altura</label>
                         <select className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold border-none" value={s.heightType} onChange={(e) => updateSize(s.id, 'heightType', e.target.value)}>
                            <option value="SHORT">BAJO</option><option value="TALL">ALTO</option>
                         </select>
                       </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400">Precio Base ($)</label>
                      <input type="number" className="w-full bg-slate-50 rounded-xl p-3 font-bold border-none text-sm" value={s.basePrice} onChange={(e) => updateSize(s.id, 'basePrice', parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400">Factor Conversión</label>
                      <input type="number" step="0.1" className="w-full bg-slate-50 rounded-xl p-3 font-bold border-none text-sm" value={s.costMultiplier} onChange={(e) => updateSize(s.id, 'costMultiplier', parseFloat(e.target.value))} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'FLAVORS' && (
              <div className="space-y-10">
                <section>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black uppercase text-slate-500">Sabores de Bizcocho</h3>
                     <button onClick={addFlavor} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Añadir Sabor</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.flavors.map(f => (
                      <div key={f.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-6 group">
                         <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                            {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }} />}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(f.id, 'flavor', e)} />
                         </div>
                         <div className="flex-1">
                            <input type="text" className="w-full bg-transparent font-black text-sm border-none p-0 mb-1" value={f.name} onChange={(e) => updateFlavor(f.id, 'name', e.target.value)} />
                            <div className="flex items-center gap-2">
                               <span className="text-[8px] font-bold uppercase text-slate-400">Extra:</span>
                               <input type="number" className="w-16 bg-slate-50 rounded-lg p-1 text-[10px] font-bold border-none" value={f.priceModifier} onChange={(e) => updateFlavor(f.id, 'priceModifier', parseFloat(e.target.value))} />
                            </div>
                         </div>
                         <button onClick={() => removeFlavor(f.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-icons-round">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black uppercase text-slate-500">Rellenos Disponibles</h3>
                     <button onClick={addFilling} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Añadir Relleno</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fillings.map(f => (
                      <div key={f.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-6 group">
                         <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 shrink-0">
                            {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }} />}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(f.id, 'filling', e)} />
                         </div>
                         <div className="flex-1">
                            <input type="text" className="w-full bg-transparent font-black text-sm border-none p-0 mb-1" value={f.name} onChange={(e) => updateFilling(f.id, 'name', e.target.value)} />
                            <div className="flex items-center gap-2">
                               <span className="text-[8px] font-bold uppercase text-slate-400">Extra:</span>
                               <input type="number" className="w-16 bg-slate-50 rounded-lg p-1 text-[10px] font-bold border-none" value={f.priceModifier} onChange={(e) => updateFilling(f.id, 'priceModifier', parseFloat(e.target.value))} />
                            </div>
                         </div>
                         <button onClick={() => removeFilling(f.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-icons-round">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'DECORATIONS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.values(config.decorations).map((dec: DecorationInfo) => (
                  <div key={dec.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-md shrink-0">
                           {dec.textureUrl ? <img src={dec.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><span className="material-icons-round text-4xl">broken_image</span></div>}
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(dec.id, 'decoration', e)} />
                        </div>
                        <div className="flex-1">
                           <input type="text" className="w-full bg-transparent font-display text-xl border-none p-0 mb-2" value={dec.label} onChange={(e) => updateDecoration(dec.id, 'label', e.target.value)} />
                           <div className="flex items-center gap-4">
                              <label className="text-[10px] font-black uppercase text-slate-400">Suplemento:</label>
                              <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                                 <span className="text-primary font-bold">$</span>
                                 <input type="number" className="w-16 bg-transparent border-none font-black text-sm p-0" value={dec.priceModifier} onChange={(e) => updateDecoration(dec.id, 'priceModifier', parseFloat(e.target.value))} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'COLORS' && (
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-sm font-black uppercase text-slate-800">Paleta de Colores de Crema</h3>
                     <button onClick={addColor} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                        <span className="material-icons-round text-sm">add</span>
                        Añadir Color
                     </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {config.colors.map((c, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-3 p-5 bg-slate-50 rounded-3xl relative group shadow-sm border border-slate-100">
                          <button onClick={() => removeColor(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <span className="material-icons-round text-sm">close</span>
                          </button>
                          <input type="color" className="w-16 h-16 rounded-full border-4 border-white shadow-md p-0 overflow-hidden cursor-pointer" value={c.hex} onChange={(e) => updateColor(idx, 'hex', e.target.value)} />
                          <input type="text" className="w-full text-center bg-transparent border-none p-0 font-black text-[10px] uppercase tracking-wider" value={c.name} onChange={(e) => updateColor(idx, 'name', e.target.value)} />
                          
                          <div className="flex flex-col gap-2 w-full pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                               <span className="text-[8px] font-black uppercase text-slate-400">Incremento $</span>
                               <input type="number" step="0.5" className="w-12 bg-white border-none rounded p-1 text-[9px] font-bold text-center" value={c.priceModifier || 0} onChange={(e) => updateColor(idx, 'priceModifier', parseFloat(e.target.value))} />
                            </div>
                            <label className="flex items-center justify-between cursor-pointer">
                               <span className="text-[8px] font-black uppercase text-slate-400">Saturado</span>
                               <input type="checkbox" className="rounded text-primary focus:ring-primary w-3 h-3" checked={c.isSaturated} onChange={(e) => updateColor(idx, 'isSaturated', e.target.checked)} />
                            </label>
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
            )}

            {activeTab === 'GALLERY' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-800">Galería de Inspiración</h3>
                  <button 
                    onClick={addGalleryItem}
                    className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <span className="material-icons-round text-sm">add_a_photo</span>
                    Añadir Foto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {config.inspirationGallery.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 group relative">
                      <button 
                        onClick={() => item.id && removeGalleryItem(item.id)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-icons-round text-sm">close</span>
                      </button>
                      
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                        <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => item.id && handleGalleryImageUpload(item.id, e)} 
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full pointer-events-none">
                          <span className="material-icons-round text-xs">edit</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Estilo Asociado</label>
                          <select 
                            className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold border-none"
                            value={item.style}
                            onChange={(e) => item.id && updateGalleryItem(item.id, 'style', e.target.value)}
                          >
                            {Object.keys(config.decorations).map(k => (
                              <option key={k} value={k}>{config.decorations[k].label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Descripción</label>
                          <textarea 
                            className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold border-none h-20 resize-none"
                            value={item.description}
                            onChange={(e) => item.id && updateGalleryItem(item.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'PRICES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[3rem] border border-slate-200">
                  <h3 className="text-xs font-black uppercase text-slate-800 mb-6">Precios de Toppers</h3>
                  <div className="space-y-4">
                    {Object.keys(config.topperPrices).map(k => (
                      <div key={k} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                         <span className="text-[10px] font-black uppercase text-slate-600">{k === 'none' ? 'Sin Topper' : k === 'generic' ? 'Genérico' : k === 'personalized' ? 'Personalizado' : 'Topper+Piezas'}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-primary font-bold">$</span>
                            <input type="number" className="w-20 bg-white border-none rounded-lg p-2 font-bold text-sm" value={config.topperPrices[k]} onChange={(e) => {
                               const next = { ...config.topperPrices, [k]: parseFloat(e.target.value) };
                               updateConfig({ topperPrices: next });
                            }} />
                         </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="bg-white p-8 rounded-[3rem] border border-slate-200">
                   <h3 className="text-xs font-black uppercase text-slate-800 mb-6">Otros Suplementos</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-600">Esferas Decorativas</span>
                         <input type="number" className="w-24 bg-slate-50 border-none rounded-xl p-3 font-bold text-sm" value={config.spheresPrice} onChange={(e) => updateConfig({ spheresPrice: parseFloat(e.target.value) })} />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-600">Recargo Color Saturado</span>
                         <input type="number" className="w-24 bg-slate-50 border-none rounded-xl p-3 font-bold text-sm" value={config.saturatedColorSurcharge} onChange={(e) => updateConfig({ saturatedColorSurcharge: parseFloat(e.target.value) })} />
                      </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'PAYMENTS' && (
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm max-w-3xl">
                  <h3 className="text-sm font-black uppercase text-slate-800 mb-8">Datos Bancarios para Clientes</h3>
                  <div className="space-y-6">
                     {Object.keys(config.paymentDetails).map(k => (
                       <div key={k} className="flex flex-col gap-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2">{k}</label>
                          <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm" value={(config.paymentDetails as any)[k]} onChange={(e) => {
                             const next = { ...config.paymentDetails, [k]: e.target.value };
                             updateConfig({ paymentDetails: next });
                          }} />
                       </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'SETTINGS' && (
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm max-w-3xl">
                  <h3 className="text-sm font-black uppercase text-slate-800 mb-8">Ajustes de Marca y Tema</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden shrink-0">
                           {config.appTheme.logoUrl ? <img src={config.appTheme.logoUrl} className="w-full h-full object-contain" /> : <span className="material-icons-round text-slate-300">add_photo_alternate</span>}
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const r = new FileReader();
                                 r.onloadend = () => updateConfig({ appTheme: { ...config.appTheme, logoUrl: r.result as string } });
                                 r.readAsDataURL(file);
                              }
                           }} />
                        </div>
                        <div className="flex-1">
                           <label className="text-[9px] font-black uppercase text-slate-400">Nombre de la Pastelería</label>
                           <input type="text" className="w-full bg-transparent font-display text-2xl border-none p-0" value={config.appTheme.brandName} onChange={(e) => updateConfig({ appTheme: { ...config.appTheme, brandName: e.target.value } })} />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-2">WhatsApp Ventas</label>
                           <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm" value={config.appTheme.whatsappNumber} onChange={(e) => updateConfig({ appTheme: { ...config.appTheme, whatsappNumber: e.target.value } })} />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Color Primario</label>
                           <input type="color" className="w-full h-12 bg-slate-50 border-none rounded-2xl p-1 cursor-pointer" value={config.appTheme.primaryColor} onChange={(e) => updateConfig({ appTheme: { ...config.appTheme, primaryColor: e.target.value } })} />
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase text-slate-800 mb-4">Funcionalidades</h4>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <span className="material-icons-round text-primary">smart_toy</span>
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-800">Chat con Inteligencia Artificial</p>
                              <p className="text-[8px] font-bold text-slate-400">Permite a los clientes asesorarse con MathiBot</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => updateConfig({ isChatEnabled: !config.isChatEnabled })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${config.isChatEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isChatEnabled ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>

                     <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase text-slate-800 mb-4">Sincronización Externa</h4>
                        <button 
                           onClick={async () => {
                              if (window.confirm("¿Deseas exportar toda la configuración actual (precios, sabores, etc.) a tu Google Sheet? Esto sobrescribirá las pestañas existentes.")) {
                                 setIsSaving(true);
                                 try {
                                    const res = await fetch('/api/export-to-sheets', {
                                       method: 'POST',
                                       headers: { 'Content-Type': 'application/json' },
                                       body: safeJsonStringify(config)
                                    });
                                    if (res.ok) alert("✅ Configuración exportada exitosamente a Google Sheets");
                                    else alert("❌ Error al exportar. Revisa los logs del servidor.");
                                 } catch (_e) {
                                    alert("❌ Error de conexión");
                                 } finally {
                                    setIsSaving(false);
                                 }
                              }
                           }}
                           className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
                        >
                           <span className="material-icons-round">cloud_upload</span>
                           Exportar Configuración a Google Sheets
                        </button>
                        <p className="text-[9px] text-slate-400 mt-3 text-center italic">Esto creará/actualizará las pestañas Sizes, Flavors, Fillings, etc. en tu Excel.</p>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase text-slate-800 mb-4">Importar desde Excel</h4>
                        <button 
                           onClick={async () => {
                              if (window.confirm("¿Deseas importar la configuración desde Google Sheets? Esto sobrescribirá los ajustes actuales en el Panel de Administración.")) {
                                 setIsSaving(true);
                                 try {
                                    await onRefreshFromSheets();
                                    alert("✅ Configuración importada exitosamente desde Google Sheets");
                                 } catch (_e) {
                                    alert("❌ Error al importar. Revisa la conexión con Google Sheets.");
                                 } finally {
                                    setIsSaving(false);
                                 }
                              }
                           }}
                           className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
                        >
                           <span className="material-icons-round">cloud_download</span>
                           Importar Configuración desde Google Sheets
                        </button>
                        <p className="text-[9px] text-slate-400 mt-3 text-center italic">Esto leerá las pestañas Sizes, Flavors, etc. de tu Excel y las aplicará aquí.</p>
                      </div>
                   </div>
                </div>
            )}

          </div>
        </div>
      </main>
      {/* MODAL PARA VER IMÁGENES */}
      {viewingImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-5xl w-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white p-2 rounded-3xl shadow-2xl">
              <img src={viewingImage} className="max-w-full max-h-[75vh] rounded-2xl object-contain" alt="Vista previa" />
            </div>
            <div className="flex gap-4">
              <a 
                href={viewingImage} 
                download="imagen-pastel.png"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
              >
                <span className="material-icons-round">download</span>
                Descargar
              </a>
              <button 
                onClick={() => setViewingImage(null)}
                className="bg-primary text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                Cerrar <span className="material-icons-round">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;