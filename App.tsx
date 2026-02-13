
import React, { useState, useCallback, useEffect } from 'react';
import { Step, AppState, AppConfig, Order } from './types';
import { CAKE_SIZES, FLAVORS, FILLINGS, DECORATIONS, TOPPER_PRICES, SPHERES_PRICE, CAKE_COLORS, SATURATED_COLOR_SURCHARGE } from './constants';
import SizeStep from './components/SizeStep';
import FlavorStep from './components/FlavorStep';
import DecorationStep from './components/DecorationStep';
import PersonalizationStep from './components/PersonalizationStep';
import SummaryStep from './components/SummaryStep';
import PaymentStep from './components/PaymentStep';
import SuccessStep from './components/SuccessStep';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

// Firebase imports
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';

const DEFAULT_CONFIG: AppConfig = {
  sizes: CAKE_SIZES,
  flavors: FLAVORS,
  fillings: FILLINGS,
  colors: CAKE_COLORS,
  decorations: DECORATIONS,
  topperPrices: TOPPER_PRICES,
  spheresPrice: SPHERES_PRICE,
  saturatedColorSurcharge: SATURATED_COLOR_SURCHARGE,
  coverageSurcharges: { chantilly: 0, chocolate: 5, arequipe: 4 },
  paymentDetails: {
    bankName: "Pastelitos Bank",
    accountHolder: "Cakes Studio S.A.",
    zelleEmail: "pagos@cakesstudio.com",
    taxId: "J-12345678-9",
    exchangeRateNote: "Trabajamos con Tasa Euro (€)"
  },
  appTheme: {
    brandName: "Cake Customizer Studio",
    whatsappNumber: "584241546473",
    primaryColor: "#E31C58",
    secondaryColor: "#FFEB3B",
    backgroundColor: "#FFFBF2",
    textColor: "#000000",
    surfaceColor: "#FFFFFF"
  }
};

const App: React.FC = () => {
  // --- CONFIGURATION STATE ---
  const [config, setConfig] = useState<AppConfig>(() => {
    // Initial load from LocalStorage for speed
    const saved = localStorage.getItem('cake_app_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge defaults to prevent breaking changes
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });

  // --- ORDERS STATE ---
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cake_app_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // --- FIREBASE SYNC EFFECT ---
  useEffect(() => {
    if (!db) return; // Skip if firebase not configured

    // 1. Sync Configuration
    const unsubscribeConfig = onSnapshot(doc(db, "settings", "appConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const remoteConfig = docSnap.data() as AppConfig;
        // Merge with defaults to ensure all fields exist
        setConfig(prev => ({ ...prev, ...remoteConfig }));
        localStorage.setItem('cake_app_config', JSON.stringify({ ...DEFAULT_CONFIG, ...remoteConfig }));
      } else {
        // Create initial config if it doesn't exist
        setDoc(doc(db, "settings", "appConfig"), config);
      }
    });

    // 2. Sync Orders
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const remoteOrders: Order[] = [];
      snapshot.forEach((doc) => {
        remoteOrders.push({ ...doc.data(), id: doc.id } as Order); // Use Firestore ID or internal ID
      });
      // Sort by date desc (assuming date string format allows basic sort, usually better to use timestamp)
      remoteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setOrders(remoteOrders);
      localStorage.setItem('cake_app_orders', JSON.stringify(remoteOrders));
    });

    return () => {
      unsubscribeConfig();
      unsubscribeOrders();
    };
  }, []);

  // --- THEME CSS VARIABLE UPDATE ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.appTheme.primaryColor);
    root.style.setProperty('--secondary-color', config.appTheme.secondaryColor);
    root.style.setProperty('--bg-color', config.appTheme.backgroundColor);
    root.style.setProperty('--text-color', config.appTheme.textColor);
    root.style.setProperty('--surface-color', config.appTheme.surfaceColor);
  }, [config.appTheme]);

  // --- APP FLOW STATE ---
  const [state, setState] = useState<AppState>({
    step: 'SIZE',
    selectedSize: config.sizes[1],
    selectedFlavor: config.flavors[0],
    selectedFilling: config.fillings[1],
    selectedDecoration: 'liso',
    cakeColors: ['#FFFFFF'],
    topperType: 'none',
    hasSpheres: false,
    theme: '',
    birthdayName: '',
    birthdayAge: '',
    specialRequirements: '',
    referenceImage: null,
    paymentProof: null,
    paymentReference: '',
    amountBs: '',
    deliveryMethod: 'PICKUP',
    deliveryDate: '',
    deliveryTime: '',
    coverageType: 'chantilly',
    totalPrice: 45,
    customFilling: '',
    paymentStrategy: 'FIFTY_PERCENT',
  });

  // Calculate Price Logic
  const calculateTotal = useCallback((partial: Partial<AppState>) => {
    const size = partial.selectedSize || state.selectedSize;
    const flavor = partial.selectedFlavor || state.selectedFlavor;
    const filling = partial.selectedFilling || state.selectedFilling;
    const decorId = partial.selectedDecoration || state.selectedDecoration;
    const coverage = partial.coverageType || state.coverageType;
    const topper = partial.topperType || state.topperType;
    const spheres = partial.hasSpheres !== undefined ? partial.hasSpheres : state.hasSpheres;
    const currentColors = partial.cakeColors || state.cakeColors;
    
    const factor = size?.costMultiplier || 1.0;

    const base = size?.basePrice || 0;
    const fMod = (flavor?.priceModifier || 0) * factor;
    const fillMod = (filling?.priceModifier || 0) * factor;
    const decorMod = (config.decorations[decorId]?.priceModifier || 0) * factor;
    const coverageMod = (config.coverageSurcharges[coverage] || 0) * factor;
    
    const topperMod = config.topperPrices[topper] || 0;
    const spheresMod = spheres ? (config.spheresPrice * factor) : 0;
    
    let colorSurcharge = 0;
    const hasSaturated = currentColors.some(hex => 
        config.colors.find(c => c.hex === hex)?.isSaturated
    );
    if (hasSaturated) colorSurcharge = config.saturatedColorSurcharge * factor;
    
    return base + fMod + fillMod + decorMod + coverageMod + topperMod + spheresMod + colorSurcharge;
  }, [state, config]);

  useEffect(() => {
    setState(prev => ({ ...prev, totalPrice: calculateTotal({}) }));
  }, [config, calculateTotal]);

  const nextStep = () => {
    setState(prev => {
      const steps: Step[] = ['SIZE', 'FLAVOR', 'DECORATION', 'PERSONALIZATION', 'SUMMARY', 'PAYMENT'];
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex < steps.length - 1) return { ...prev, step: steps[currentIndex + 1] };
      return prev;
    });
  };

  const prevStep = () => {
    setState(prev => {
      const steps: Step[] = ['SIZE', 'FLAVOR', 'DECORATION', 'PERSONALIZATION', 'SUMMARY', 'PAYMENT'];
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex > 0) return { ...prev, step: steps[currentIndex - 1] };
      return prev;
    });
  };

  // --- ACTIONS ---

  const handleUpdateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig); // Optimistic update
    localStorage.setItem('cake_app_config', JSON.stringify(newConfig)); // Backup
    
    if (db) {
      try {
        await setDoc(doc(db, "settings", "appConfig"), newConfig);
      } catch (e) {
        console.error("Error saving config to Firebase", e);
        alert("Error guardando en la nube. Se guardó localmente.");
      }
    }
  };

  const handleClearOrders = async () => {
     if(confirm("¿Estás seguro de borrar el historial? Esto no se puede deshacer.")) {
        setOrders([]);
        localStorage.setItem('cake_app_orders', JSON.stringify([]));
        // Note: Deleting collection in Firestore from client is not recommended/easy without cloud functions.
        // For this demo, we just clear local state or implement a loop if needed, but usually we just archive them.
        alert("En modo Firebase, los pedidos no se borran masivamente por seguridad. Contacta al soporte.");
     }
  };

  const handleFinalizeOrder = async () => {
    const deposit = state.totalPrice / 2;
    const colorNames = state.cakeColors.map(hex => 
        config.colors.find(c => c.hex === hex)?.name || 'Especial'
    ).join(', ');

    const paymentInfo = state.paymentStrategy === 'FIFTY_PERCENT' 
      ? `💳 Pago: Anticipo 50% (Ref ${state.paymentReference} - Bs. ${state.amountBs})`
      : `💵 Pago: 100% Contra Entrega`;

    const detailedInfo = `🎂 PASTEL ${state.selectedSize?.diameter}cm (${state.selectedSize?.heightType})
🍰 Bizcocho: ${state.selectedFlavor?.name}
🍦 Relleno: ${state.selectedFilling?.id === 'others' ? state.customFilling : state.selectedFilling?.name}
✨ Estilo: ${config.decorations[state.selectedDecoration].label}
🎨 Colores: ${colorNames}
🎯 Cobertura: ${state.coverageType.toUpperCase()}
🚀 Extras: ${state.topperType !== 'none' ? 'Topper '+state.topperType : 'Sin Topper'}${state.hasSpheres ? ', con Esferas' : ''}
🎉 Evento: ${state.theme} p/ ${state.birthdayName} (${state.birthdayAge} años)
📍 Entrega: ${state.deliveryMethod} - ${state.deliveryDate} ${state.deliveryTime}
${paymentInfo}`;

    const simpleId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: simpleId, // Temporary ID
      date: new Date().toLocaleString(),
      customerName: state.birthdayName || 'Cliente Web',
      details: detailedInfo,
      total: state.totalPrice,
      status: 'PENDING'
    };

    // Save to State/Local
    setOrders(prev => [newOrder, ...prev]);
    localStorage.setItem('cake_app_orders', JSON.stringify([newOrder, ...orders]));

    // Save to Firebase
    if (db) {
      try {
        await addDoc(collection(db, "orders"), newOrder);
      } catch (e) {
        console.error("Error saving order to cloud", e);
      }
    }

    // WhatsApp Redirect
    const paymentSummary = state.paymentStrategy === 'FIFTY_PERCENT'
      ? `💰 *RESUMEN DE PAGO*
- Total: $${state.totalPrice.toFixed(2)}
- Anticipo (50%): $${deposit.toFixed(2)}
- Pendiente: $${deposit.toFixed(2)}`
      : `💰 *RESUMEN DE PAGO*
- Total a pagar al recibir: $${state.totalPrice.toFixed(2)}`;

    const message = `🎂 *¡NUEVO PEDIDO DE PASTEL!* 🎂 (Ref: ${newOrder.id})

${detailedInfo}

${paymentSummary}`;

    const whatsappNumber = config.appTheme.whatsappNumber;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    setState(prev => ({
      ...prev,
      step: 'SUCCESS',
      lastOrderId: newOrder.id,
    }));
  };

  const resetToStart = () => setState(prev => ({ ...prev, step: 'SIZE' }));
  const goToAdminLogin = () => setState(prev => ({ ...prev, step: 'ADMIN_LOGIN' }));
  const exitAdmin = () => setState(prev => ({ ...prev, step: 'SIZE' }));

  const showBrandHeader = !['ADMIN_PANEL'].includes(state.step);

  return (
    <div className="w-full h-full flex flex-col font-quicksand overflow-hidden bg-background-light">
        {/* GLOBAL PERSISTENT BRAND HEADER */}
        {showBrandHeader && (
          <div className="w-full bg-primary h-16 md:h-20 flex items-center justify-center relative shrink-0 z-[60] shadow-md px-4">
            <div className="max-w-7xl w-full flex items-center justify-center">
               {config.appTheme.logoUrl ? (
                <img src={config.appTheme.logoUrl} className="h-10 md:h-14 object-contain" alt="Logo" />
              ) : (
                <h2 className="font-display text-xl md:text-2xl text-white tracking-widest uppercase italic">
                  MATH <span className="text-secondary">CAKE</span>
                </h2>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-hidden mx-auto w-full h-full max-w-7xl">
            {state.step === 'SIZE' && (
              <SizeStep 
                selectedSize={state.selectedSize} 
                onSelectSize={(s) => setState(prev => ({ ...prev, selectedSize: s, totalPrice: calculateTotal({ selectedSize: s }) }))} 
                onNext={nextStep} 
                onAdminClick={goToAdminLogin}
                config={config}
              />
            )}
            {state.step === 'FLAVOR' && (
              <FlavorStep 
                {...state} 
                onSelectFlavor={(f) => setState(prev => ({ ...prev, selectedFlavor: f, totalPrice: calculateTotal({ selectedFlavor: f }) }))} 
                onSelectFilling={(fill) => setState(prev => ({ ...prev, selectedFilling: fill, totalPrice: calculateTotal({ selectedFilling: fill }) }))} 
                onNext={nextStep} 
                onBack={prevStep} 
                onCustomFillingChange={(v) => setState(s => ({...s, customFilling: v}))} 
                config={config}
              />
            )}
            {state.step === 'DECORATION' && (
              <DecorationStep 
                {...state} 
                onUpdateDecoration={(d) => setState(prev => ({ ...prev, ...d, totalPrice: calculateTotal(d) }))} 
                onNext={nextStep} 
                onBack={prevStep} 
                config={config}
              />
            )}
            {state.step === 'PERSONALIZATION' && (
              <PersonalizationStep 
                appState={state} 
                onUpdate={(d) => setState(prev => ({ ...prev, ...d, totalPrice: calculateTotal(d) }))} 
                onNext={nextStep} 
                onBack={prevStep} 
              />
            )}
            {state.step === 'SUMMARY' && (
              <SummaryStep 
                appState={state} 
                onUpdate={(d) => setState(prev => ({ ...prev, ...d }))} 
                onBack={prevStep} 
                onConfirm={nextStep} 
                config={config} 
              />
            )}
            {state.step === 'PAYMENT' && (
              <PaymentStep 
                {...state} 
                config={config} 
                onUpdatePayment={(d) => setState(s => ({...s, ...d}))} 
                onBack={prevStep} 
                onComplete={handleFinalizeOrder} 
              />
            )}
            
            {state.step === 'SUCCESS' && <SuccessStep orderId={state.lastOrderId || ''} onReset={resetToStart} config={config} />}
            
            {state.step === 'ADMIN_LOGIN' && (
              <AdminLogin 
                onLoginSuccess={() => setState(prev => ({ ...prev, step: 'ADMIN_PANEL' }))} 
                onCancel={exitAdmin} 
              />
            )}
          </div>
          
          {state.step === 'ADMIN_PANEL' && (
            <div className="fixed inset-0 z-[100]">
              <AdminPanel 
                config={config} 
                onUpdateConfig={handleUpdateConfig} 
                orders={orders}
                onClearOrders={handleClearOrders}
                onExit={exitAdmin} 
              />
            </div>
          )}
        </div>
    </div>
  );
};

export default App;
