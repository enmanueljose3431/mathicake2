
import React from 'react';
import { DecorationStyle, TopperType, AppState, AppConfig, CakeSize } from '../types';

interface DecorationStepProps {
  selectedSize: CakeSize | null;
  selectedDecoration: DecorationStyle;
  cakeColors: string[];
  topperType: TopperType;
  hasSpheres: boolean;
  onUpdateDecoration: (_data: Partial<AppState>) => void;
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

  const topperOptions: { id: TopperType; label: string; icon: string; desc: string }[] = [
    { id: 'none', label: 'Sin Topper', icon: 'block', desc: 'Sencillo y elegante' },
    { id: 'generic', label: 'Genérico', icon: 'celebration', desc: 'Letreros estándar' },
    { id: 'personalized', label: 'Personalizado', icon: 'edit_note', desc: 'Nombre y edad' },
    { id: 'plus_pieces', label: 'Topper+Piezas', icon: 'auto_fix_high', desc: 'Set decorativo 3D' },
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
        {/* VISTA PREVIA DEL PASTEL */}
        <div className="w-full md:w-[40%] bg-slate-50 flex flex-col items-center justify-center p-4 md:p-10 border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:shrink overflow-hidden">
          <div className="relative w-full max-w-[200px] md:max-w-[320px] filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.1)] transform transition-transform duration-700 hover:scale-105">
            <svg className="w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              <ellipse cx="100" cy="285" fill="rgba(0,0,0,0.1)" rx="85" ry="12"></ellipse>
              {renderCakeBody()}
              <ellipse cx="100" cy="100" fill="#FFFFFF" rx="55" ry="15" stroke="rgba(0,0,0,0.05)" strokeWidth="1"></ellipse>
              {topperType !== 'none' && (
                <g className="animate-pop">
                   <line x1="100" y1="40" x2="100" y2="90" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                   <rect x="70" y="5" width="60" height="45" rx="10" fill="var(--primary-color)" />
                   <text x="100" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" style={{fontFamily: 'Fredoka One'}}>TOPPER</text>
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

        {/* OPCIONES DE DISEÑO */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-10 space-y-10 md:space-y-16 pb-20 bg-white">
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 border-l-4 border-primary pl-4">
               1. Estilo de Cobertura
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(config.decorations).map(key => {
                const decor = config.decorations[key];
                const isSelected = selectedDecoration === key;
                const standardIcon = (styles as any)[key]?.icon || 'auto_fix_normal';
                
                return (
                  <button 
                    key={key}
                    onClick={() => onUpdateDecoration({ selectedDecoration: key })}
                    className={`flex flex-col items-center gap-4 p-5 md:p-8 rounded-[2rem] border-2 transition-all shadow-soft overflow-hidden relative ${isSelected ? 'border-primary bg-primary/5 scale-105' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                  >
                    {decor.textureUrl ? (
                      <img src={decor.textureUrl} className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover mb-2 border border-gray-100" />
                    ) : (
                      <span className={`material-icons-round text-4xl md:text-6xl ${isSelected ? 'text-primary' : 'text-gray-300'}`}>{standardIcon}</span>
                    )}
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center text-black leading-tight">{decor.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 border-l-4 border-primary pl-4">
               2. Paleta de Colores
            </h3>
            <div className="flex flex-wrap gap-3 md:gap-5">
              {config.colors.map((color) => {
                const isSelected = cakeColors.includes(color.hex);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(color.hex)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 shadow-soft transition-all transform active:scale-90 relative flex items-center justify-center ${isSelected ? 'border-primary scale-110 ring-4 ring-primary/10' : 'border-gray-100 hover:scale-105'}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <span className={`material-icons-round ${color.hex === '#FFFFFF' ? 'text-primary' : 'text-white'} text-xl md:text-3xl font-black drop-shadow-lg`}>check</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-l-4 border-primary pl-4">
               3. Toppers Sugeridos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {topperOptions.map(t => {
                const isSelected = topperType === t.id;
                const price = config.topperPrices[t.id] || 0;
                return (
                  <button 
                    key={t.id}
                    onClick={() => onUpdateDecoration({ topperType: t.id })}
                    className={`flex items-center gap-5 p-5 md:p-6 rounded-[2.5rem] border-2 transition-all relative group shadow-soft ${isSelected ? 'border-primary bg-primary/5 scale-[1.03] ring-4 ring-primary/5' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                  >
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.8rem] flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-gray-400 group-hover:bg-slate-100'}`}>
                      <span className="material-icons-round text-2xl md:text-4xl">{t.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-[11px] md:text-sm font-black uppercase tracking-tight text-black block mb-0.5">{t.label}</span>
                      <span className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase block leading-tight">{t.desc}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      {price > 0 ? (
                        <div className={`px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-tighter shadow-sm ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                          +${price.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest px-2">Incluido</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ESFERAS DECORATIVAS */}
            <div className={`p-6 md:p-8 rounded-[3rem] transition-all border-2 flex items-center justify-between group cursor-pointer ${hasSpheres ? 'bg-primary shadow-xl-primary border-primary scale-[1.02]' : 'bg-white shadow-soft border-gray-100 hover:border-gray-300'}`}
                 onClick={() => onUpdateDecoration({ hasSpheres: !hasSpheres })}
            >
               <div className="flex items-center gap-5 md:gap-8">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-inner ${hasSpheres ? 'bg-white text-primary' : 'bg-slate-50 text-gray-300'}`}>
                     <span className="material-icons-round text-3xl md:text-5xl">lens</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm md:text-xl font-black uppercase tracking-widest leading-none mb-1 md:mb-2 ${hasSpheres ? 'text-white' : 'text-black'}`}>Esferas Decorativas</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] md:text-xs font-black uppercase bg-white/20 px-3 py-1 rounded-full border border-white/20 ${hasSpheres ? 'text-white' : 'text-primary bg-primary/5 border-primary/10'}`}>
                        +${config.spheresPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
               </div>
               <div className={`w-16 h-10 md:w-24 md:h-12 rounded-full relative flex items-center px-2 transition-all ${hasSpheres ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full shadow-lg transform transition-transform duration-500 ${hasSpheres ? 'translate-x-6 md:translate-x-12 bg-white' : 'translate-x-0 bg-gray-300'}`}></div>
               </div>
            </div>
          </section>

          <section className="pt-10 border-t border-gray-100">
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-l-4 border-primary pl-4">
               4. Galería de Inspiración
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-8 tracking-wider">
              Mira algunos de nuestros trabajos previos y el estilo utilizado en cada uno:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {config.inspirationGallery.map((item, idx) => {
                const styleInfo = config.decorations[item.style] || { label: item.style };
                return (
                  <div key={idx} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img 
                        src={item.url} 
                        alt={`Inspiración ${idx}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <p className="text-white text-[10px] md:text-xs font-bold leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col items-center gap-3">
                      <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                        Estilo: {styleInfo.label}
                      </span>
                      <button 
                        onClick={() => onUpdateDecoration({ selectedDecoration: item.style })}
                        className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white text-slate-400 text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        Usar este estilo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
