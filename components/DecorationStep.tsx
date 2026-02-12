
import React from 'react';
import { DecorationStyle, TopperType, AppState, AppConfig, CakeSize } from '../types';

interface DecorationStepProps {
  selectedSize: CakeSize | null;
  selectedDecoration: DecorationStyle;
  cakeColors: string[];
  topperType: TopperType;
  hasSpheres: boolean;
  onUpdateDecoration: (data: Partial<AppState>) => void;
  onNext: () => void;
  onBack: () => void;
  totalPrice: number;
  config: AppConfig;
}

const DecorationStep: React.FC<DecorationStepProps> = ({ 
  selectedSize,
  selectedDecoration, 
  cakeColors,
  topperType,
  hasSpheres,
  onUpdateDecoration, 
  onNext, 
  onBack,
  totalPrice,
  config
}) => {
  const styles = {
    liso: { label: "Liso", icon: "crop_square" },
    vintage: { label: "Vintage", icon: "auto_awesome" },
    textura: { label: "Textura", icon: "reorder" },
    degradado: { label: "Degradado", icon: "opacity" }
  };

  const toppers: { id: TopperType; label: string; icon: string }[] = [
    { id: 'none', label: 'Sin Topper', icon: 'do_not_disturb_on' },
    { id: 'generic', label: 'Genérico', icon: 'star' },
    { id: 'personalized', label: 'Personalizado', icon: 'edit' },
    { id: 'plus_pieces', label: 'Topper+Piezas', icon: 'auto_fix_high' },
  ];

  const handleColorClick = (hex: string) => {
    if (selectedDecoration !== 'degradado') {
      onUpdateDecoration({ cakeColors: [hex] });
    } else {
      if (cakeColors.includes(hex)) {
        if (cakeColors.length > 1) {
          onUpdateDecoration({ cakeColors: cakeColors.filter(c => c !== hex) });
        }
      } else {
        if (cakeColors.length < 3) {
          onUpdateDecoration({ cakeColors: [...cakeColors, hex] });
        }
      }
    }
  };

  const renderCakeBody = () => {
    const customDecor = config.decorations[selectedDecoration];
    const primaryColor = cakeColors[0] || '#FFFFFF';

    if (customDecor?.textureUrl) {
      return (
        <g>
          <defs>
            <pattern id="decorPattern" patternUnits="userSpaceOnUse" width="110" height="170">
              <image href={customDecor.textureUrl} x="0" y="0" width="110" height="170" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </defs>
          <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill="url(#decorPattern)" stroke="rgba(0,0,0,0.1)" strokeWidth="1"></path>
          {cakeColors.length > 0 && <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill={primaryColor} fillOpacity="0.2" />}
        </g>
      );
    }

    if (selectedDecoration === 'degradado') {
      const stops = cakeColors.length === 1 
        ? [{ offset: '0%', color: '#FFFFFF' }, { offset: '100%', color: cakeColors[0] }]
        : cakeColors.map((color, i) => ({ offset: `${(i / (cakeColors.length - 1)) * 100}%`, color }));

      return (
        <g>
          <defs>
            <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {stops.map((stop, i) => <stop key={i} offset={stop.offset} stopColor={stop.color} />)}
            </linearGradient>
          </defs>
          <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill="url(#cakeGrad)" stroke="rgba(0,0,0,0.1)" strokeWidth="1"></path>
        </g>
      );
    }

    return (
      <g>
        <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill={primaryColor} stroke="rgba(0,0,0,0.1)" strokeWidth="1"></path>
        {selectedDecoration === 'textura' && (
          <g opacity="0.9">
            <line x1="45" y1="130" x2="155" y2="130" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="160" x2="155" y2="160" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="190" x2="155" y2="190" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="220" x2="155" y2="220" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="1 3" />
          </g>
        )}
        {selectedDecoration === 'vintage' && (
          <g>
            <path d="M45 100 Q60 80 75 100 Q90 80 105 100 Q120 80 135 100 Q150 80 155 100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
            <path d="M45 190 Q60 170 75 190 Q90 170 105 190 Q120 170 135 190 Q150 170 155 190" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-light relative animate-fadeIn overflow-hidden">
      {/* HEADER - Bordes suavizados */}
      <header className="pt-6 pb-3 px-4 md:pt-8 md:pb-4 md:px-8 flex items-center justify-between z-20 bg-white shadow-soft border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center text-primary transition-all active:scale-90 border border-gray-100 shadow-soft">
            <span className="material-icons-round text-lg md:text-2xl font-bold">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[12px] font-black text-primary/60 uppercase tracking-[0.2em]">Paso 3: Diseño</span>
            <h1 className="text-lg md:text-3xl font-display text-black uppercase leading-none">Personalización</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row w-full z-10 overflow-hidden">
        
        {/* VISTA PREVIA - Bordes suavizados */}
        <div className="w-full md:w-[45%] bg-slate-50 flex flex-col items-center justify-center p-4 md:p-10 border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:shrink">
          <div className="relative w-full max-w-[220px] md:max-w-[340px] aspect-[4/3] md:aspect-[3/4] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform scale-100 md:scale-105">
            <svg className="w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              <ellipse cx="100" cy="285" fill="rgba(0,0,0,0.15)" rx="85" ry="15"></ellipse>
              {renderCakeBody()}
              <ellipse cx="100" cy="100" fill="#FFFFFF" rx="55" ry="15" stroke="rgba(0,0,0,0.05)" strokeWidth="1"></ellipse>
              {topperType !== 'none' && (
                <g className="animate-pop">
                   <line x1="100" y1="50" x2="100" y2="90" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
                   <rect x="65" y="15" width="70" height="50" rx="12" fill="var(--primary-color)" fillOpacity="0.9" />
                   <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="900">CAKE</text>
                </g>
              )}
              {hasSpheres && (
                <g className="animate-pop">
                  <circle cx={155} cy={130} r={16} fill="var(--primary-color)" fillOpacity="0.8" />
                  <circle cx={172} cy={165} r={12} fill="var(--secondary-color)" fillOpacity="0.8" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* PANEL DE OPCIONES */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-10 space-y-10 md:space-y-16 pb-10 bg-white">
          
          {/* 1. ESTILOS */}
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 border-primary pl-3 md:pl-5">
               1. Estilo de Cobertura
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {Object.keys(config.decorations).map(key => {
                const decor = config.decorations[key];
                const isSelected = selectedDecoration === key;
                const standardIcon = (styles as any)[key]?.icon || 'auto_fix_normal';
                
                return (
                  <button 
                    key={key}
                    onClick={() => onUpdateDecoration({ selectedDecoration: key })}
                    className={`flex flex-col items-center gap-3 md:gap-6 p-4 md:p-10 rounded-[2rem] border-2 transition-all shadow-soft overflow-hidden relative ${isSelected ? 'border-primary bg-primary/5 scale-105' : 'border-gray-50 bg-white'}`}
                  >
                    {decor.textureUrl ? (
                      <img src={decor.textureUrl} className="w-20 h-20 md:w-32 md:h-32 rounded-2xl object-cover mb-2 border border-gray-100" />
                    ) : (
                      <span className={`material-icons-round text-4xl md:text-7xl ${isSelected ? 'text-primary' : 'text-gray-300'}`}>{standardIcon}</span>
                    )}
                    <span className="text-[10px] md:text-[14px] font-black uppercase tracking-widest text-center text-black leading-tight">{decor.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. COLORES */}
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 border-primary pl-3 md:pl-5">
               2. Paleta de Colores
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-12 gap-3 md:gap-6 mb-6">
              {config.colors.map((color) => {
                const isSelected = cakeColors.includes(color.hex);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(color.hex)}
                    className={`aspect-square rounded-full border-2 shadow-soft transition-all transform active:scale-90 relative flex items-center justify-center ${isSelected ? 'border-primary scale-110 ring-4 md:ring-8 ring-primary/10' : 'border-gray-100'}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <span className={`material-icons-round ${color.hex === '#FFFFFF' ? 'text-primary' : 'text-white'} text-lg md:text-3xl font-black drop-shadow-xl`}>check</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. TOPPERS */}
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 border-primary pl-3 md:pl-5">
               3. Toppers y Extras
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8 mb-6">
              {toppers.map(t => (
                <button 
                  key={t.id}
                  onClick={() => onUpdateDecoration({ topperType: t.id })}
                  className={`flex items-center gap-3 md:gap-8 p-3 md:p-8 rounded-[2rem] border-2 transition-all ${topperType === t.id ? 'border-primary bg-primary/5 shadow-soft' : 'border-gray-50 bg-white'}`}
                >
                  <span className={`material-icons-round text-xl md:text-4xl ${topperType === t.id ? 'text-primary' : 'text-gray-300'}`}>{t.icon}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] md:text-[15px] font-black uppercase tracking-tighter md:tracking-widest text-black">{t.label}</span>
                    <span className="text-[8px] md:text-[11px] font-bold text-slate-400 uppercase">+${config.topperPrices[t.id] || 0}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* TOGGLE ESFERAS - Bordes suavizados */}
            <div className="bg-white p-4 md:p-10 rounded-[2.5rem] shadow-soft border border-gray-100 flex items-center justify-between group">
               <div className="flex items-center gap-4 md:gap-10">
                  <div className={`w-12 h-12 md:w-24 md:h-24 rounded-[1.5rem] flex items-center justify-center transition-all shadow-soft border ${hasSpheres ? 'bg-primary/5 text-primary border-primary/20 scale-105' : 'bg-slate-50 text-gray-300 border-gray-100'}`}>
                     <span className="material-icons-round text-2xl md:text-5xl">lens</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-xl font-black text-black uppercase tracking-tight md:tracking-widest leading-none mb-1 md:mb-2">Esferas Decorativas</span>
                    <span className="text-[9px] md:text-sm font-black text-primary uppercase bg-primary/10 px-2 md:px-4 py-0.5 md:py-1 rounded-full border border-primary/10 w-fit">+$8.00</span>
                  </div>
               </div>
               <button 
                  onClick={() => onUpdateDecoration({ hasSpheres: !hasSpheres })}
                  className={`w-14 h-8 md:w-24 md:h-12 rounded-full relative flex items-center px-1 md:px-2 transition-all shadow-inner border border-gray-100 ${hasSpheres ? 'bg-primary' : 'bg-gray-200'}`}
               >
                  <div className={`w-5 h-5 md:w-8 md:h-8 rounded-full bg-white shadow-xl transform transition-transform duration-500 ${hasSpheres ? 'translate-x-6 md:translate-x-10' : 'translate-x-0'}`}></div>
               </button>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER - Compacto consistente con SizeStep */}
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
            className="w-full md:w-auto bg-primary hover:bg-rose-600 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-5 group text-xs md:text-sm border-2 md:border-4 border-white/10 uppercase tracking-[0.2em]"
          >
            Siguiente
            <span className="material-icons-round text-lg md:text-2xl group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DecorationStep;
