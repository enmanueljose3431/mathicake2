
import React from 'react';
import { AppState, CoverageType, DeliveryMethod } from '../types';

interface PersonalizationStepProps {
  appState: AppState;
  onUpdate: (data: Partial<AppState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PersonalizationStep: React.FC<PersonalizationStepProps> = ({ appState, onUpdate, onNext, onBack }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ referenceImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const coverages: { id: CoverageType; label: string; icon: string }[] = [
    { id: 'chantilly', label: 'Chantilly', icon: 'cloud' },
    { id: 'chocolate', label: 'Chocolate', icon: 'cookie' },
    { id: 'arequipe', label: 'Arequipe', icon: 'honey_house' },
  ];

  const canContinue = 
    appState.theme && 
    appState.birthdayName && 
    appState.deliveryDate && 
    appState.deliveryTime;

  return (
    <div className="flex flex-col h-full bg-background-light animate-fadeIn">
      <header className="pt-8 pb-4 px-6 flex items-center justify-between z-10 relative bg-white/50 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 rounded-full bg-white shadow-soft text-primary transition-transform active:scale-95">
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h1 className="text-xl font-display text-primary tracking-tight uppercase">Tu Toque Especial</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 pb-40 overflow-y-auto no-scrollbar space-y-6 pt-4">
        <div className="space-y-4">
          {/* Coverage Section */}
          <section className="bg-white p-5 rounded-[2.5rem] shadow-soft border border-rose-50/50">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-icons-round text-base">format_paint</span>
              Cobertura Exterior
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {coverages.map((cov) => (
                <button
                  key={cov.id}
                  onClick={() => onUpdate({ coverageType: cov.id })}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                    appState.coverageType === cov.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-gray-50 text-gray-500'
                  }`}
                >
                  <span className={`material-icons-round text-xl mb-1 ${appState.coverageType === cov.id ? 'text-primary' : 'text-gray-600'}`}>
                    {cov.icon}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${appState.coverageType === cov.id ? 'text-primary' : 'text-gray-700'}`}>{cov.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-5 rounded-[2.5rem] shadow-soft border border-rose-50/50">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-icons-round text-base">celebration</span>
              Datos del Festejado
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5 ml-1">Temática del Pastel</label>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">auto_fix_high</span>
                  <input 
                    type="text" 
                    placeholder="Ej: Princesas, Safari, Elegante..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-3.5 pl-10 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all"
                    value={appState.theme}
                    onChange={(e) => onUpdate({ theme: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5 ml-1">Nombre</label>
                  <input 
                    type="text" 
                    placeholder="Cumpleañero"
                    className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all"
                    value={appState.birthdayName}
                    onChange={(e) => onUpdate({ birthdayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5 ml-1">Edad</label>
                  <input 
                    type="number" 
                    placeholder="Años"
                    className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all"
                    value={appState.birthdayAge}
                    onChange={(e) => onUpdate({ birthdayAge: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-white p-5 rounded-[2.5rem] shadow-soft border border-rose-50/50">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-icons-round text-base">local_shipping</span>
              Entrega y Fecha
            </h3>
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-4">
              <button
                onClick={() => onUpdate({ deliveryMethod: 'PICKUP' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                  appState.deliveryMethod === 'PICKUP' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                PICKUP (TIENDA)
              </button>
              <button
                onClick={() => onUpdate({ deliveryMethod: 'DELIVERY' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                  appState.deliveryMethod === 'DELIVERY' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                DELIVERY
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5 ml-1">Fecha</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border-none rounded-2xl p-3 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-primary/20"
                  value={appState.deliveryDate}
                  onChange={(e) => onUpdate({ deliveryDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5 ml-1">Hora</label>
                <input 
                  type="time" 
                  className="w-full bg-gray-50 border-none rounded-2xl p-3 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-primary/20"
                  value={appState.deliveryTime}
                  onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-5 rounded-[2.5rem] shadow-soft border border-rose-50/50">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-icons-round text-base">palette</span>
              Color y Requerimientos
            </h3>
            <textarea 
              rows={3}
              placeholder="Indica colores específicos o cualquier detalle adicional que debamos saber..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-gray-400"
              value={appState.specialRequirements}
              onChange={(e) => onUpdate({ specialRequirements: e.target.value })}
            />
          </section>

          <section className="bg-white p-5 rounded-[2.5rem] shadow-soft border border-rose-50/50">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-icons-round text-base">collections</span>
              Referencia Visual
            </h3>
            <div className="flex flex-col items-center">
              {appState.referenceImage ? (
                <div className="relative group w-full aspect-video">
                  <img src={appState.referenceImage} alt="Referencia" className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white" />
                  <button 
                    onClick={() => onUpdate({ referenceImage: null })}
                    className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <span className="material-icons-round text-sm">close</span>
                  </button>
                </div>
              ) : (
                <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl py-10 cursor-pointer hover:bg-primary/10 transition-all group">
                  <div className="bg-white p-3 rounded-full shadow-soft mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-icons-round text-primary text-2xl">add_a_photo</span>
                  </div>
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest">Subir Imagen de Referencia</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md p-6 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <button 
          onClick={onNext}
          disabled={!canContinue}
          className="w-full bg-primary disabled:opacity-40 disabled:grayscale text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <span className="text-sm uppercase tracking-widest">Ver Cotización Final</span>
          <span className="material-icons-round text-lg">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default PersonalizationStep;
