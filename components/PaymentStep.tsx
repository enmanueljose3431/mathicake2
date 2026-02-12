
import React from 'react';
import { AppConfig, PaymentStrategy } from '../types';

interface PaymentStepProps {
  totalPrice: number;
  paymentReference: string;
  amountBs: string;
  config: AppConfig;
  paymentStrategy: PaymentStrategy;
  onUpdatePayment: (data: { paymentReference?: string; amountBs?: string }) => void;
  onBack: () => void;
  onComplete: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  totalPrice, 
  paymentReference, 
  amountBs, 
  config,
  paymentStrategy,
  onUpdatePayment, 
  onBack, 
  onComplete 
}) => {
  const depositAmount = totalPrice / 2;
  const isComplete = paymentStrategy === 'FULL_ON_DELIVERY' || (paymentReference.length >= 6 && amountBs.length > 0);

  return (
    <div className="flex flex-col h-full bg-background-light animate-fadeIn overflow-hidden">
      <header className="pt-6 pb-4 px-6 flex items-center justify-between z-10 relative shrink-0">
        <button onClick={onBack} className="p-2 rounded-full bg-white shadow-soft text-primary transition-transform active:scale-95 border border-gray-100">
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h1 className="text-xl font-display text-primary tracking-tight uppercase">
          {paymentStrategy === 'FIFTY_PERCENT' ? 'Confirmar Reserva' : 'Finalizar Pedido'}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 space-y-6 pt-2 overflow-y-auto no-scrollbar pb-10">
        <section className="text-center py-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-3 text-primary">
            <span className="material-icons-round text-3xl">
              {paymentStrategy === 'FIFTY_PERCENT' ? 'currency_exchange' : 'fact_check'}
            </span>
          </div>
          <h2 className="text-lg font-display text-gray-800">
            {paymentStrategy === 'FIFTY_PERCENT' ? 'Casi listos' : '¡Excelente elección!'}
          </h2>
          <div className="mt-1 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full inline-block">
             <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                {config.paymentDetails.exchangeRateNote}
             </p>
          </div>
          <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mt-3">
            {paymentStrategy === 'FIFTY_PERCENT' 
              ? <>Realiza el pago del <span className="text-primary">50% del total</span></>
              : <>Confirmación de <span className="text-primary">pago total el día de la entrega</span></>
            }
          </p>
        </section>

        {/* DATOS BANCARIOS - SOLO SI PAGA 50% */}
        {paymentStrategy === 'FIFTY_PERCENT' && (
          <>
            <section className="bg-white p-6 rounded-[2.5rem] shadow-soft border border-rose-50 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                 <span className="material-icons-round text-primary/10 text-5xl rotate-12">account_balance</span>
              </div>
              
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Anticipo Requerido ($)</span>
              <span className="text-4xl font-display text-primary mb-6">${depositAmount.toFixed(2)}</span>
              
              <div className="w-full space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Banco y Titular</span>
                    <span className="text-xs font-bold text-gray-800">{config.paymentDetails.bankName} - {config.paymentDetails.accountHolder}</span>
                 </div>
                 <div className="flex flex-col gap-0.5 border-t border-gray-200/50 pt-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Zelle / Correo</span>
                    <span className="text-xs font-bold text-primary select-all">{config.paymentDetails.zelleEmail}</span>
                 </div>
                 <div className="flex flex-col gap-0.5 border-t border-gray-200/50 pt-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">RIF / ID</span>
                    <span className="text-xs font-bold text-gray-800">{config.paymentDetails.taxId}</span>
                 </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-[2.5rem] shadow-soft border border-rose-50 space-y-4">
               <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.15em] mb-2 text-center">Datos de la transferencia</h3>
               
               <div className="space-y-3">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Últimos 6 dígitos de Referencia</label>
                   <input 
                     type="text" 
                     maxLength={6}
                     placeholder="Ej: 123456"
                     className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 shadow-inner"
                     value={paymentReference}
                     onChange={(e) => onUpdatePayment({ paymentReference: e.target.value.replace(/\D/g, '') })}
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Monto en Bs. Transferido</label>
                   <input 
                     type="text" 
                     placeholder="Monto total en Bs."
                     className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 shadow-inner"
                     value={amountBs}
                     onChange={(e) => onUpdatePayment({ amountBs: e.target.value })}
                   />
                 </div>
               </div>

               <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3 mt-4">
                  <span className="material-icons-round text-amber-500 text-lg">info</span>
                  <p className="text-[10px] text-amber-700 font-medium leading-tight">
                    Recuerda que deberás enviar el capture del comprobante por **WhatsApp** al finalizar.
                  </p>
               </div>
            </section>
          </>
        )}

        {/* MENSAJE DE COMPROMISO - SOLO SI PAGA AL RECIBIR */}
        {paymentStrategy === 'FULL_ON_DELIVERY' && (
          <section className="bg-white p-8 rounded-[3rem] shadow-soft border border-rose-50 space-y-6 text-center">
             <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-icons-round text-primary text-4xl">handshake</span>
             </div>
             <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Compromiso de Pago</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                   Al pulsar el botón inferior, confirmas que realizarás el pago total de <span className="text-primary">${totalPrice.toFixed(2)}</span> el día acordado de la entrega.
                </p>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-[10px] text-slate-400">
                "Nos preparamos con amor para tu evento, agradecemos tu puntualidad y seriedad al recibir."
             </div>
          </section>
        )}
      </main>

      {/* FOOTER - Estilo unificado y compacto */}
      <footer className="bg-surface-light p-5 md:p-8 z-50 shadow-[0_-15px_35px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] border-t border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Total a Pagar</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                <span className="text-2xl md:text-4xl font-display text-black">
                  {paymentStrategy === 'FIFTY_PERCENT' ? `$${depositAmount.toFixed(2)}` : `$${totalPrice.toFixed(2)}`}
                </span>
                <span className="text-[9px] md:text-[11px] font-black text-primary uppercase bg-primary/5 px-3 md:px-4 py-0.5 rounded-lg border border-primary/10">
                  {paymentStrategy === 'FIFTY_PERCENT' ? 'Anticipo 50%' : 'Total'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onComplete}
            disabled={!isComplete}
            className="w-full md:w-auto bg-primary disabled:opacity-40 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:gap-5 group text-[10px] md:text-sm border-2 md:border-4 border-white/10 uppercase tracking-widest"
          >
            {paymentStrategy === 'FIFTY_PERCENT' ? 'FINALIZAR POR WHATSAPP' : 'CONFIRMAR Y ENVIAR'}
            <span className="material-icons-round text-lg md:text-2xl">forum</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PaymentStep;
