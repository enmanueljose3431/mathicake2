
import React from 'react';
import { Flavor, Filling, AppConfig, CakeSize } from '../types';

interface FlavorStepProps {
  selectedSize: CakeSize | null;
  selectedFlavor: Flavor | null;
  selectedFilling: Filling | null;
  onSelectFlavor: (flavor: Flavor) => void;
  onSelectFilling: (filling: Filling) => void;
  onNext: () => void;
  onBack: () => void;
  totalPrice: number;
  customFilling: string;
  onCustomFillingChange: (val: string) => void;
  config: AppConfig;
}

const FlavorStep: React.FC<FlavorStepProps> = ({ 
  selectedSize,
  selectedFlavor, 
  selectedFilling, 
  onSelectFlavor, 
  onSelectFilling, 
  onNext, 
  onBack,
  totalPrice,
  customFilling,
  onCustomFillingChange,
  config
}) => {
  const isFillingOthersSelected = selectedFilling?.id === 'others';
  const canContinue = !isFillingOthersSelected || customFilling.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-background-light relative animate-fadeIn overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 md:h-64 bg-secondary rounded-b-[3rem] -z-0 transform scale-x-110 origin-top shadow-inner"></div>
      
      <header className="relative z-10 pt-6 px-6 pb-4 text-center shrink-0">
        <button onClick={onBack} className="absolute top-6 left-6 bg-white text-black p-2 rounded-full shadow-md transition-transform active:scale-90 border border-gray-100">
          <span className="material-icons-round text-xl font-bold">arrow_back</span>
        </button>
        <div className="inline-block bg-primary px-8 py-2 rounded-[2rem] shadow-xl transform -rotate-1 animate-pop border-2 md:border-4 border-white">
          <h1 className="text-xl md:text-3xl font-display font-bold text-white tracking-widest uppercase">SABORES</h1>
        </div>
      </header>

      <main className="flex-1 px-6 relative z-10 overflow-y-auto no-scrollbar pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pt-4">
          
          <div className="space-y-8">
            <section>
              <h2 className="text-[10px] md:text-[14px] font-black text-black uppercase tracking-[0.2em] mb-4 md:mb-6 border-l-4 border-primary pl-4">1. Sabor de Ponqué</h2>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {config.flavors.map(flavor => (
                  <label key={flavor.id} className="cursor-pointer group">
                    <input type="radio" className="sr-only" checked={selectedFlavor?.id === flavor.id} onChange={() => onSelectFlavor(flavor)} />
                    <div className={`flex flex-col items-center p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-soft border-2 transition-all ${selectedFlavor?.id === flavor.id ? 'border-primary bg-white scale-105' : 'border-gray-100 bg-white/80'}`}>
                      <div className="w-12 h-12 md:w-24 md:h-24 rounded-2xl mb-2 md:mb-4 overflow-hidden shadow-inner border border-black/5" style={{ backgroundColor: flavor.textureUrl ? undefined : flavor.color }}>
                        {flavor.textureUrl ? (
                          <img src={flavor.textureUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full ${flavor.pattern || ''}`} />
                        )}
                      </div>
                      <span className="text-[9px] md:text-[13px] font-black uppercase tracking-tight text-center text-black leading-tight">{flavor.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[10px] md:text-[14px] font-black text-black uppercase tracking-[0.2em] mb-4 md:mb-6 border-l-4 border-primary pl-4">2. Rellenos Sugeridos</h2>
              <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-8">
                {config.fillings.map(filling => (
                  <label key={filling.id} className="cursor-pointer group flex flex-col items-center gap-2">
                    <input type="radio" className="sr-only" checked={selectedFilling?.id === filling.id} onChange={() => onSelectFilling(filling)} />
                    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 shadow-md transition-all overflow-hidden ${selectedFilling?.id === filling.id ? 'border-primary scale-110' : 'border-gray-50 bg-white'}`} style={{ backgroundColor: filling.textureUrl ? undefined : filling.color }}>
                      {filling.textureUrl ? (
                        <img src={filling.textureUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${filling.pattern || ''}`}>
                          {filling.id === 'others' && <span className="material-icons-round text-black text-lg md:text-2xl">edit_note</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] md:text-[12px] font-black uppercase text-center text-black leading-tight">{filling.name}</span>
                  </label>
                ))}
              </div>

              {isFillingOthersSelected && (
                <div className="mt-6 animate-pop">
                  <input 
                    type="text" 
                    placeholder="Describe el relleno de tus sueños..."
                    className="w-full bg-white border-2 border-primary/20 rounded-2xl p-4 text-xs md:text-base font-bold text-black shadow-soft outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    value={customFilling}
                    onChange={(e) => onCustomFillingChange(e.target.value)}
                  />
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col items-center justify-start lg:pt-10">
            <section className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl border border-rose-50 overflow-hidden relative w-full max-w-lg text-center">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <span className="material-icons-round text-7xl md:text-9xl">layers</span>
                </div>
                <h2 className="text-sm md:text-2xl font-display font-bold text-primary uppercase mb-6 md:mb-10 tracking-widest italic">Anatomía del Pastel</h2>
                <div className="flex justify-center">
                  <div className="relative w-32 h-48 md:w-56 md:h-80 flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden border-4 md:border-8 border-gray-900 group">
                    <div className="h-[20%] w-full relative group-hover:scale-y-110 transition-transform origin-top" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                       {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                       <div className="absolute inset-0 bg-black/5"></div>
                    </div>
                    <div className="h-[15%] w-full relative border-y border-black/10 group-hover:scale-y-125 transition-transform" style={{ backgroundColor: selectedFilling?.textureUrl ? undefined : selectedFilling?.color }}>
                       {selectedFilling?.textureUrl && <img src={selectedFilling.textureUrl} alt="relleno" className="w-full h-full object-cover" />}
                    </div> 
                    <div className="h-[20%] w-full relative border-b border-black/10 group-hover:scale-y-110 transition-transform" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                       {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                    </div>
                    <div className="h-[15%] w-full relative border-b border-black/10 group-hover:scale-y-125 transition-transform" style={{ backgroundColor: selectedFilling?.textureUrl ? undefined : selectedFilling?.color }}>
                       {selectedFilling?.textureUrl && <img src={selectedFilling.textureUrl} alt="relleno" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 w-full relative group-hover:scale-y-110 transition-transform origin-bottom" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                       {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
                <p className="mt-8 text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest italic">Previsualización de Capas Internas</p>
            </section>
          </div>

        </div>
      </main>

      <footer className="bg-surface-light p-5 md:p-8 z-50 shadow-[0_-15px_35px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Seleccionado</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                <span className="text-2xl md:text-4xl font-display text-black">{selectedSize?.diameter}cm</span>
                <span className="text-[9px] md:text-[11px] font-black text-primary uppercase bg-primary/5 px-3 md:px-4 py-0.5 rounded-lg border border-primary/10">
                  {selectedSize?.portions || 'N/A'}
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Total Estimado</span>
              <span className="text-2xl md:text-4xl font-display text-primary tracking-tighter">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onNext}
            disabled={!canContinue}
            className="w-full md:w-auto bg-primary hover:bg-rose-600 disabled:opacity-40 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-5 group text-xs md:text-sm border-2 md:border-4 border-white/10 uppercase tracking-[0.2em]"
          >
            Personalizar Diseño
            <span className="material-icons-round text-lg md:text-2xl group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FlavorStep;
