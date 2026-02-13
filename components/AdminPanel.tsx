
import React, { useState } from 'react';
import { AppConfig, Order, CakeSize, Flavor, Filling, PaymentDetails, AppTheme, DecorationInfo, CakeColor } from '../types';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  orders: Order[];
  onClearOrders: () => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, orders, onClearOrders, onExit }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SIZES' | 'FLAVORS' | 'DECORATIONS' | 'COLORS' | 'PRICES' | 'PAYMENTS' | 'SETTINGS'>('ORDERS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const updateDecoration = (id: string, field: keyof DecorationInfo, value: any) => {
    const newDecorations = { ...config.decorations };
    newDecorations[id] = { ...newDecorations[id], [field]: value };
    updateConfig({ decorations: newDecorations });
  };

  const addDecoration = () => {
    const newId = `decor_${Date.now()}`;
    const newDecorations = { ...config.decorations };
    newDecorations[newId] = { id: newId, label: 'Nuevo Estilo', priceModifier: 10 };
    updateConfig({ decorations: newDecorations });
  };

  const removeDecoration = (id: string) => {
    const newDecorations = { ...config.decorations };
    delete newDecorations[id];
    updateConfig({ decorations: newDecorations });
  };

  const updateColor = (index: number, field: keyof CakeColor, value: any) => {
    const newColors = [...config.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    updateConfig({ colors: newColors });
  };

  const addColor = () => {
    const newColor: CakeColor = { name: 'Nuevo Color', hex: '#000000', isSaturated: false };
    updateConfig({ colors: [...config.colors, newColor] });
  };

  const removeColor = (index: number) => {
    const newColors = config.colors.filter((_, i) => i !== index);
    updateConfig({ colors: newColors });
  };

  const handleImageUpload = (id: string, type: 'flavor' | 'filling' | 'decoration', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'flavor') updateFlavor(id, 'textureUrl', base64);
        if (type === 'filling') updateFilling(id, 'textureUrl', base64);
        if (type === 'decoration') updateDecoration(id, 'textureUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePaymentField = (field: keyof PaymentDetails, value: string) => {
    updateConfig({ paymentDetails: { ...config.paymentDetails, [field]: value } });
  };

  const updateThemeField = (field: keyof AppTheme, value: string) => {
    updateConfig({ appTheme: { ...config.appTheme, [field]: value } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateThemeField('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-quicksand relative">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 md:w-80 bg-slate-900 flex flex-col shrink-0 shadow-2xl z-[70] transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/10">
              {config.appTheme.logoUrl ? (
                <img src={config.appTheme.logoUrl} className="w-full h-full object-cover" />
              ) : (
                <span className="material-icons-round">dashboard</span>
              )}
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-display text-white tracking-tight uppercase">Admin Panel</h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{config.appTheme.brandName}</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <nav className="flex-1 p-3 md:p-4 space-y-1.5 md:space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="material-icons-round text-xl md:text-2xl">{item.icon}</span>
              <span className="text-[11px] md:text-sm font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 md:p-6 border-t border-slate-800">
          <button 
            onClick={onExit}
            className="w-full bg-slate-800 text-white font-black py-3 md:py-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-widest"
          >
            <span className="material-icons-round text-sm">logout</span> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-10 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <span className="material-icons-round">menu</span>
            </button>
            <h2 className="text-sm md:text-2xl font-black text-slate-800 uppercase tracking-tight truncate">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
              <p className="text-[11px] md:text-sm font-bold text-green-600 flex items-center justify-end gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> Activo
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto pb-10 md:pb-20">

            {activeTab === 'ORDERS' && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest">Actividad en tiempo real</p>
                  <button onClick={onClearOrders} className="text-[10px] md:text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest text-left">Limpiar historial</button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 md:p-32 text-center">
                      <span className="material-icons-round text-4xl md:text-6xl text-slate-200 mb-4">inbox</span>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay pedidos registrados</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-4 md:gap-8 group">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                          <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">REF</span>
                          <span className="text-base md:text-xl font-display text-slate-800 group-hover:text-primary">{order.id.slice(-4)}</span>
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <h4 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight truncate">{order.customerName}</h4>
                            <span className="text-xs font-bold text-slate-400">{order.date}</span>
                          </div>
                          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 mb-4">
                            <p className="text-xs md:text-sm text-slate-600 font-medium whitespace-pre-wrap">{order.details}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                          <p className="text-xl md:text-3xl font-display text-primary mb-2">${order.total.toFixed(2)}</p>
                          <span className="bg-green-100 text-green-700 text-[9px] md:text-[10px] font-black px-4 py-1 rounded-full uppercase border border-green-200">Pendiente</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'DECORATIONS' && (
              <div className="space-y-6 md:space-y-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight border-l-4 border-primary pl-4">Estilos de Decoración</h3>
                  <button onClick={addDecoration} className="bg-primary text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Añadir Estilo</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  {Object.keys(config.decorations).map(id => {
                    const decor = config.decorations[id];
                    return (
                      <div key={id} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative group">
                        <button onClick={() => removeDecoration(id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons-round text-sm">delete</span></button>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border-2 border-dashed border-slate-300 overflow-hidden relative">
                             {decor.textureUrl ? (
                               <img src={decor.textureUrl} className="w-full h-full object-cover" />
                             ) : (
                               <span className="material-icons-round text-3xl">add_a_photo</span>
                             )}
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(id, 'decoration', e)} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <label className="text-[9px] font-black text-slate-400 uppercase">Nombre</label>
                             <input type="text" className="w-full bg-slate-50 border-none rounded-lg p-2 font-bold text-slate-800 text-xs md:text-sm" value={decor.label} onChange={(e) => updateDecoration(id, 'label', e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase">Recargo base $</label>
                           <input type="number" className="w-full bg-slate-900 border-none rounded-lg p-2 font-bold text-white text-base md:text-lg" value={decor.priceModifier} onChange={(e) => updateDecoration(id, 'priceModifier', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'SIZES' && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex justify-between items-center gap-4">
                  <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest">Moldes</p>
                  <button onClick={addSize} className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Añadir Nuevo</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {config.sizes.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                      <button onClick={() => removeSize(s.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons-round text-sm">delete</span></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Diámetro</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 text-xs" value={s.diameter} onChange={(e) => updateSize(s.id, 'diameter', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Altura</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 text-[10px]" value={s.heightType} onChange={(e) => updateSize(s.id, 'heightType', e.target.value)}>
                            <option value="SHORT">BAJO</option>
                            <option value="TALL">ALTO</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">F. Costo</label>
                          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-primary text-xs" value={s.costMultiplier} onChange={(e) => updateSize(s.id, 'costMultiplier', parseFloat(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Precio $</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-bold text-white text-xs" value={s.basePrice} onChange={(e) => updateSize(s.id, 'basePrice', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'FLAVORS' && (
              <div className="space-y-10">
                <section>
                  <div className="flex justify-between items-center mb-6 border-l-4 border-primary pl-4">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">Bizcochos</h3>
                    <button onClick={addFlavor} className="text-[10px] font-black text-primary uppercase border-2 border-primary/20 px-4 py-2 rounded-lg">Añadir</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config.flavors.map(f => (
                      <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 flex items-center justify-center bg-slate-100">
                          {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(f.id, 'flavor', e)} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="text" className="flex-1 bg-slate-50 border-none rounded-lg px-2 py-1 font-bold text-[11px] uppercase" value={f.name} onChange={(e) => updateFlavor(f.id, 'name', e.target.value)} />
                            <input type="color" className="w-6 h-6 rounded-full" value={f.color} onChange={(e) => updateFlavor(f.id, 'color', e.target.value)} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Recargo: $</span>
                            <input type="number" className="w-12 bg-slate-50 border-none rounded-lg font-bold text-primary text-xs" value={f.priceModifier} onChange={(e) => updateFlavor(f.id, 'priceModifier', parseFloat(e.target.value))} />
                          </div>
                        </div>
                        <button onClick={() => removeFlavor(f.id)} className="text-slate-300 hover:text-red-500"><span className="material-icons-round text-sm">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-6 border-l-4 border-slate-400 pl-4">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">Rellenos</h3>
                    <button onClick={addFilling} className="text-[10px] font-black text-slate-500 uppercase border-2 border-slate-200 px-4 py-2 rounded-lg">Añadir</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.fillings.map(f => (
                      <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 relative">
                          {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(f.id, 'filling', e)} />
                        </div>
                        <div className="flex-1">
                          <input type="text" className="w-full bg-transparent border-none p-0 font-bold text-[10px] uppercase" value={f.name} onChange={(e) => updateFilling(f.id, 'name', e.target.value)} />
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-slate-400 uppercase">+$</span>
                             <input type="number" className="bg-transparent border-none p-0 font-bold text-[10px]" value={f.priceModifier} onChange={(e) => updateFilling(f.id, 'priceModifier', parseFloat(e.target.value))} />
                          </div>
                        </div>
                        <button onClick={() => removeFilling(f.id)} className="text-slate-300 hover:text-red-500"><span className="material-icons-round text-sm">delete</span></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'COLORS' && (
              <div className="space-y-6 md:space-y-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight border-l-4 border-primary pl-4">Paleta de Colores</h3>
                  <button onClick={addColor} className="bg-primary text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Añadir Color</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {config.colors.map((color, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative group">
                      <button onClick={() => removeColor(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons-round text-sm">delete</span></button>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl border-4 border-white shadow-md shrink-0 relative overflow-hidden" style={{ backgroundColor: color.hex }}>
                          <input 
                            type="color" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            value={color.hex} 
                            onChange={(e) => updateColor(index, 'hex', e.target.value)} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                           <label className="text-[9px] font-black text-slate-400 uppercase">Nombre</label>
                           <input 
                             type="text" 
                             className="w-full bg-slate-50 border-none rounded-lg p-2 font-bold text-slate-800 text-xs" 
                             value={color.name} 
                             onChange={(e) => updateColor(index, 'name', e.target.value)} 
                           />
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Tipo de Color</span>
                           <span className="text-[10px] font-bold text-slate-600 uppercase">Saturado / Intenso</span>
                        </div>
                        <button 
                          onClick={() => updateColor(index, 'isSaturated', !color.isSaturated)}
                          className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-all ${color.isSaturated ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                           <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform ${color.isSaturated ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'PRICES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* TOPPERS */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <h4 className="font-black text-slate-800 uppercase text-xs mb-4 border-b pb-2">Precios de Toppers</h4>
                  {Object.entries(config.topperPrices).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-slate-600 uppercase">{k}</span>
                      <input type="number" className="w-20 bg-slate-50 border-none rounded-lg p-2 text-right font-bold text-primary text-sm shadow-inner" value={v} onChange={(e) => {
                        updateConfig({ topperPrices: { ...config.topperPrices, [k]: parseFloat(e.target.value) } });
                      }} />
                    </div>
                  ))}
                </div>

                {/* OTROS RECARGOS */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                   <h4 className="font-black text-slate-800 uppercase text-xs mb-4 border-b pb-2">Otros Recargos</h4>
                   <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-slate-600 uppercase">Esferas Decorativas</span>
                      <input type="number" className="w-20 bg-slate-50 border-none rounded-lg p-2 text-right font-bold text-primary text-sm shadow-inner" value={config.spheresPrice || 0} onChange={(e) => updateConfig({ spheresPrice: parseFloat(e.target.value) })} />
                   </div>
                   <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-slate-600 uppercase">Colores Intensos</span>
                      <input type="number" className="w-20 bg-slate-50 border-none rounded-lg p-2 text-right font-bold text-primary text-sm shadow-inner" value={config.saturatedColorSurcharge || 0} onChange={(e) => updateConfig({ saturatedColorSurcharge: parseFloat(e.target.value) })} />
                   </div>
                </div>

                {/* COBERTURAS (NUEVO) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                   <h4 className="font-black text-slate-800 uppercase text-xs mb-4 border-b pb-2">Recargos por Cobertura (Factor Multiplicador de Tamaño)</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {['chantilly', 'chocolate', 'arequipe'].map(cov => (
                        <div key={cov} className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">{cov}</label>
                           <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-bold">$</span>
                              <input 
                                type="number" 
                                className="w-full bg-slate-50 border-none rounded-lg p-3 font-bold text-primary text-sm shadow-inner" 
                                value={config.coverageSurcharges[cov] || 0} 
                                onChange={(e) => {
                                  const ns = { ...config.coverageSurcharges, [cov]: parseFloat(e.target.value) };
                                  updateConfig({ coverageSurcharges: ns });
                                }} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-400 italic mt-4">* Estos precios se multiplican por el factor de costo del tamaño seleccionado.</p>
                </div>
              </div>
            )}

            {activeTab === 'PAYMENTS' && (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Banco</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm" value={config.paymentDetails.bankName} onChange={(e) => updatePaymentField('bankName', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Titular</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm" value={config.paymentDetails.accountHolder} onChange={(e) => updatePaymentField('accountHolder', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Zelle / Email</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-primary text-sm" value={config.paymentDetails.zelleEmail} onChange={(e) => updatePaymentField('zelleEmail', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nota Tasa / Moneda</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-600 h-24 resize-none text-sm" value={config.paymentDetails.exchangeRateNote} onChange={(e) => updatePaymentField('exchangeRateNote', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SETTINGS' && (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl space-y-12">
                  <section>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Marca</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre App</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800 text-base" value={config.appTheme.brandName} onChange={(e) => updateThemeField('brandName', e.target.value)} />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">WhatsApp de Pedidos</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800 text-base" value={config.appTheme.whatsappNumber} onChange={(e) => updateThemeField('whatsappNumber', e.target.value)} />
                       </div>
                    </div>
                    <div className="flex flex-col gap-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Logo del Proyecto</label>
                       <div className="flex items-center gap-8">
                          <div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                             {config.appTheme.logoUrl ? <img src={config.appTheme.logoUrl} className="w-full h-full object-contain" /> : <span className="material-icons-round text-slate-300 text-4xl">add_photo_alternate</span>}
                          </div>
                          <div className="flex-1 space-y-4">
                             <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-white" />
                             {config.appTheme.logoUrl && <button onClick={() => updateThemeField('logoUrl', '')} className="text-[10px] font-black text-red-500 uppercase">Eliminar Logo</button>}
                          </div>
                       </div>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Colores de Interfaz</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
                      {[
                        { id: 'primaryColor', label: 'Principal' },
                        { id: 'secondaryColor', label: 'Acento' },
                        { id: 'backgroundColor', label: 'Fondo' },
                        { id: 'surfaceColor', label: 'Tarjetas' },
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
