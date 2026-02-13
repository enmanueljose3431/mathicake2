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
  const diameters = Array.from(new Set<number>(config.sizes.map(s => s.diameter))).sort((a, b) => a - b);
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
      
      {/* SUB-HEADER SECTION */}
      <header className="pt-4 pb-2 px-6 md:px-10 flex flex-col items-center z-20 bg-background-light relative shrink-0">
        <div className="w-full flex justify-between items-start mb-2">
          <div className="flex-1"></div>
          <div className="flex flex-col items-center text-center">
            <span className="text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
              PASO 1: DIMENSIÓN
            </span>
            <h1 className="font-display text-lg md:text-xl text-black leading-tight uppercase tracking-tight font-black">
              {config.appTheme.brandName}
            </h1>
          </div>
          <div className="flex-1 flex justify-end gap-1.5">
            <button 
              onClick={onAdminClick}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all flex items-center justify-center shadow-sm"
            >
              <span className="material-icons-round text-base">palette</span>
            </button>
            <button 
              onClick={onAdminClick}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all flex items-center justify-center shadow-sm"
            >
              <span className="material-icons-round text-base">lock_outline</span>
            </button>
          </div>
        </div>
        
        {/* HEIGHT TOGGLE */}
        <div className="bg-slate-200/50 p-1 rounded-[2rem] flex gap-1 border border-gray-200/50 min-w-[260px] md:min-w-[300px]">
          <button 
            onClick={() => handleHeightToggle('TALL')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.8rem] text-[9px] font-black transition-all duration-300 ${currentHeight === 'TALL' ? 'bg-white text-primary shadow-md' : 'text-gray-400'}`}
          >
            <span className="material-icons-round text-sm">swap_vert</span>
            ALTO (17cm)
          </button>
          <button 
            onClick={() => handleHeightToggle('SHORT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.8rem] text-[9px] font-black transition-all duration-300 ${currentHeight === 'SHORT' ? 'bg-white text-primary shadow-md' : 'text-gray-400'}`}
          >
            <span className="material-icons-round text-sm">format_align_left</span>
            BAJO (10cm)
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background-light min-h-0">
        
        {/* INDICADOR DE MÁS TAMAÑOS (FLECHA) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 animate-pulse hidden md:flex flex-col items-center text-primary/30 pointer-events-none">
           <span className="material-icons-round text-5xl">chevron_right</span>
           <span className="text-[8px] font-black uppercase tracking-widest -mt-2">Más</span>
        </div>

        {/* Referencia de fondo */}
        <div className="absolute inset-x-0 bottom-32 md:bottom-40 flex justify-center pointer-events-none opacity-15 transition-opacity z-0">
            <div className="flex flex-col items-center translate-y-8">
                <div className="w-8 h-12 md:w-12 md:h-20 bg-gray-400 rounded-lg relative border-2 border-gray-300 shadow-sm">
                    <div className="absolute top-1 left-1 right-1 h-0.5 bg-gray-300 rounded-full opacity-50"></div>
                </div>
                <span className="text-[7px] md:text-[8px] font-black mt-1 text-gray-400 uppercase tracking-widest">Referencia</span>
            </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 flex items-end gap-12 md:gap-24 overflow-x-auto no-scrollbar px-[15vw] md:px-[30vw] pb-20 md:pb-28 pt-40 md:pt-56 snap-x snap-mandatory relative z-10"
        >
          {diameters.map((d) => {
            const isSelected = currentDiameter === d;
            const cakeForThisDiameter = config.sizes.find(s => s.diameter === d && s.heightType === currentHeight);
            
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const scaleFactor = isMobile ? 0.9 : 1.3;
            const cakeWidth = (d * 10) * scaleFactor;
            const cakeHeight = (currentHeight === 'TALL' ? 140 : 80) * scaleFactor;
            
            return (
              <div 
                key={d} 
                data-diameter={d}
                onClick={() => handleSelect(d)}
                className={`snap-center flex flex-col items-center transition-all duration-500 cursor-pointer shrink-0 ${isSelected ? 'scale-110' : 'scale-90 opacity-30 grayscale-[10%]'}`}
              >
                <div className="relative flex flex-col items-center" style={{ width: `${cakeWidth}px` }}>
                  {isSelected && (
                    <div className="absolute -top-14 md:-top-20 left-1/2 -translate-x-1/2 z-30 animate-pop">
                      <div className="bg-primary text-white text-[9px] md:text-[11px] font-black px-4 md:px-7 py-1.5 md:py-2.5 rounded-full shadow-xl-primary border-4 border-white whitespace-nowrap uppercase tracking-widest flex flex-col items-center">
                        <span className="text-[7px] md:text-[8px] opacity-80 mb-0.5">CAPACIDAD</span>
                        {cakeForThisDiameter?.portions || 'N/A'}
                      </div>
                      <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white rotate-45 mx-auto -mt-1 md:-mt-1.5"></div>
                    </div>
                  )}

                  <svg 
                    viewBox={`0 0 ${cakeWidth} ${cakeHeight + 40}`} 
                    width={cakeWidth} 
                    height={cakeHeight + 40}
                    className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_25px_30px_rgba(0,0,0,0.12)]' : 'drop-shadow-sm'}`}
                  >
                    <ellipse cx={cakeWidth/2} cy={cakeHeight + 20} rx={cakeWidth/2} ry="10" fill="rgba(0,0,0,0.05)" />
                    <path 
                      d={`M0 20 L0 ${cakeHeight} Q${cakeWidth/2} ${cakeHeight + 20} ${cakeWidth} ${cakeHeight} L${cakeWidth} 20`} 
                      fill={currentHeight === 'TALL' ? (isSelected ? 'var(--primary-color)' : '#FADBD8') : (isSelected ? 'var(--secondary-color)' : '#FEF9E7')} 
                    />
                    <ellipse cx={cakeWidth/2} cy="20" rx={cakeWidth/2} ry="18" fill={isSelected ? "#FFF" : "#FDFDFD"} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
                    <text 
                      x="50%" 
                      y={cakeHeight/2 + 25} 
                      textAnchor="middle" 
                      className={`font-display transition-all duration-500 pointer-events-none ${isSelected ? (currentHeight === 'TALL' ? 'fill-white text-2xl md:text-3xl' : 'fill-black text-2xl md:text-3xl') : 'fill-gray-300 opacity-30 text-xl'}`}
                    >
                      {d}
                    </text>
                  </svg>
                </div>

                <div className={`mt-8 md:mt-12 flex flex-col items-center gap-1 md:gap-1.5 transition-all duration-500 ${isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-40 translate-y-3 scale-90'}`}>
                  <div className={`font-display text-3xl md:text-5xl tracking-tighter ${isSelected ? 'text-black' : 'text-gray-300'}`}>{d}cm</div>
                  <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 md:px-5 py-1 rounded-full ${isSelected ? 'bg-primary/5 text-primary border-2 border-primary/10' : 'bg-transparent text-gray-300'}`}>
                    Diámetro
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-light p-5 md:p-8 z-50 shadow-[0_-15px_35px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Seleccionado</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                <span className="text-2xl md:text-4xl font-display text-black">{currentDiameter}cm</span>
                <span className="text-[9px] md:text-[11px] font-black text-primary uppercase bg-primary/5 px-3 md:px-4 py-0.5 rounded-lg border border-primary/10">
                  {currentCakeData?.portions || 'N/A'}
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Precio Sugerido</span>
              <span className="text-2xl md:text-4xl font-display text-primary tracking-tighter">${(selectedSize?.basePrice || 0).toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onNext}
            className="w-full md:w-auto bg-primary hover:bg-rose-600 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-5 group text-xs md:text-sm border-2 md:border-4 border-white/10"
          >
            <span className="uppercase tracking-[0.2em] md:tracking-[0.25em]">Personalizar Pastel</span>
            <span className="material-icons-round text-lg md:text-2xl group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SizeStep;