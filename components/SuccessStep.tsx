
import React from 'react';
import { AppConfig } from '../types';

interface SuccessStepProps {
  orderId: string;
  onReset: () => void;
  config: AppConfig;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ orderId, onReset, config }) => {
  return (
    <div className="flex flex-col h-full bg-background-light items-center justify-center p-8 animate-fadeIn text-center">
      <div className="relative mb-10">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center animate-bounce shadow-inner border-4 border-white">
          <span className="material-icons-round text-6xl text-green-500">check_circle</span>
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-pop">
           <span className="material-icons-round text-xl">celebration</span>
        </div>
      </div>

      <h1 className="text-3xl font-display text-slate-900 uppercase tracking-tight mb-4">¡Pedido Registrado!</h1>
      
      <div className="bg-white p-6 rounded-[2.5rem] shadow-soft border border-gray-100 w-full max-w-sm mb-10">
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Referencia del Pedido</p>
         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-display text-2xl text-primary tracking-widest">
            {orderId}
         </div>
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-4 leading-relaxed">
            Hemos enviado tu pedido a WhatsApp y lo hemos guardado en nuestro historial de ventas.
         </p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
         <button 
            onClick={onReset}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            Hacer Otro Pedido
         </button>
         
         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
            {config.appTheme.brandName}
         </p>
      </div>
      
      {/* Decorative cakes patterns in background */}
      <div className="absolute bottom-10 left-10 opacity-10 rotate-12 scale-150 pointer-events-none">
         <span className="material-icons-round text-primary text-9xl">cake</span>
      </div>
      <div className="absolute top-20 right-10 opacity-10 -rotate-12 scale-150 pointer-events-none">
         <span className="material-icons-round text-primary text-9xl">bakery_dining</span>
      </div>
    </div>
  );
};

export default SuccessStep;
