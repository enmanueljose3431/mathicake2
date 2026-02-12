
import React from 'react';
import { AppState, AppConfig, PaymentStrategy } from '../types';

interface SummaryStepProps {
  appState: AppState;
  onUpdate: (data: Partial<AppState>) => void;
  onBack: () => void;
  onConfirm: () => void;
  config: AppConfig;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ appState, onUpdate, onBack, onConfirm, config }) => {
  const deposit = appState.totalPrice / 2;
  const isCustomFilling = appState.selectedFilling?.id === 'others';
  
  const topperLabel = {
    none: 'Sin Topper',
    generic: 'Topper Genérico',
    personalized: 'Topper Personalizado',
    plus_pieces: 'Topper + Piezas'
  }[appState.topperType];

  const colorNames = appState.cakeColors.map(hex => 
    config.colors.find(c => c.hex === hex)?.name || 'Personalizado'
  ).join(', ');

  const handleStrategySelect = (strategy: PaymentStrategy) => {
    onUpdate({ paymentStrategy: strategy });
  };

  return (
    <div className="flex flex-col h-full bg-background-light animate-fadeIn overflow-hidden">
      <header className="pt-6 pb-4 px-6 text-center relative shrink-0">
        <button onClick={onBack} className="absolute left-6 top-6 text-primary hover:text-rose-600 transition-colors bg-white rounded-full p-2 shadow-sm border border-gray-100">
          <span className="material-icons-round text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-display uppercase tracking-widest mb-1 text-black">Tu Pedido</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Resumen de tu obra maestra</p>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-10">
        {isCustomFilling && (
           <div className="bg-amber-100 border-2 border-amber-300 p-4 rounded-3xl flex items-center gap-3 animate-pulse">
              <span className="material-icons-round text-amber-600">warning_amber</span>
              <p className="text-[10px] font-black text-amber-900 uppercase leading-tight">
                El precio de rellenos personalizados se confirmará vía WhatsApp.
              </p>
           </div>
        )}

        {/* DETALLES DEL PRODUCTO */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-soft border border-gray-100 divide-y divide-gray-50 space-y-1">
          <div className="py-4 flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Básico</span>
            <span className="text-sm font-bold text-gray-800">{appState.selectedSize?.diameter}cm - {appState.selectedSize?.heightType === 'TALL' ? 'Alto (17cm)' : 'Bajo (10cm)'}</span>
            <span className="text-[11px] text-primary font-black uppercase">Bizcocho {appState.selectedFlavor?.name} / Relleno {isCustomFilling ? appState.customFilling : appState.selectedFilling?.name}</span>
          </div>

          <div className="py-4 flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Decoración</span>
            <span className="text-sm font-bold text-gray-800">Acabado: {appState.selectedDecoration.toUpperCase()}</span>
            <span className="text-[10px] text-primary font-black uppercase">Colores: {colorNames}</span>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="bg-secondary/20 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm">{topperLabel}</span>
              {appState.hasSpheres && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm">Esferas Decorativas</span>}
            </div>
          </div>

          <div className="py-4 flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Evento</span>
            <span className="text-sm font-bold text-gray-800">Temática: {appState.theme}</span>
            <span className="text-xs font-medium text-gray-500">{appState.birthdayName} ({appState.birthdayAge} años)</span>
          </div>

          <div className="py-4 flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Entrega</span>
            <span className="text-sm font-bold text-gray-800">{appState.deliveryMethod === 'DELIVERY' ? 'Domicilio' : 'Retiro en Tienda'}</span>
            <span className="text-xs font-bold text-primary">{appState.deliveryDate} @ {appState.deliveryTime}</span>
          </div>
        </div>

        {/* SELECTOR DE PAGO */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Selecciona método de pago:</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleStrategySelect('FIFTY_PERCENT')}
              className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${appState.paymentStrategy === 'FIFTY_PERCENT' ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-white text-slate-500 border-slate-100 shadow-sm'}`}
            >
              <span className="material-icons-round">percent</span>
              <span className="text-[10px] font-black uppercase tracking-tight">Pagar 50% Ahora</span>
            </button>
            <button 
              onClick={() => handleStrategySelect('FULL_ON_DELIVERY')}
              className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${appState.paymentStrategy === 'FULL_ON_DELIVERY' ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-white text-slate-500 border-slate-100 shadow-sm'}`}
            >
              <span className="material-icons-round">payments</span>
              <span className="text-[10px] font-black uppercase tracking-tight">Todo al Recibir</span>
            </button>
          </div>
        </section>

        {/* RESUMEN MONETARIO */}
        <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Total del Pedido:</span>
              <span className="text-2xl font-display text-gray-800">${appState.totalPrice.toFixed(2)}</span>
           </div>
           {appState.paymentStrategy === 'FIFTY_PERCENT' && (
             <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                <span className="text-xs font-bold text-primary uppercase">Anticipo (Reserva):</span>
                <span className="text-2xl font-display text-primary">${deposit.toFixed(2)}</span>
             </div>
           )}
           {appState.paymentStrategy === 'FULL_ON_DELIVERY' && (
             <div className="pt-2 border-t border-primary/10">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Pagará el total el día de la entrega</span>
             </div>
           )}
        </div>
      </main>

      {/* FOOTER - Estilo unificado y compacto */}
      <footer className="bg-surface-light p-5 md:p-8 z-50 shadow-[0_-15px_35px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Resumen Final</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                <span className="text-2xl md:text-4xl font-display text-black">{appState.totalPrice.toFixed(2)}$</span>
                <span className="text-[9px] md:text-[11px] font-black text-primary uppercase bg-primary/5 px-3 md:px-4 py-0.5 rounded-lg border border-primary/10">
                  {appState.paymentStrategy === 'FIFTY_PERCENT' ? 'A reserva' : 'Contra entrega'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={onBack}
              className="flex-1 md:px-8 bg-gray-100 text-gray-500 font-black py-4 md:py-5 rounded-[1.5rem] md:rounded-[1.8rem] hover:bg-gray-200 transition-all text-[10px] uppercase tracking-widest border-2 border-transparent"
            >
              Editar
            </button>
            <button 
              onClick={onConfirm}
              className="flex-[2] md:px-12 bg-primary text-white font-black py-4 md:py-5 rounded-[1.5rem] md:rounded-[1.8rem] shadow-xl-primary flex items-center justify-center gap-2 hover:bg-rose-600 active:scale-95 transition-all text-[10px] uppercase tracking-widest border-2 border-white/10"
            >
              Confirmar
              <span className="material-icons-round text-base">check_circle</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SummaryStep;
