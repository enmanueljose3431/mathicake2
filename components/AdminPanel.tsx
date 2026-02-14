
import React, { useState, useEffect } from 'react';
import { AppConfig, Order, CakeSize, Flavor, Filling, DecorationInfo } from '../types';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  orders: Order[];
  onClearOrders: () => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, orders, onExit }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SIZES' | 'FLAVORS' | 'DECORATIONS' | 'COLORS' | 'PRICES' | 'PAYMENTS' | 'SETTINGS'>('ORDERS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // HANDLERS
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

  const updateFlavor = (id: string, f: keyof Flavor, v: any) => {
    updateConfig({ flavors: config.flavors.map(fl => fl.id === id ? { ...fl, [f]: v } : fl) });
  };
  const addFlavor = () => {
    const n: Flavor = { id: `fl_${Date.now()}`, name: 'Nuevo', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ flavors: [...config.flavors, n] });
  };

  const updateFilling = (id: string, f: keyof Filling, v: any) => {
    updateConfig({ fillings: config.fillings.map(fill => fill.id === id ? { ...fill, [f]: v } : fill) });
  };
  const addFilling = () => {
    const n: Filling = { id: `fill_${Date.now()}`, name: 'Nuevo', color: '#FFFFFF', priceModifier: 0 };
    updateConfig({ fillings: [...config.fillings, n] });
  };

  const updateDecoration = (id: string, f: keyof DecorationInfo, v: any) => {
    const next = { ...config.decorations };
    next[id] = { ...next[id], [f]: v };
    updateConfig({ decorations: next });
  };
  const addDecoration = () => {
    const id = `dec_${Date.now()}`;
    const next = { ...config.decorations };
    next[id] = { id, label: 'Nuevo Estilo', priceModifier: 10 };
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

  const menuItems = [
    { id: 'ORDERS', label: 'Ventas', icon: 'analytics' },
    { id: 'SIZES', label: 'Moldes', icon: 'straighten' },
    { id: 'FLAVORS', label: 'Sabores/Rellenos', icon: 'restaurant_menu' },
    { id: 'DECORATIONS', label: 'Estilos', icon: 'auto_fix_high' },
    { id: 'PRICES', label: 'Precios Extras', icon: 'sell' },
    { id: 'PAYMENTS', label: 'Banco/Pagos', icon: 'account_balance' },
    { id: 'SETTINGS', label: 'Marca/Logo', icon: 'settings' },
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
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-800'}`}>
              <span className="material-icons-round text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
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
              Guardando en Firebase...
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar bg-slate-50/30">
          <div className="max-w-6xl mx-auto space-y-10 pb-20">

            {activeTab === 'ORDERS' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aún no hay pedidos registrados</p>
                  </div>
                ) : (
                  orders.map(o => (
                    <div key={o.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center font-display text-primary border text-xl">{o.id.slice(-4)}</div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 uppercase text-sm">{o.customerName}</h4>
                        <p className="text-[9px] text-slate-400 font-bold mb-2">{o.date}</p>
                        <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{o.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-display text-primary">${o.total.toFixed(2)}</p>
                        <span className="text-[8px] font-black uppercase px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">Exitoso</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'SIZES' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={addSize} className="bg-primary/5 border-2 border-dashed border-primary/20 p-10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                  <span className="material-icons-round text-primary text-5xl">add_circle</span>
                  <span className="text-[10px] font-black uppercase text-primary">Nuevo Molde</span>
                </button>
                {config.sizes.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative group">
                    <button onClick={() => removeSize(s.id)} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-icons-round text-sm">delete</span></button>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Diámetro (cm)</label>
                         <input type="number" className="w-full bg-slate-50 rounded-xl p-3 font-bold border-none text-sm" value={s.diameter} onChange={(e) => updateSize(s.id, 'diameter', parseInt(e.target.value))} />
                       </div>
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Altura</label>
                         <select className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold border-none" value={s.heightType} onChange={(e) => updateSize(s.id, 'heightType', e.target.value)}>
                            <option value="SHORT">BAJO</option><option value="TALL">ALTO</option>
                         </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Precio Base $</label>
                         <input type="number" className="w-full bg-slate-900 text-white rounded-xl p-3 font-bold border-none text-sm" value={s.basePrice} onChange={(e) => updateSize(s.id, 'basePrice', parseFloat(e.target.value))} />
                       </div>
                       <div>
                         <label className="text-[8px] font-black uppercase text-slate-400">Multiplicador</label>
                         <input type="number" step="0.1" className="w-full bg-slate-50 rounded-xl p-3 font-bold border-none text-primary text-sm" value={s.costMultiplier} onChange={(e) => updateConfig({ sizes: config.sizes.map(sz => sz.id === s.id ? { ...sz, costMultiplier: parseFloat(e.target.value) } : sz) })} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'FLAVORS' && (
              <div className="space-y-12">
                 <section className="space-y-6">
                   <div className="flex justify-between items-center"><h3 className="font-black uppercase text-xs border-l-4 border-primary pl-4">Sabores de Bizcocho</h3><button onClick={addFlavor} className="bg-primary text-white px-4 py-2 rounded-lg font-black uppercase text-[10px]">Añadir</button></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {config.flavors.map(f => (
                       <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6">
                         <div className="w-20 h-20 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center border shadow-inner shrink-0">
                           {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{backgroundColor: f.color}}></div>}
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(f.id, 'flavor', e)} />
                           <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md"><span className="material-icons-round text-[10px] text-slate-400">add_a_photo</span></div>
                         </div>
                         <div className="flex-1 space-y-2">
                           <input type="text" className="w-full bg-transparent border-none font-black text-sm uppercase p-0" value={f.name} onChange={(e) => updateFlavor(f.id, 'name', e.target.value)} />
                           <div className="flex items-center gap-4">
                             <input type="color" className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" value={f.color} onChange={(e) => updateFlavor(f.id, 'color', e.target.value)} />
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Recargo:</span>
                                <input type="number" className="w-12 text-right font-bold text-primary border-none p-1 bg-slate-50 rounded" value={f.priceModifier} onChange={(e) => updateFlavor(f.id, 'priceModifier', parseFloat(e.target.value))} />
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </section>

                 <section className="space-y-6">
                   <div className="flex justify-between items-center"><h3 className="font-black uppercase text-xs border-l-4 border-slate-400 pl-4">Rellenos</h3><button onClick={addFilling} className="bg-slate-500 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px]">Añadir</button></div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {config.fillings.map(f => (
                       <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center gap-4 relative">
                          <div className="w-16 h-16 rounded-full relative overflow-hidden border shadow-soft bg-slate-50">
                            {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{backgroundColor: f.color}}></div>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(f.id, 'filling', e)} />
                          </div>
                          <input type="text" className="w-full bg-transparent border-none font-bold text-[10px] uppercase text-center p-0" value={f.name} onChange={(e) => updateFilling(f.id, 'name', e.target.value)} />
                          <div className="flex items-center gap-1 font-bold text-primary text-[10px] bg-primary/5 px-2 py-1 rounded-full">
                            <span>+$</span>
                            <input type="number" className="w-8 text-center bg-transparent border-none p-0 font-bold text-primary" value={f.priceModifier} onChange={(e) => updateFilling(f.id, 'priceModifier', parseFloat(e.target.value))} />
                          </div>
                       </div>
                     ))}
                   </div>
                 </section>
              </div>
            )}

            {activeTab === 'DECORATIONS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={addDecoration} className="bg-white border-4 border-dashed border-slate-100 p-16 rounded-[2.5rem] flex flex-col items-center gap-4 text-slate-300 hover:text-primary hover:border-primary/20 transition-all group">
                  <span className="material-icons-round text-6xl group-hover:scale-110 transition-transform">auto_fix_high</span>
                  <span className="font-black uppercase text-xs tracking-widest">Crear Nuevo Estilo</span>
                </button>
                {Object.keys(config.decorations).map(id => {
                  const d = config.decorations[id];
                  return (
                    <div key={id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex gap-8 shadow-sm group relative">
                      <div className="w-32 h-32 bg-slate-100 rounded-3xl relative overflow-hidden flex items-center justify-center border shadow-inner shrink-0">
                        {d.textureUrl ? <img src={d.textureUrl} className="w-full h-full object-cover" /> : <span className="material-icons-round text-5xl text-slate-200">brush</span>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(id, 'decoration', e)} />
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Nombre</label>
                          <input type="text" className="w-full bg-slate-50 rounded-xl p-3 font-black uppercase text-xs border-none" value={d.label} onChange={(e) => updateDecoration(id, 'label', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Recargo Base $</label>
                          <input type="number" className="w-full bg-slate-900 text-white rounded-xl p-3 font-black border-none" value={d.priceModifier} onChange={(e) => updateDecoration(id, 'priceModifier', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'PRICES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                   <h3 className="font-black uppercase text-xs border-l-4 border-primary pl-4 mb-6">Precios de Toppers ($)</h3>
                   <div className="space-y-4">
                      {Object.keys(config.topperPrices).map(key => (
                        <div key={key} className="flex items-center justify-between gap-4">
                           <span className="text-[10px] font-black uppercase text-slate-500">{key === 'none' ? 'Sin Topper' : key === 'generic' ? 'Genérico' : key === 'personalized' ? 'Personalizado' : 'Topper + Piezas'}</span>
                           <input 
                            type="number" 
                            className="w-24 bg-slate-50 rounded-xl p-3 font-black text-primary text-right border-none" 
                            value={config.topperPrices[key]} 
                            onChange={(e) => updateConfig({ topperPrices: { ...config.topperPrices, [key]: parseFloat(e.target.value) } })} 
                           />
                        </div>
                      ))}
                   </div>
                </section>

                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                   <h3 className="font-black uppercase text-xs border-l-4 border-slate-400 pl-4 mb-6">Recargos Especiales ($)</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-800">Esferas Decorativas</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Precio por set</span>
                         </div>
                         <input 
                          type="number" 
                          className="w-24 bg-slate-900 text-white rounded-xl p-3 font-black text-right border-none" 
                          value={config.spheresPrice} 
                          onChange={(e) => updateConfig({ spheresPrice: parseFloat(e.target.value) })} 
                         />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-800">Colores Saturados</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Recargo base</span>
                         </div>
                         <input 
                          type="number" 
                          className="w-24 bg-slate-900 text-white rounded-xl p-3 font-black text-right border-none" 
                          value={config.saturatedColorSurcharge} 
                          onChange={(e) => updateConfig({ saturatedColorSurcharge: parseFloat(e.target.value) })} 
                         />
                      </div>
                   </div>
                </section>

                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                   <h3 className="font-black uppercase text-xs border-l-4 border-slate-400 pl-4 mb-6">Recargos de Cobertura ($)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {Object.keys(config.coverageSurcharges).map(key => (
                        <div key={key} className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
                           <span className="text-[10px] font-black uppercase text-slate-600">{key}</span>
                           <input 
                            type="number" 
                            className="w-20 bg-white rounded-xl p-2 font-black text-primary text-right border-none" 
                            value={config.coverageSurcharges[key]} 
                            onChange={(e) => updateConfig({ coverageSurcharges: { ...config.coverageSurcharges, [key]: parseFloat(e.target.value) } })} 
                           />
                        </div>
                      ))}
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'PAYMENTS' && (
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Banco</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-slate-800 text-sm" value={config.paymentDetails.bankName} onChange={(e) => updateConfig({ paymentDetails: { ...config.paymentDetails, bankName: e.target.value } })} /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Titular</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-slate-800 text-sm" value={config.paymentDetails.accountHolder} onChange={(e) => updateConfig({ paymentDetails: { ...config.paymentDetails, accountHolder: e.target.value } })} /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">RIF / Cédula</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-slate-800 text-sm" value={config.paymentDetails.taxId} onChange={(e) => updateConfig({ paymentDetails: { ...config.paymentDetails, taxId: e.target.value } })} /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Zelle / Pago Móvil</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-primary text-sm" value={config.paymentDetails.zelleEmail} onChange={(e) => updateConfig({ paymentDetails: { ...config.paymentDetails, zelleEmail: e.target.value } })} /></div>
                     <div className="md:col-span-2 space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nota Tasa de Cambio (Ej: BCV + 5%)</label><textarea className="w-full bg-slate-50 border-none rounded-xl p-5 font-bold text-slate-600 h-24 resize-none text-xs" value={config.paymentDetails.exchangeRateNote} onChange={(e) => updateConfig({ paymentDetails: { ...config.paymentDetails, exchangeRateNote: e.target.value } })} /></div>
                  </div>
               </div>
            )}

            {activeTab === 'SETTINGS' && (
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nombre Comercial</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-slate-800 text-sm" value={config.appTheme.brandName} onChange={(e) => updateConfig({ appTheme: { ...config.appTheme, brandName: e.target.value } })} /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">WhatsApp (Ej: 584241234567)</label><input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-slate-800 text-sm" value={config.appTheme.whatsappNumber} onChange={(e) => updateConfig({ appTheme: { ...config.appTheme, whatsappNumber: e.target.value } })} /></div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Logotipo del Estudio</label>
                    <div className="flex items-center gap-10 bg-slate-50 p-10 rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-soft border border-slate-100">
                          {config.appTheme.logoUrl ? <img src={config.appTheme.logoUrl} className="w-full h-full object-contain" /> : <span className="material-icons-round text-slate-200 text-6xl">photo</span>}
                      </div>
                      <div className="space-y-3">
                        <input type="file" className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white" accept="image/*" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { const r = new FileReader(); r.onloadend = () => updateConfig({ appTheme: { ...config.appTheme, logoUrl: r.result as string } }); r.readAsDataURL(f); }
                        }} />
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Formato recomendado: PNG Transparente</p>
                      </div>
                    </div>
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
