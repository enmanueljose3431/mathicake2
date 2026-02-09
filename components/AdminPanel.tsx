
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

  const handleTextureUpload = (id: string, type: 'flavor' | 'filling', file: File | null) => {
    if (!file) {
      if (type === 'flavor') updateFlavor(id, 'textureUrl', undefined);
      else updateFilling(id, 'textureUrl', undefined);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'flavor') updateFlavor(id, 'textureUrl', reader.result as string);
      else updateFilling(id, 'textureUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateSize = (id: string, field: keyof CakeSize, value: any) => {
    const newSizes = config.sizes.map(s => s.id === id ? { ...s, [field]: value } : s);
    onUpdateConfig({ ...config, sizes: newSizes });
  };

  const addSize = () => {
    const newSize: CakeSize = { id: `new_${Date.now()}`, diameter: 14, heightType: 'SHORT', portions: '8 Porciones', basePrice: 20 };
    onUpdateConfig({ ...config, sizes: [...config.sizes, newSize] });
  };

  const removeSize = (id: string) => {
    onUpdateConfig({ ...config, sizes: config.sizes.filter(s => s.id !== id) });
  };

  const updateFlavor = (id: string, field: keyof Flavor, value: any) => {
    const newFlavors = config.flavors.map(f => f.id === id ? { ...f, [field]: value } : f);
    onUpdateConfig({ ...config, flavors: newFlavors });
  };

  const addFlavor = () => {
    const newFlavor: Flavor = { id: `fl_${Date.now()}`, name: 'Nuevo Sabor', color: '#FFFFFF', priceModifier: 0 };
    onUpdateConfig({ ...config, flavors: [...config.flavors, newFlavor] });
  };

  const removeFlavor = (id: string) => {
    onUpdateConfig({ ...config, flavors: config.flavors.filter(f => f.id !== id) });
  };

  const updateFilling = (id: string, field: keyof Filling, value: any) => {
    const newFillings = config.fillings.map(f => f.id === id ? { ...f, [field]: value } : f);
    onUpdateConfig({ ...config, fillings: newFillings });
  };

  const addFilling = () => {
    const newFilling: Filling = { id: `fill_${Date.now()}`, name: 'Nuevo Relleno', color: '#FFFFFF', priceModifier: 0 };
    onUpdateConfig({ ...config, fillings: [...config.fillings, newFilling] });
  };

  const removeFilling = (id: string) => {
    onUpdateConfig({ ...config, fillings: config.fillings.filter(f => f.id !== id) });
  };

  const updateColor = (index: number, field: keyof CakeColor, value: any) => {
    const newColors = [...config.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    onUpdateConfig({ ...config, colors: newColors });
  };

  const addColor = () => {
    onUpdateConfig({ ...config, colors: [...config.colors, { name: 'Nuevo', hex: '#000000', isSaturated: false }] });
  };

  const removeColor = (index: number) => {
    const newColors = config.colors.filter((_, i) => i !== index);
    onUpdateConfig({ ...config, colors: newColors });
  }

  const updateDecoration = (styleId: DecorationStyle, field: keyof any, value: any) => {
    const newDecors = { ...config.decorations };
    newDecors[styleId] = { ...newDecors[styleId], [field]: value };
    onUpdateConfig({ ...config, decorations: newDecors });
  };

  const updateNestedPrice = (parent: 'topperPrices' | 'coverageSurcharges', key: string, value: number) => {
    onUpdateConfig({ ...config, [parent]: { ...config[parent], [key]: value } });
  };

  const updatePaymentDetails = (field: keyof PaymentDetails, value: string) => {
    onUpdateConfig({ ...config, paymentDetails: { ...config.paymentDetails, [field]: value } });
  };

  const updateTheme = (field: keyof AppTheme, value: string) => {
    onUpdateConfig({ ...config, appTheme: { ...config.appTheme, [field]: value } });
  };

  return (
    <div className="flex flex-col h-full bg-slate-300 overflow-hidden font-quicksand">
      <header className="bg-slate-950 px-8 py-5 flex items-center justify-between z-10 shrink-0 shadow-2xl border-b-4 border-primary">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/30">
            <span className="material-icons-round text-4xl">dashboard</span>
          </div>
          <div>
            <h1 className="text-2xl font-display text-white uppercase tracking-tight">Admin Cake Studio</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuración Maestra</p>
          </div>
        </div>
        <button onClick={onExit} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-2xl border-4 border-slate-800">
          <span className="material-icons-round text-sm">exit_to_app</span> Salir del Panel
        </button>
      </header>

      <nav className="bg-white border-b-8 border-slate-900 px-8 flex gap-8 shrink-0 overflow-x-auto no-scrollbar">
        {[
          { id: 'ORDERS', label: 'Ventas', icon: 'receipt_long' },
          { id: 'SIZES', label: 'Moldes', icon: 'square_foot' },
          { id: 'FLAVORS', label: 'Sabores', icon: 'cake' },
          { id: 'DECORATIONS', label: 'Estilos', icon: 'brush' },
          { id: 'COLORS', label: 'Colores', icon: 'palette' },
          { id: 'PRICES', label: 'Extras', icon: 'sell' },
          { id: 'PAYMENTS', label: 'Pagos', icon: 'account_balance' },
          { id: 'SETTINGS', label: 'Ajustes', icon: 'settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-6 flex items-center gap-3 border-b-8 transition-all shrink-0 ${activeTab === tab.id ? 'border-primary text-black font-black scale-105' : 'border-transparent text-slate-500 font-bold hover:text-black hover:border-slate-400'}`}
          >
            <span className="material-icons-round text-3xl">{tab.icon}</span>
            <span className="text-sm uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
          
          {/* MOLDES / SIZES */}
          {activeTab === 'SIZES' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center border-l-8 border-primary pl-6">
                <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-widest">Moldes y Tamaños</h2>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Gestiona diámetros, alturas y precios base</p>
                </div>
                <button onClick={addSize} className="bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-white/20 hover:bg-primary transition-all shadow-xl">Añadir Molde</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {config.sizes.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[3rem] shadow-2xl border-[6px] border-black space-y-6 relative group hover:border-primary transition-all">
                    <button onClick={() => removeSize(s.id)} className="absolute -top-4 -right-4 w-12 h-12 bg-red-600 text-white rounded-full border-4 border-black flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="material-icons-round">delete</span>
                    </button>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-black uppercase ml-1">Diámetro (cm)</label>
                        <input type="number" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-3 font-black text-black" value={s.diameter} onChange={(e) => updateSize(s.id, 'diameter', parseInt(e.target.value))} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-black uppercase ml-1">Altura</label>
                        <select className="w-full bg-slate-50 border-4 border-black rounded-2xl p-3 font-black text-black appearance-none" value={s.heightType} onChange={(e) => updateSize(s.id, 'heightType', e.target.value)}>
                          <option value="SHORT">BAJO (10cm)</option>
                          <option value="TALL">ALTO (17cm)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-black uppercase ml-1">Etiqueta de Porciones</label>
                      <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-3 font-black text-black" value={s.portions} onChange={(e) => updateSize(s.id, 'portions', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-black uppercase ml-1">Precio Base ($)</label>
                      <div className="flex items-center gap-3 bg-primary text-white p-4 rounded-2xl border-4 border-black">
                        <span className="font-black">$</span>
                        <input type="number" className="bg-transparent border-none p-0 font-black text-white w-full focus:ring-0" value={s.basePrice} onChange={(e) => updateSize(s.id, 'basePrice', parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ESTILOS / DECORATIONS */}
          {activeTab === 'DECORATIONS' && (
            <div className="space-y-12">
              <div className="flex flex-col gap-2 border-l-8 border-primary pl-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-widest">Estilos de Decoración</h2>
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Ajusta los nombres comerciales y recargos por técnica</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {(Object.keys(config.decorations) as DecorationStyle[]).map(key => (
                  <div key={key} className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-black text-center group hover:border-primary transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <span className="material-icons-round text-8xl">brush</span>
                    </div>
                    <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-4 border-black group-hover:bg-primary/10 group-hover:border-primary transition-all">
                      <span className="material-icons-round text-6xl text-black group-hover:scale-110 transition-transform">
                        {key === 'liso' ? 'crop_square' : key === 'vintage' ? 'auto_awesome' : key === 'textura' ? 'reorder' : 'opacity'}
                      </span>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-black uppercase tracking-widest text-left ml-2">Nombre Comercial</label>
                        <input type="text" className="w-full text-center bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-sm uppercase text-black focus:border-primary focus:bg-white outline-none" value={config.decorations[key].label} onChange={(e) => updateDecoration(key, 'label', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-black uppercase tracking-widest text-left ml-2">Costo Extra ($)</label>
                        <div className="flex items-center gap-4 bg-primary text-white px-8 py-4 rounded-2xl justify-center border-4 border-black shadow-lg">
                          <span className="text-xl font-black">$</span>
                          <input type="number" className="w-20 bg-transparent border-none text-center font-black text-white text-2xl focus:ring-0" value={config.decorations[key].priceModifier} onChange={(e) => updateDecoration(key, 'priceModifier', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COLORES / COLORS */}
          {activeTab === 'COLORS' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center border-l-8 border-primary pl-6">
                <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-widest">Paleta de Colores</h2>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Configura los colores disponibles para la crema</p>
                </div>
                <button onClick={addColor} className="bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-white/20 hover:bg-primary transition-all shadow-xl">Añadir Color</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {config.colors.map((c, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-black flex flex-col items-center gap-4 hover:border-primary transition-all relative">
                    <button onClick={() => removeColor(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full border-2 border-black flex items-center justify-center hover:scale-110">
                      <span className="material-icons-round text-sm">close</span>
                    </button>
                    <div className="w-16 h-16 rounded-full border-4 border-black shadow-inner relative overflow-hidden" style={{ backgroundColor: c.hex }}>
                      <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={c.hex} onChange={(e) => updateColor(idx, 'hex', e.target.value)} />
                    </div>
                    <div className="w-full space-y-3">
                      <input type="text" className="w-full bg-slate-50 border-2 border-black rounded-xl p-2 text-[10px] font-black uppercase text-center" value={c.name} onChange={(e) => updateColor(idx, 'name', e.target.value)} />
                      <div className="flex items-center justify-center gap-2">
                        <input type="checkbox" className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-primary" checked={c.isSaturated} onChange={(e) => updateColor(idx, 'isSaturated', e.target.checked)} />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Saturado?</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS / PRICES */}
          {activeTab === 'PRICES' && (
            <div className="space-y-12">
              <div className="flex flex-col gap-2 border-l-8 border-primary pl-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-widest">Precios de Extras</h2>
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Configura recargos de toppers, coberturas y detalles</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Toppers */}
                <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-[6px] border-black space-y-8">
                  <h3 className="text-xl font-display uppercase tracking-widest text-primary border-b-4 border-primary pb-2">Precios Toppers</h3>
                  {Object.keys(config.topperPrices).map(tKey => (
                    <div key={tKey} className="flex items-center justify-between gap-4">
                      <span className="text-xs font-black uppercase text-slate-700 w-32">{tKey === 'none' ? 'Sin Topper' : tKey === 'generic' ? 'Genérico' : tKey === 'personalized' ? 'Personalizado' : 'Topper + Piezas'}</span>
                      <div className="flex-1 flex items-center gap-3 bg-slate-100 p-3 rounded-2xl border-2 border-black">
                        <span className="font-black text-slate-400">$</span>
                        <input type="number" className="bg-transparent border-none p-0 font-black text-black w-full focus:ring-0" value={config.topperPrices[tKey]} onChange={(e) => updateNestedPrice('topperPrices', tKey, parseFloat(e.target.value))} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coberturas */}
                <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-[6px] border-black space-y-8">
                  <h3 className="text-xl font-display uppercase tracking-widest text-primary border-b-4 border-primary pb-2">Recargo Coberturas</h3>
                  {Object.keys(config.coverageSurcharges).map(cKey => (
                    <div key={cKey} className="flex items-center justify-between gap-4">
                      <span className="text-xs font-black uppercase text-slate-700 w-32">{cKey}</span>
                      <div className="flex-1 flex items-center gap-3 bg-slate-100 p-3 rounded-2xl border-2 border-black">
                        <span className="font-black text-slate-400">$</span>
                        <input type="number" className="bg-transparent border-none p-0 font-black text-black w-full focus:ring-0" value={config.coverageSurcharges[cKey]} onChange={(e) => updateNestedPrice('coverageSurcharges', cKey, parseFloat(e.target.value))} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Otros recargos */}
                <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-[6px] border-black space-y-8 md:col-span-2">
                   <h3 className="text-xl font-display uppercase tracking-widest text-primary border-b-4 border-primary pb-2">Detalles Adicionales</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border-4 border-black">
                         <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-black">Precio de Esferas</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Costo por set de esferas</span>
                         </div>
                         <div className="flex items-center gap-3 bg-primary text-white p-3 rounded-xl border-2 border-black shadow-lg">
                           <span className="font-black">$</span>
                           <input type="number" className="bg-transparent border-none p-0 font-black text-white w-16 text-center focus:ring-0" value={config.spheresPrice} onChange={(e) => onUpdateConfig({...config, spheresPrice: parseFloat(e.target.value)})} />
                         </div>
                      </div>
                      <div className="flex items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border-4 border-black">
                         <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-black">Recargo Colores</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Por tonos fuertes/saturados</span>
                         </div>
                         <div className="flex items-center gap-3 bg-primary text-white p-3 rounded-xl border-2 border-black shadow-lg">
                           <span className="font-black">$</span>
                           <input type="number" className="bg-transparent border-none p-0 font-black text-white w-16 text-center focus:ring-0" value={config.saturatedColorSurcharge} onChange={(e) => onUpdateConfig({...config, saturatedColorSurcharge: parseFloat(e.target.value)})} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGOS / PAYMENTS */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-12">
              <div className="flex flex-col gap-2 border-l-8 border-primary pl-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-widest">Datos de Pago</h2>
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Información bancaria visible para el cliente</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-[6px] border-black space-y-8">
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Nombre del Banco</label>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-black outline-none focus:border-primary transition-all" value={config.paymentDetails.bankName} onChange={(e) => updatePaymentDetails('bankName', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Titular de Cuenta</label>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-black outline-none focus:border-primary transition-all" value={config.paymentDetails.accountHolder} onChange={(e) => updatePaymentDetails('accountHolder', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">RIF / ID Fiscal</label>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-black outline-none focus:border-primary transition-all" value={config.paymentDetails.taxId} onChange={(e) => updatePaymentDetails('taxId', e.target.value)} />
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-[6px] border-black space-y-8">
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Zelle / Correo de Pago</label>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-black outline-none focus:border-primary transition-all" value={config.paymentDetails.zelleEmail} onChange={(e) => updatePaymentDetails('zelleEmail', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Nota de Tasa de Cambio</label>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 font-black text-black outline-none focus:border-primary transition-all" value={config.paymentDetails.exchangeRateNote} onChange={(e) => updatePaymentDetails('exchangeRateNote', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AJUSTES / SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-12">
              <div className="flex flex-col gap-2 border-l-8 border-primary pl-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-widest">Ajustes Generales</h2>
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Identidad de marca y contacto</p>
              </div>
              <div className="max-w-2xl bg-white p-12 rounded-[4rem] shadow-2xl border-[6px] border-black space-y-10">
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Nombre de la Marca</label>
                  <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-5 font-black text-black text-xl outline-none focus:border-primary transition-all" value={config.appTheme.brandName} onChange={(e) => updateTheme('brandName', e.target.value)} />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">WhatsApp de Recepción (Sin el '+')</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">+</span>
                    <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-5 pl-12 font-black text-black text-xl outline-none focus:border-primary transition-all" value={config.appTheme.whatsappNumber} onChange={(e) => updateTheme('whatsappNumber', e.target.value)} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Ejemplo: 584241546473</p>
                </div>
              </div>
            </div>
          )}

          {/* SABORES / FLAVORS */}
          {activeTab === 'FLAVORS' && (
            <div className="space-y-16">
              <section>
                <div className="flex justify-between items-center mb-8 border-l-8 border-primary pl-6">
                  <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-widest">Sabores de Ponqué</h2>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Texturas e imágenes de bizcocho real</p>
                  </div>
                  <button onClick={addFlavor} className="bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-colors border-2 border-white/20">Añadir Nuevo</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {config.flavors.map(f => (
                    <div key={f.id} className="bg-white p-8 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-black flex flex-col gap-8 group hover:border-primary transition-all">
                      <div className="flex items-center gap-8">
                        <div className="relative w-28 h-28 rounded-[2rem] border-[6px] border-black shadow-inner overflow-hidden shrink-0 bg-slate-100 ring-8 ring-slate-50">
                          {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>}
                          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={f.color} onChange={(e) => updateFlavor(f.id, 'color', e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-6">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-black uppercase ml-1">Sabor del Ponqué</label>
                              <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl px-5 py-3 text-sm font-black uppercase text-black focus:border-primary focus:bg-white outline-none" value={f.name} onChange={(e) => updateFlavor(f.id, 'name', e.target.value)} />
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-black uppercase">Recargo: $</span>
                              <input type="number" className="w-24 bg-slate-50 border-4 border-black rounded-xl px-4 py-2 text-sm font-black text-primary" value={f.priceModifier} onChange={(e) => updateFlavor(f.id, 'priceModifier', parseFloat(e.target.value))} />
                           </div>
                        </div>
                        <button onClick={() => removeFlavor(f.id)} className="text-slate-400 hover:text-red-600 p-4 rounded-full hover:bg-red-50 transition-all"><span className="material-icons-round text-4xl">delete</span></button>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <label className="flex-1 bg-black text-white text-xs font-black uppercase tracking-widest py-5 rounded-2xl text-center cursor-pointer hover:bg-primary transition-all shadow-xl border-2 border-white/20">
                           {f.textureUrl ? 'Reemplazar Foto' : 'Subir Textura Real'}
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleTextureUpload(f.id, 'flavor', e.target.files?.[0] || null)} />
                        </label>
                        {f.textureUrl && (
                          <button onClick={() => updateFlavor(f.id, 'textureUrl', undefined)} className="bg-red-600 text-white text-xs font-black uppercase py-5 px-10 rounded-2xl shadow-xl hover:bg-red-700">Eliminar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-8 border-l-8 border-secondary pl-6">
                  <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-widest">Rellenos Disponibles</h2>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Configura qué puede llevar el pastel por dentro</p>
                  </div>
                  <button onClick={addFilling} className="bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-secondary hover:text-black transition-all">Añadir Relleno</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {config.fillings.map(f => (
                    <div key={f.id} className="bg-white p-8 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-black flex flex-col gap-8 group hover:border-secondary transition-all">
                      <div className="flex items-center gap-8">
                        <div className="relative w-28 h-28 rounded-full border-[6px] border-black shadow-inner overflow-hidden shrink-0 bg-slate-100 ring-8 ring-slate-50">
                          {f.textureUrl ? <img src={f.textureUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: f.color }}></div>}
                          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={f.color} onChange={(e) => updateFilling(f.id, 'color', e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-6">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-black uppercase ml-1">Nombre del Relleno</label>
                              <input type="text" className="w-full bg-slate-50 border-4 border-black rounded-2xl px-5 py-3 text-sm font-black uppercase text-black focus:border-secondary focus:bg-white outline-none" value={f.name} onChange={(e) => updateFilling(f.id, 'name', e.target.value)} />
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-black uppercase">Recargo: $</span>
                              <input type="number" className="w-24 bg-slate-50 border-4 border-black rounded-xl px-4 py-2 text-sm font-black text-black" value={f.priceModifier} onChange={(e) => updateFilling(f.id, 'priceModifier', parseFloat(e.target.value))} />
                           </div>
                        </div>
                        <button onClick={() => removeFilling(f.id)} className="text-slate-400 hover:text-red-600 p-4 rounded-full hover:bg-red-50 transition-all"><span className="material-icons-round text-4xl">delete</span></button>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <label className="flex-1 bg-white text-black text-xs font-black uppercase tracking-widest py-5 rounded-2xl text-center cursor-pointer border-4 border-black hover:bg-black hover:text-white transition-all shadow-xl">
                           Cargar Foto de Relleno
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleTextureUpload(f.id, 'filling', e.target.files?.[0] || null)} />
                        </label>
                        {f.textureUrl && (
                          <button onClick={() => updateFilling(f.id, 'textureUrl', undefined)} className="bg-red-600 text-white text-xs font-black uppercase py-5 px-10 rounded-2xl shadow-xl hover:bg-red-700">Eliminar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VENTAS / ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center border-l-8 border-primary pl-6">
                 <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-widest">Historial de Ventas</h2>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Monitor de pedidos realizados desde la web</p>
                 </div>
                 <button onClick={onClearOrders} className="text-xs font-black text-red-700 uppercase tracking-widest border-4 border-red-700 px-10 py-4 rounded-2xl hover:bg-red-700 hover:text-white transition-all shadow-2xl bg-white">Limpiar Historial</button>
              </div>
              <div className="grid grid-cols-1 gap-10">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-[4rem] p-40 text-center border-8 border-dashed border-slate-400">
                    <span className="material-icons-round text-9xl text-slate-200 mb-8">receipt_long</span>
                    <p className="text-3xl font-black text-slate-400 uppercase tracking-widest">No hay pedidos registrados</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white p-12 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border-4 border-black flex flex-col items-stretch justify-between gap-12 hover:border-primary transition-all group">
                       <div className="flex items-center gap-12">
                          <div className="w-28 h-28 bg-black text-white rounded-[3rem] flex flex-col items-center justify-center font-black shadow-2xl border-4 border-white group-hover:bg-primary transition-colors shrink-0">
                             <span className="text-[10px] opacity-60 uppercase mb-1">REF</span>
                             <span className="text-2xl">{order.id.slice(-4)}</span>
                          </div>
                          <div className="flex-1">
                             <h4 className="font-black text-black uppercase text-3xl mb-3 tracking-tighter">{order.customerName}</h4>
                             <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
                                <p className="text-sm text-black leading-relaxed font-black opacity-90 whitespace-pre-wrap">{order.details}</p>
                             </div>
                             <div className="flex items-center gap-4 mt-6">
                                <span className="material-icons-round text-black text-2xl">event_available</span>
                                <span className="text-sm font-black text-black uppercase tracking-[0.2em]">{order.date}</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-center md:text-right shrink-0 bg-slate-50 p-10 rounded-[3.5rem] w-full border-[6px] border-black shadow-inner flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="inline-flex items-center gap-4 bg-green-200 text-green-950 px-8 py-3 rounded-full border-4 border-green-500">
                             <span className="w-4 h-4 rounded-full bg-green-700 animate-pulse"></span>
                             <span className="text-sm font-black uppercase tracking-widest">Venta Completada</span>
                          </div>
                          <div className="text-6xl font-display text-primary tracking-tighter animate-pop">${order.total.toFixed(2)}</div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
