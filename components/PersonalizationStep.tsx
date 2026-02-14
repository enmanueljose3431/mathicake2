
import React from 'react';
import { AppState, CoverageType } from '../types';

interface PersonalizationStepProps {
  appState: AppState;
  onUpdate: (data: Partial<AppState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PersonalizationStep: React.FC<PersonalizationStepProps> = ({ appState, onUpdate, onNext, onBack }) => {
  // Función para calcular la fecha mínima (hoy + 2 días)
  const getMinDateString = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const minDate = getMinDateString();

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

  // Validación: Todos los campos requeridos + fecha >= minDate
  const isDateValid = appState.deliveryDate && appState.deliveryDate >= minDate;
  
  const canContinue = 
    appState.theme && 
    appState.birthdayName && 
    isDateValid && 
    appState.deliveryTime;

  return (
    <div className="flex flex-col h-full bg-background-light animate-fadeIn overflow-hidden">
      <header className="pt-6 pb-4 px-6 md:pt-10 md:pb-6 md:px-10 flex items-center justify-between z-10 relative bg-white/50 backdrop-blur-sm shrink-0">
        <button onClick={onBack} className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white shadow-soft text-primary transition-all active:scale-95 border border-gray-100 flex items-center justify-center">
          <span className="material-icons-round text-lg md:text-3xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[9px] md:text-xs font-black text-primary/60 uppercase tracking-widest mb-1">Paso 4: Detalles</span>
            <h1 className="text-xl md:text-4xl font-display text-black tracking-tight uppercase">Tu Toque Especial</h1>
        </div>
        <div className="w-10 md:w-16"></div>
      </header>

      <main className="flex-1 px-6 md:px-10 overflow-y-auto no-scrollbar pt-4 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          
          <div className="space-y-6 md:space-y-10">
              {/* Coverage Section */}
              <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-soft border border-rose-50/50">
                <h3 className="text-[11px] md:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="material-icons-round text-base md:text-2xl">format_paint</span>
                  Cobertura Exterior
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {coverages.map((cov) => (
                    <button
                      key={cov.id}
                      onClick={() => onUpdate({ coverageType: cov.id })}
                      className={`flex flex-col items-center p-4 md:p-8 rounded-3xl transition-all border-2 ${
                        appState.coverageType === cov.id 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-transparent bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span className={`material-icons-round text-xl md:text-4xl mb-2 ${appState.coverageType === cov.id ? 'text-primary' : 'text-gray-400'}`}>
                        {cov.icon}
                      </span>
                      <span className={`text-[9px] md:text-xs font-bold uppercase tracking-widest ${appState.coverageType === cov.id ? 'text-primary' : 'text-gray-700'}`}>{cov.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-soft border border-rose-50/50">
                <h3 className="text-[11px] md:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="material-icons-round text-base md:text-2xl">celebration</span>
                  Datos del Festejado
                </h3>
                
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Temática del Pastel</label>
                    <div className="relative">
                      <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-2xl">auto_fix_high</span>
                      <input 
                        type="text" 
                        placeholder="Ej: Princesas, Safari, Elegante..."
                        className="w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 pl-12 md:pl-16 text-sm md:text-lg font-medium text-gray-800 focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 transition-all"
                        value={appState.theme}
                        onChange={(e) => onUpdate({ theme: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Cumpleañero"
                        className="w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm md:text-lg font-medium text-gray-800 focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 transition-all"
                        value={appState.birthdayName}
                        onChange={(e) => onUpdate({ birthdayName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Edad</label>
                      <input 
                        type="number" 
                        placeholder="Años"
                        className="w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm md:text-lg font-medium text-gray-800 focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 transition-all"
                        value={appState.birthdayAge}
                        onChange={(e) => onUpdate({ birthdayAge: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </section>
          </div>

          <div className="space-y-6 md:space-y-10">
              {/* Delivery Details */}
              <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-soft border border-rose-50/50">
                <h3 className="text-[11px] md:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="material-icons-round text-base md:text-2xl">local_shipping</span>
                  Entrega y Fecha
                </h3>
                <div className="flex p-1.5 bg-gray-100 rounded-[2rem] mb-6">
                  <button
                    onClick={() => onUpdate({ deliveryMethod: 'PICKUP' })}
                    className={`flex-1 py-3.5 rounded-[1.8rem] text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${
                      appState.deliveryMethod === 'PICKUP' ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    RETIRAR EN TIENDA
                  </button>
                  <button
                    onClick={() => onUpdate({ deliveryMethod: 'DELIVERY' })}
                    className={`flex-1 py-3.5 rounded-[1.8rem] text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${
                      appState.deliveryMethod === 'DELIVERY' ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    DELIVERY A DOMICILIO
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Fecha Evento</label>
                    <input 
                      type="date" 
                      min={minDate}
                      className={`w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm md:text-lg font-bold text-gray-800 focus:ring-4 focus:ring-primary/10 ${appState.deliveryDate && !isDateValid ? 'ring-2 ring-red-500' : ''}`}
                      value={appState.deliveryDate}
                      onChange={(e) => onUpdate({ deliveryDate: e.target.value })}
                    />
                    <p className="text-[8px] md:text-[9px] text-primary/60 font-black uppercase mt-2 ml-1 tracking-widest">
                       Mínimo 48h de anticipación
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Hora Entrega</label>
                    <input 
                      type="time" 
                      className="w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm md:text-lg font-bold text-gray-800 focus:ring-4 focus:ring-primary/10"
                      value={appState.deliveryTime}
                      onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-soft border border-rose-50/50">
                <h3 className="text-[11px] md:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="material-icons-round text-base md:text-2xl">collections</span>
                  Referencia Visual e Instrucciones
                </h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                    {appState.referenceImage ? (
                        <div className="relative group w-full aspect-video">
                        <img src={appState.referenceImage} alt="Referencia" className="w-full h-full object-cover rounded-3xl shadow-lg border-4 border-white" />
                        <button 
                            onClick={() => onUpdate({ referenceImage: null })}
                            className="absolute -top-3 -right-3 bg-rose-500 text-white p-2 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
                        >
                            <span className="material-icons-round text-base">close</span>
                        </button>
                        </div>
                    ) : (
                        <label className="w-full flex flex-col items-center justify-center border-4 border-dashed border-primary/10 bg-primary/5 rounded-[2.5rem] py-12 cursor-pointer hover:bg-primary/10 transition-all group">
                        <div className="bg-white p-4 rounded-full shadow-soft mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-icons-round text-primary text-3xl">add_a_photo</span>
                        </div>
                        <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest text-center px-4">Adjuntar Foto de Referencia</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-2 ml-1 tracking-widest">Requerimientos Especiales</label>
                        <textarea 
                        rows={5}
                        placeholder="Colores específicos, dedicatorias, o cualquier detalle importante..."
                        className="w-full bg-gray-50 border-none rounded-2xl md:rounded-3xl p-6 text-sm md:text-base font-medium text-gray-800 focus:ring-4 focus:ring-primary/10 resize-none transition-all placeholder:text-gray-400 h-full"
                        value={appState.specialRequirements}
                        onChange={(e) => onUpdate({ specialRequirements: e.target.value })}
                        />
                    </div>
                </div>
              </section>
          </div>
        </div>
      </main>

      {/* FOOTER - Compacto consistente con el estilo global */}
      <footer className="bg-surface-light p-5 md:p-8 z-50 shadow-[0_-15px_35px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Seleccionado</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                <span className="text-2xl md:text-4xl font-display text-black">{appState.selectedSize?.diameter}cm</span>
                <span className="text-[9px] md:text-[11px] font-black text-primary uppercase bg-primary/5 px-3 md:px-4 py-0.5 rounded-lg border border-primary/10">
                  {appState.selectedSize?.portions || 'N/A'}
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Total Estimado</span>
              <span className="text-2xl md:text-4xl font-display text-primary tracking-tighter">${appState.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onNext}
            disabled={!canContinue}
            className="w-full md:w-auto bg-primary hover:bg-rose-600 disabled:opacity-40 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-5 group text-xs md:text-sm border-2 md:border-4 border-white/10 uppercase tracking-[0.2em]"
          >
            Ver Cotización Final
            <span className="material-icons-round text-lg md:text-2xl group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PersonalizationStep;
