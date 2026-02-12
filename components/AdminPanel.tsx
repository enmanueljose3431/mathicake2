
import React, { useState } from 'react';
import { AppConfig, Order, CakeSize, Flavor, Filling, CakeColor, DecorationStyle, TopperType, CoverageType, PaymentDetails, AppTheme } from '../types';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  orders: Order[];
  onClearOrders: () => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, orders, onClearOrders, onExit }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SIZES' | 'FLAVORS' | 'DECORATIONS' | 'COLORS' | 'PRICES' | 'PAYMENTS' | 'SETTINGS'>('ORDERS');

  // Helpers de actualización
  const updateConfig = (newPart: Partial<AppConfig>) => {
    onUpdateConfig({ ...config, ...newPart });
  };

  const updateSize = (id: string, field: keyof CakeSize, value: any) => {
    const newSizes = config.sizes.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateConfig({ sizes: newSizes });
  };

  const addSize = () => {
    const newSize: CakeSize = { id: `new_${Date.now()}`, diameter: 14, heightType: 'SHORT', portions: '8 Porciones', basePrice: 20, costMultiplier: 1.0 };
    updateConfig({ sizes: [...config.sizes, newSize] });
  };

  const removeSize = (id: string) => {
    updateConfig({ sizes: config.sizes.filter(s => s.id !== id) });
  };

  const updateFlavor = (id: string, field: keyof Flavor, value: any) => {
    const newFlavors = config.flavors.map(f => f.id === id ? { ...f, [field]: value } : f);
    updateConfig({ flavors: newFlavors });
  };

  const addFlavor = () => {
    const newFlavor: Flavor = { id: `fl_${Date.now()}`, name: 'Nuevo Bizcocho', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ flavors: [...config.flavors, newFlavor] });
  };

  const removeFlavor = (id: string) => {
    updateConfig({ flavors: config.flavors.filter(f => f.id !== id) });
  };

  const updateFilling = (id: string, field: keyof Filling, value: any) => {
    const newFillings = config.fillings.map(f => f.id === id ? { ...f, [field]: value } : f);
    updateConfig({ fillings: newFillings });
  };

  const addFilling = () => {
    const newFilling: Filling = { id: `fill_${Date.now()}`, name: 'Nuevo Relleno', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ fillings: [...config.fillings, newFilling] });
  };

  const removeFilling = (id: string) => {
    updateConfig({ fillings: config.fillings.filter(f => f.id !== id) });
  };

  const updatePaymentField = (field: keyof PaymentDetails, value: string) => {
    updateConfig({ paymentDetails: { ...config.paymentDetails, [field]: value } });
  };

  const updateThemeField = (field: keyof AppTheme, value: string) => {
    updateConfig({ appTheme: { ...config.appTheme, [field]: value } });
  };

  const menuItems = [
    { id: 'ORDERS', label: 'Pedidos / Ventas', icon: 'analytics' },
    { id: 'SIZES', label: 'Moldes y Tamaños', icon: 'straighten' },
    { id: 'FLAVORS', label: 'Sabores y Rellenos', icon: 'restaurant_menu' },
    { id: 'DECORATIONS', label: 'Estilos de Decoración', icon: 'auto_fix_high' },
    { id: 'COLORS', label: 'Paleta de Colores', icon: 'palette' },
    { id: 'PRICES', label: 'Precios Extras', icon: 'payments' },
    { id: 'PAYMENTS', label: 'Datos Bancarios', icon: 'account_balance' },
    { id: 'SETTINGS', label: 'Marca y Tema', icon: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-quicksand">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-80 bg-slate-900 flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="material-icons-round">dashboard</span>
            </div>
            <h1 className="text-xl font-display text-white tracking-tight uppercase">Admin Panel</h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{config.appTheme.brandName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="material-icons-round text-2xl">{item.icon}</span>
              <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onExit}
            className="w-full bg-slate-800 text-white font-black py-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            <span className="material-icons-round text-sm">logout</span> Salir del Panel
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado del Sistema</p>
              <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-2 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> En Línea
              </p>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto pb-20">

            {/* TAB: PEDIDOS */}
            {activeTab === 'ORDERS' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Monitor de actividad en tiempo real</p>
                  <button onClick={onClearOrders} className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest">Limpiar todo el historial</button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-32 text-center">
                      <span className="material-icons-round text-6xl text-slate-200 mb-4">inbox</span>
                      <p className="text-slate-400 font-black uppercase tracking-widest">No hay pedidos registrados aún</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex items-start gap-8 group">
                        <div className="w-20 h-20 bg-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                          <span className="text-[10px] font-black text-slate-400 uppercase">REF</span>
                          <span className="text-xl font-display text-slate-800 group-hover:text-primary">{order.id.slice(-4)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{order.customerName}</h4>
                            <span className="text-sm font-bold text-slate-400">{order.date}</span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                            <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{order.details}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-3xl font-display text-primary mb-2">${order.total.toFixed(2)}</p>
                          <span className="bg-green-100 text-green-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase border border-green-200">Pendiente</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: MOLDES */}
            {activeTab === 'SIZES' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Ajusta dimensiones, alturas y precios base</p>
                  <button onClick={addSize} className="bg-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Añadir Nuevo Molde</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {config.sizes.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative group">
                      <button onClick={() => removeSize(s.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons-round">delete</span></button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Diámetro (cm)</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800" value={s.diameter} onChange={(e) => updateSize(s.id, 'diameter', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Altura</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800" value={s.heightType} onChange={(e) => updateSize(s.id, 'heightType', e.target.value)}>
                            <option value="SHORT">BAJO (10cm)</option>
                            <option value="TALL">ALTO (17cm)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Factor Costo</label>
                          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-primary" value={s.costMultiplier} onChange={(e) => updateSize(s.id, 'costMultiplier', parseFloat(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Precio Base $</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-bold text-white" value={s.basePrice} onChange={(e) => updateSize(s.id, 'basePrice', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SABORES (RESTAURADO Y MEJORADO) */}
            {activeTab === 'FLAVORS' && (
              <div className="space-y-12">
                
                {/* Bizcochos */}
                <section>
                  <div className="flex justify-between items-center mb-6 border-l-4 border-primary pl-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Bizcochos (Ponqués)</h3>
                    <button onClick={addFlavor} className="text-xs font-black text-primary uppercase border-2 border-primary/20 px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition-all">Añadir Bizcocho</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.flavors.map(f => (
                      <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0">
                          {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>}
                          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={f.color} onChange={(e) => updateFlavor(f.id, 'color', e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-4">
                          <input type="text" className="w-full bg-slate-50 border-none rounded-lg px-4 py-2 font-bold text-sm uppercase text-slate-800" value={f.name} onChange={(e) => updateFlavor(f.id, 'name', e.target.value)} />
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Recargo base: $</span>
                            <input type="number" className="w-20 bg-slate-50 border-none rounded-lg px-3 py-1 font-bold text-primary" value={f.priceModifier} onChange={(e) => updateFlavor(f.id, 'priceModifier', parseFloat(e.target.value))} />
                          </div>
                        </div>
                        <button onClick={() => removeFlavor(f.id)} className="text-slate-300 hover:text-red-500"><span className="material-icons-round">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Rellenos */}
                <section>
                  <div className="flex justify-between items-center mb-6 border-l-4 border-slate-400 pl-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Rellenos</h3>
                    <button onClick={addFilling} className="text-xs font-black text-slate-500 uppercase border-2 border-slate-200 px-6 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-all">Añadir Relleno</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {config.fillings.map(f => (
                      <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0 relative">
                          <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>
                          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={f.color} onChange={(e) => updateFilling(f.id, 'color', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <input type="text" className="w-full bg-transparent border-none p-0 font-bold text-sm uppercase text-slate-800 mb-1" value={f.name} onChange={(e) => updateFilling(f.id, 'name', e.target.value)} />
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase">+$</span>
                             <input type="number" className="bg-transparent border-none p-0 font-bold text-xs text-slate-600" value={f.priceModifier} onChange={(e) => updateFilling(f.id, 'priceModifier', parseFloat(e.target.value))} />
                          </div>
                        </div>
                        <button onClick={() => removeFilling(f.id)} className="text-slate-300 hover:text-red-500"><span className="material-icons-round">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* TAB: PAGOS (RESTAURADO) */}
            {activeTab === 'PAYMENTS' && (
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Entidad Bancaria</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800" value={config.paymentDetails.bankName} onChange={(e) => updatePaymentField('bankName', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Titular de Cuenta</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800" value={config.paymentDetails.accountHolder} onChange={(e) => updatePaymentField('accountHolder', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">RIF / ID Fiscal</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800" value={config.paymentDetails.taxId} onChange={(e) => updatePaymentField('taxId', e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Zelle o Email de Pago</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-primary" value={config.paymentDetails.zelleEmail} onChange={(e) => updatePaymentField('zelleEmail', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nota de Tasa de Cambio</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-600 h-32 resize-none" value={config.paymentDetails.exchangeRateNote} onChange={(e) => updatePaymentField('exchangeRateNote', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TEMA / CONFIG */}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-10">
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl space-y-10">
                  <section>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Información de Marca</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Comercial</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800" value={config.appTheme.brandName} onChange={(e) => updateThemeField('brandName', e.target.value)} />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">WhatsApp de Recepción</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800" value={config.appTheme.whatsappNumber} onChange={(e) => updateThemeField('whatsappNumber', e.target.value)} />
                       </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Colores del Sistema</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      {[
                        { id: 'primaryColor', label: 'Primario' },
                        { id: 'secondaryColor', label: 'Secundario' },
                        { id: 'backgroundColor', label: 'Fondo' },
                        { id: 'surfaceColor', label: 'Superficie' },
                        { id: 'textColor', label: 'Texto' },
                      ].map(item => (
                        <div key={item.id} className="flex flex-col items-center gap-3">
                           <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg relative overflow-hidden" style={{ backgroundColor: (config.appTheme as any)[item.id] }}>
                              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={(config.appTheme as any)[item.id]} onChange={(e) => updateThemeField(item.id as any, e.target.value)} />
                           </div>
                           <span className="text-[9px] font-black uppercase text-slate-500">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
            
            {/* Otras pestañas (COLORS, DECORATIONS, PRICES) mantienen lógica similar... */}
            {activeTab === 'COLORS' && (
               <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                     {config.colors.map((c, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center gap-4">
                           <div className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-inner" style={{backgroundColor: c.hex}}></div>
                           <input type="text" className="w-full text-center text-[10px] font-black uppercase bg-slate-50 border-none rounded-md" value={c.name} onChange={(e) => {
                              const nc = [...config.colors];
                              nc[i].name = e.target.value;
                              updateConfig({colors: nc});
                           }} />
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'PRICES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h4 className="font-black text-slate-800 uppercase text-xs mb-4">Toppers</h4>
                  {Object.entries(config.topperPrices).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 uppercase">{k}</span>
                      <input type="number" className="w-20 bg-slate-50 border-none rounded-lg p-2 text-right font-bold text-primary" value={v} onChange={(e) => {
                        updateConfig({ topperPrices: { ...config.topperPrices, [k]: parseFloat(e.target.value) } });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
