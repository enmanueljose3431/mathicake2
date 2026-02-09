
import React from 'react';
import { DecorationStyle, TopperType, AppState, AppConfig } from '../types';

interface DecorationStepProps {
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
          <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill="url(#cakeGrad)" stroke="#000" strokeWidth="2.5"></path>
        </g>
      );
    }

    const primaryColor = cakeColors[0] || '#FFFFFF';
    return (
      <g>
        <path d="M45 100 L45 270 Q100 290 155 270 L155 100" fill={primaryColor} stroke="#000" strokeWidth="2.5"></path>
        {selectedDecoration === 'textura' && (
          <g opacity="0.9">
            <line x1="45" y1="130" x2="155" y2="130" stroke="#000" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="160" x2="155" y2="160" stroke="#000" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="190" x2="155" y2="190" stroke="#000" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="45" y1="220" x2="155" y2="220" stroke="#000" strokeWidth="2" strokeDasharray="1 3" />
          </g>
        )}
        {selectedDecoration === 'vintage' && (
          <g>
            <path d="M45 100 Q60 80 75 100 Q90 80 105 100 Q120 80 135 100 Q150 80 155 100" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="6" />
            <path d="M45 190 Q60 170 75 190 Q90 170 105 190 Q120 170 135 190 Q150 170 155 190" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="6" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-light relative animate-fadeIn">
      {/* HEADER COMPACTO PARA MÓVIL */}
      <header className="pt-6 pb-3 px-4 md:pt-8 md:pb-4 md:px-8 flex items-center justify-between z-20 bg-white shadow-lg border-b-4 border-black shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center text-black transition-all active:scale-90 border-2 md:border-4 border-black shadow-md">
            <span className="material-icons-round text-lg md:text-2xl font-bold">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[12px] font-black text-primary uppercase tracking-[0.2em]">Paso 3: Diseño</span>
            <h1 className="text-lg md:text-3xl font-display text-black uppercase leading-none">Personalización</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row w-full z-10 overflow-hidden">
        
        {/* VISTA PREVIA: Arriba en móvil, Lateral en Escritorio */}
        <div className="w-full md:w-[45%] bg-slate-100 flex flex-col items-center justify-center p-4 md:p-10 border-b-4 md:border-b-0 md:border-r-8 border-black shrink-0 md:shrink">
          <div className="relative w-full max-w-[220px] md:max-w-[340px] aspect-[4/3] md:aspect-[3/4] filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)] md:drop-shadow-[0_50px_60px_rgba(0,0,0,0.3)] transform scale-100 md:scale-105">
            <svg className="w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              <ellipse cx="100" cy="285" fill="rgba(0,0,0,0.25)" rx="85" ry="15"></ellipse>
              {renderCakeBody()}
              <ellipse cx="100" cy="100" fill="#FFFFFF" rx="55" ry="15" stroke="#000" strokeWidth="2.5"></ellipse>
              {topperType !== 'none' && (
                <g className="animate-pop">
                   <line x1="100" y1="50" x2="100" y2="90" stroke="#000" strokeWidth="3" />
                   <rect x="65" y="15" width="70" height="50" rx="12" fill="#E31C58" stroke="#000" strokeWidth="2" />
                   <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="900">CAKE</text>
                </g>
              )}
              {hasSpheres && (
                <g className="animate-pop">
                  <circle cx={155} cy={130} r={16} fill="#E31C58" stroke="#000" strokeWidth={2.5} />
                  <circle cx={172} cy={165} r={12} fill="#FFEB3B" stroke="#000" strokeWidth={2.5} />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* PANEL DE OPCIONES: Scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-10 space-y-10 md:space-y-16 pb-40 md:pb-48 bg-white">
          
          {/* 1. ESTILOS */}
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 md:border-l-8 border-black pl-3 md:pl-5">
               1. Estilo de Cobertura
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {(Object.keys(styles) as DecorationStyle[]).map(key => (
                <button 
                  key={key}
                  onClick={() => onUpdateDecoration({ selectedDecoration: key })}
                  className={`flex flex-col items-center gap-2 md:gap-4 p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-2 md:border-4 transition-all shadow-md ${selectedDecoration === key ? 'border-primary bg-primary/5 scale-105 shadow-primary/20' : 'border-black bg-white text-black'}`}
                >
                  <span className={`material-icons-round text-2xl md:text-5xl ${selectedDecoration === key ? 'text-primary' : 'text-black'}`}>{styles[key].icon}</span>
                  <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest text-center text-black leading-tight">{styles[key].label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. COLORES */}
          <section>
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 md:border-l-8 border-black pl-3 md:pl-5">
               2. Paleta de Colores
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-12 gap-3 md:gap-6 mb-6">
              {config.colors.map((color) => {
                const isSelected = cakeColors.includes(color.hex);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(color.hex)}
                    className={`aspect-square rounded-full border-2 md:border-4 shadow-lg transition-all transform active:scale-90 relative flex items-center justify-center ${isSelected ? 'border-primary scale-110 ring-4 md:ring-8 ring-primary/20' : 'border-black'}`}
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
            <h3 className="text-[13px] md:text-[16px] font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-5 md:mb-8 flex items-center gap-3 border-l-4 md:border-l-8 border-black pl-3 md:pl-5">
               3. Toppers y Extras
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8 mb-6">
              {toppers.map(t => (
                <button 
                  key={t.id}
                  onClick={() => onUpdateDecoration({ topperType: t.id })}
                  className={`flex items-center gap-3 md:gap-8 p-3 md:p-8 rounded-[1.5rem] md:rounded-[3.5rem] border-2 md:border-4 transition-all ${topperType === t.id ? 'border-primary bg-primary/5 shadow-md' : 'border-black bg-white shadow-sm'}`}
                >
                  <span className={`material-icons-round text-xl md:text-4xl ${topperType === t.id ? 'text-primary' : 'text-black'}`}>{t.icon}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] md:text-[15px] font-black uppercase tracking-tighter md:tracking-widest text-black">{t.label}</span>
                    <span className="text-[8px] md:text-[11px] font-bold text-slate-500 uppercase">+${config.topperPrices[t.id] || 0}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* TOGGLE ESFERAS */}
            <div className="bg-white p-4 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-md border-2 md:border-4 border-black flex items-center justify-between group">
               <div className="flex items-center gap-4 md:gap-10">
                  <div className={`w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-[2rem] flex items-center justify-center transition-all shadow-md border-2 ${hasSpheres ? 'bg-primary text-white border-black scale-110' : 'bg-slate-100 text-black border-slate-300'}`}>
                     <span className="material-icons-round text-2xl md:text-5xl">lens</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-xl font-black text-black uppercase tracking-tight md:tracking-widest leading-none mb-1 md:mb-2">Esferas Decorativas</span>
                    <span className="text-[9px] md:text-sm font-black text-primary uppercase bg-primary/10 px-2 md:px-4 py-0.5 md:py-1 rounded-full border border-primary/20 w-fit">+$8.00</span>
                  </div>
               </div>
               <button 
                  onClick={() => onUpdateDecoration({ hasSpheres: !hasSpheres })}
                  className={`w-14 h-8 md:w-24 md:h-12 rounded-full relative flex items-center px-1 md:px-2 transition-all shadow-inner border-2 md:border-4 border-black ${hasSpheres ? 'bg-primary' : 'bg-gray-400'}`}
               >
                  <div className={`w-5 h-5 md:w-8 md:h-8 rounded-full bg-white shadow-xl transform transition-transform duration-500 ${hasSpheres ? 'translate-x-6 md:translate-x-10' : 'translate-x-0'}`}></div>
               </button>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER ADAPTADO A MÓVIL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 md:p-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t-4 border-black rounded-t-[2.5rem] md:rounded-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 md:gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-[14px] font-black text-slate-600 uppercase tracking-widest">Total</span>
            <div className="text-2xl md:text-6xl font-display text-black tracking-tighter">${totalPrice.toFixed(2)}</div>
          </div>
          <button 
            onClick={onNext}
            className="flex-1 bg-primary text-white font-black py-4 md:py-7 px-6 md:px-14 rounded-full shadow-lg transition-all text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] flex items-center justify-center gap-2 md:gap-8 border-2 md:border-4 border-black/10 active:scale-95"
          >
            Siguiente
            <span className="material-icons-round text-lg md:text-3xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DecorationStep;
