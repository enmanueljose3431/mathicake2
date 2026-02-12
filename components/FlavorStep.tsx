
import React from 'react';
import { Flavor, Filling, AppConfig } from '../types';

interface FlavorStepProps {
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
    <div className="flex flex-col h-full bg-background-light relative animate-fadeIn">
      <div className="absolute top-0 left-0 w-full h-64 bg-secondary rounded-b-[4rem] -z-0 transform scale-x-110 origin-top shadow-inner"></div>
      
      <header className="relative z-10 pt-12 px-6 pb-6 text-center">
        <button onClick={onBack} className="absolute top-10 left-6 bg-white text-black p-2 rounded-full shadow-md transition-transform active:scale-90 border border-gray-100">
          <span className="material-icons-round text-xl font-bold">arrow_back</span>
        </button>
        <div className="inline-block bg-primary px-10 py-3 rounded-[2rem] shadow-xl transform -rotate-2 animate-pop border-4 border-white">
          <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase">SABORES</h1>
        </div>
      </header>

      <main className="flex-1 px-6 relative z-10 pb-44 overflow-y-auto no-scrollbar">
        <section className="mb-10">
          <h2 className="text-sm font-black text-black uppercase tracking-widest mb-5">1. Sabor de Ponqué</h2>
          <div className="grid grid-cols-3 gap-4">
            {config.flavors.map(flavor => (
              <label key={flavor.id} className="cursor-pointer group">
                <input type="radio" className="sr-only" checked={selectedFlavor?.id === flavor.id} onChange={() => onSelectFlavor(flavor)} />
                <div className={`flex flex-col items-center p-4 rounded-[2rem] shadow-soft border-2 transition-all ${selectedFlavor?.id === flavor.id ? 'border-primary bg-white scale-105' : 'border-gray-300 bg-white/80'}`}>
                  <div className="w-14 h-14 rounded-2xl mb-3 overflow-hidden shadow-inner border border-black/10" style={{ backgroundColor: flavor.textureUrl ? undefined : flavor.color }}>
                    {flavor.textureUrl ? (
                      <img src={flavor.textureUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${flavor.pattern || ''}`} />
                    )}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight text-center text-black">{flavor.name}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-black text-black uppercase tracking-widest mb-5">2. Rellenos</h2>
          <div className="grid grid-cols-4 gap-4">
            {config.fillings.map(filling => (
              <label key={filling.id} className="cursor-pointer group flex flex-col items-center gap-2">
                <input type="radio" className="sr-only" checked={selectedFilling?.id === filling.id} onChange={() => onSelectFilling(filling)} />
                <div className={`w-14 h-14 rounded-full border-4 shadow-md transition-all overflow-hidden ${selectedFilling?.id === filling.id ? 'border-primary scale-110' : 'border-gray-200 bg-white'}`} style={{ backgroundColor: filling.textureUrl ? undefined : filling.color }}>
                  {filling.textureUrl ? (
                    <img src={filling.textureUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${filling.pattern || ''}`}>
                      {filling.id === 'others' && <span className="material-icons-round text-black">edit_note</span>}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase text-center text-black leading-tight">{filling.name}</span>
              </label>
            ))}
          </div>

          {isFillingOthersSelected && (
            <div className="mt-5 animate-pop">
              <input 
                type="text" 
                placeholder="¿Qué relleno deseas?"
                className="w-full bg-white border-2 border-primary/20 rounded-2xl p-4 text-sm font-bold text-black shadow-soft outline-none"
                value={customFilling}
                onChange={(e) => onCustomFillingChange(e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="bg-white rounded-[3rem] p-8 shadow-2xl border border-rose-50 overflow-hidden relative mb-10 text-center">
            <h2 className="text-lg font-display font-bold text-primary uppercase mb-6">Vista de Capas</h2>
            <div className="flex justify-center py-2">
              <div className="relative w-44 h-48 flex flex-col shadow-2xl rounded-xl overflow-hidden border-4 border-gray-900">
                <div className="h-[20%] w-full relative" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                   {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                   <div className="absolute inset-0 bg-black/5"></div>
                </div>
                <div className="h-[15%] w-full relative border-y border-black/10" style={{ backgroundColor: selectedFilling?.textureUrl ? undefined : selectedFilling?.color }}>
                   {selectedFilling?.textureUrl && <img src={selectedFilling.textureUrl} alt="relleno" className="w-full h-full object-cover" />}
                </div> 
                <div className="h-[20%] w-full relative border-b border-black/10" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                   {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                </div>
                <div className="h-[15%] w-full relative border-b border-black/10" style={{ backgroundColor: selectedFilling?.textureUrl ? undefined : selectedFilling?.color }}>
                   {selectedFilling?.textureUrl && <img src={selectedFilling.textureUrl} alt="relleno" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 w-full relative" style={{ backgroundColor: selectedFlavor?.textureUrl ? undefined : selectedFlavor?.color }}>
                   {selectedFlavor?.textureUrl && <img src={selectedFlavor.textureUrl} alt="textura" className="w-full h-full object-cover" />}
                </div>
              </div>
            </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t p-8 z-50 flex items-center justify-between shadow-2xl rounded-t-[3rem]">
        <div className="flex flex-col">
          <span className="text-3xl font-display font-bold text-black">${totalPrice.toFixed(2)}</span>
        </div>
        <button onClick={onNext} disabled={!canContinue} className="bg-primary hover:bg-rose-600 disabled:opacity-40 text-white font-black py-5 px-10 rounded-[2rem] shadow-xl flex items-center gap-3">
          <span className="text-sm uppercase">Diseñar Exterior</span>
          <span className="material-icons-round">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default FlavorStep;
