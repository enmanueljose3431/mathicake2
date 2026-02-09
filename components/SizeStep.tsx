
import React, { useRef, useEffect } from 'react';
import { CakeSize, HeightType, AppConfig } from '../types';

interface SizeStepProps {
  selectedSize: CakeSize | null;
  onSelectSize: (size: CakeSize) => void;
  onNext: () => void;
  onAdminClick: () => void;
  config: AppConfig;
}

const SizeStep: React.FC<SizeStepProps> = ({ selectedSize, onSelectSize, onNext, onAdminClick, config }) => {
  const diameters = Array.from(new Set(config.sizes.map(s => s.diameter))).sort((a, b) => a - b);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentDiameter = selectedSize?.diameter || 18;
  const currentHeight = selectedSize?.heightType || 'TALL';
  const currentCakeData = config.sizes.find(s => s.diameter === currentDiameter && s.heightType === currentHeight);

  const handleHeightToggle = (h: HeightType) => {
    const newSize = config.sizes.find(s => s.diameter === currentDiameter && s.heightType === h);
    if (newSize) onSelectSize(newSize);
  };

  const handleSelect = (d: number) => {
    const newSize = config.sizes.find(s => s.diameter === d && s.heightType === currentHeight);
    if (newSize) onSelectSize(newSize);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector(`[data-diameter="${currentDiameter}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentDiameter]);

  return (
    <div className="flex flex-col h-full bg-background-light animate-fadeIn overflow-hidden relative">
      {/* Botones de Administración Discretos */}
      <div className="absolute top-4 right-4 z-[60] flex gap-2">
        <button 
          onClick={onAdminClick}
          title="Personalizar Tema"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/50 text-gray-300 hover:text-white transition-all flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md"
        >
          <span className="material-icons-round text-lg">palette</span>
        </button>
        <button 
          onClick={onAdminClick}
          title="Administración"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-slate-900/50 text-gray-300 hover:text-white transition-all flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md"
        >
          <span className="material-icons-round text-lg">lock</span>
        </button>
      </div>

      {/* CABECERA */}
      <header className="pt-4 pb-2 md:pt-8 md:pb-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center z-20 bg-surface-light/95 backdrop-blur-md border-b border-gray-100 shrink-0">
        <div className="text-center md:text-left mb-3 md:mb-0">
          <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest mb-1 inline-block">Paso 1: Dimensión</span>
          <h1 className="font-display text-2xl md:text-4xl text-black leading-tight uppercase tracking-tight">{config.appTheme.brandName}</h1>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-xl md:rounded-2xl flex gap-1 border border-gray-200 min-w-[240px] md:min-w-[260px]">
          <button 
            onClick={() => handleHeightToggle('SHORT')}
            className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all duration-300 ${currentHeight === 'SHORT' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
          >
            <span className="material-icons-round text-sm md:text-base">reorder</span>
            BAJO (10cm)
          </button>
          <button 
            onClick={() => handleHeightToggle('TALL')}
            className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all duration-300 ${currentHeight === 'TALL' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
          >
            <span className="material-icons-round text-sm md:text-base">height</span>
            ALTO (17cm)
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-surface-light to-background-light min-h-0">
        <div className="absolute inset-x-0 bottom-36 md:bottom-44 flex justify-center pointer-events-none opacity-20 transition-opacity z-0">
            <div className="flex flex-col items-center">
                <div className="w-10 h-16 md:w-14 md:h-24 bg-gray-400 rounded-lg relative border-2 border-gray-300 shadow-sm">
                    <div className="absolute top-1 left-2 right-2 h-1 bg-gray-300 rounded-full opacity-50"></div>
                </div>
                <span className="text-[8px] md:text-[9px] font-black mt-1 md:mt-2 text-gray-400 uppercase tracking-widest">Referencia</span>
            </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 flex items-end gap-8 md:gap-20 overflow-x-auto no-scrollbar px-[15vw] md:px-[30vw] pb-24 md:pb-36 pt-4 md:pt-10 snap-x snap-mandatory relative z-10"
        >
          {diameters.map((d) => {
            const isSelected = currentDiameter === d;
            const cakeForThisDiameter = config.sizes.find(s => s.diameter === d && s.heightType === currentHeight);
            
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const scaleFactor = isMobile ? 0.8 : 1.35;
            const cakeWidth = (d * 10) * scaleFactor;
            const cakeHeight = (currentHeight === 'TALL' ? 150 : 80) * scaleFactor;
            
            return (
              <div 
                key={d} 
                data-diameter={d}
                onClick={() => handleSelect(d)}
                className={`snap-center flex flex-col items-center transition-all duration-500 cursor-pointer shrink-0 ${isSelected ? 'scale-110' : 'scale-90 opacity-50 grayscale-[40%]'}`}
              >
                <div className="relative flex flex-col items-center" style={{ width: `${cakeWidth}px` }}>
                  {isSelected && (
                    <div className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 z-30 animate-pop">
                      <div className="bg-primary text-white text-[9px] md:text-[11px] font-black px-4 md:px-6 py-1.5 md:py-2.5 rounded-full shadow-xl-primary border-2 border-white whitespace-nowrap uppercase tracking-widest flex flex-col items-center">
                        <span className="text-[7px] md:text-[8px] opacity-80 mb-0.5">Capacidad</span>
                        {cakeForThisDiameter?.portions || 'N/A'}
                      </div>
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-white rotate-45 mx-auto -mt-1.5 md:-mt-2"></div>
                    </div>
                  )}

                  <svg 
                    viewBox={`0 0 ${cakeWidth} ${cakeHeight + 40}`} 
                    width={cakeWidth} 
                    height={cakeHeight + 40}
                    className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_15px_15px_rgba(var(--primary-color-rgb),0.25)]' : 'drop-shadow-lg'}`}
                  >
                    <ellipse cx={cakeWidth/2} cy={cakeHeight + 20} rx={cakeWidth/2} ry="10" fill="rgba(0,0,0,0.08)" />
                    <path 
                      d={`M0 20 L0 ${cakeHeight} Q${cakeWidth/2} ${cakeHeight + 20} ${cakeWidth} ${cakeHeight} L${cakeWidth} 20`} 
                      fill={currentHeight === 'TALL' ? (isSelected ? 'var(--primary-color)' : '#F472B6') : (isSelected ? 'var(--secondary-color)' : '#FEF08A')} 
                    />
                    <ellipse cx={cakeWidth/2} cy="20" rx={cakeWidth/2} ry="15" fill={isSelected ? "#FFF" : "#FAFAFA"} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                    <text 
                      x="50%" 
                      y={cakeHeight/2 + 25} 
                      textAnchor="middle" 
                      className={`font-display text-2xl md:text-4xl transition-all duration-500 pointer-events-none ${isSelected ? (currentHeight === 'TALL' ? 'fill-white' : 'fill-black') : 'fill-gray-400 opacity-60'}`}
                    >
                      {d}
                    </text>
                  </svg>
                </div>

                <div className={`mt-4 md:mt-6 flex flex-col items-center gap-0.5 md:gap-1 transition-all duration-500 ${isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-60 translate-y-2 scale-90'}`}>
                  <div className={`font-display text-3xl md:text-5xl tracking-tighter ${isSelected ? 'text-black' : 'text-gray-400'}`}>{d}cm</div>
                  <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] px-3 md:px-4 py-0.5 rounded-full ${isSelected ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-gray-100 text-gray-400 border border-transparent'}`}>
                    Diámetro
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-light p-4 md:p-8 z-50 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] md:rounded-t-[3rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-8">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Seleccionado</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-2xl md:text-3xl font-display text-black">{currentDiameter}cm</span>
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase bg-primary/5 px-2.5 md:px-3 py-0.5 rounded-lg border border-primary/10">
                  {currentCakeData?.portions || 'N/A'}
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100 hidden md:block"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Precio Sugerido</span>
              <span className="text-2xl md:text-3xl font-display text-primary tracking-tighter">${(selectedSize?.basePrice || 0).toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onNext}
            className="w-full md:w-auto bg-primary hover:opacity-90 text-white font-black py-3.5 md:py-4 px-10 md:px-12 rounded-[1.5rem] md:rounded-[2rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-4 group text-xs md:text-sm"
          >
            <span className="uppercase tracking-[0.15em] md:tracking-[0.2em]">Personalizar Pastel</span>
            <span className="material-icons-round text-lg md:text-xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SizeStep;
