
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
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

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
    bankName: "Banco de Venezuela",
    accountHolder: "Tu Nombre Aquí",
    zelleEmail: "tu@correo.com",
    taxId: "V-00000000",
    exchangeRateNote: "Tasa BCV del día"
  },
  appTheme: {
    brandName: "MathiCake Studio",
    whatsappNumber: "584240000000",
    primaryColor: "#E31C58",
    secondaryColor: "#FFEB3B",
    backgroundColor: "#FFFBF2",
    textColor: "#000000",
    surfaceColor: "#FFFFFF"
  }
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // --- MANEJADORES DE NAVEGACIÓN (Para evitar errores TS1382) ---
  const navigateTo = (step: Step) => {
    setState(prev => ({ ...prev, step }));
  };

  const updateAppState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetApp = () => {
    setState(prev => ({ ...prev, step: 'SIZE' }));
  };

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!db) return;

    const configDocRef = doc(db, "settings", "appConfig");

    const initConfig = async () => {
      try {
        const docSnap = await getDoc(configDocRef);
        if (docSnap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as AppConfig);
        } else {
          await setDoc(configDocRef, DEFAULT_CONFIG);
        }
        setFirebaseError(null);
      } catch (e: any) {
        if (e.code === 'permission-denied') {
          setFirebaseError("Firestore BLOQUEADO: Revisa las reglas de seguridad.");
        }
        console.error("Error Firebase Init:", e);
      }
    };

    initConfig();

    const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(prev => ({ ...prev, ...docSnap.data() }));
        setFirebaseError(null);
      }
    }, (err) => {
      if (err.code === 'permission-denied') {
        setFirebaseError("PERMISOS DENEGADOS: Cambia 'if false' por 'if true' en la consola de Firebase.");
      }
    });

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const remoteOrders: Order[] = [];
      snapshot.forEach((doc) => {
        remoteOrders.push({ ...doc.data(), id: doc.id } as Order);
      });
      remoteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(remoteOrders);
      setFirebaseError(null);
    }, (err) => {
      if (err.code === 'permission-denied') {
        setFirebaseError("Firestore BLOQUEADO: No se pueden cargar pedidos.");
      }
    });

    return () => {
      unsubscribeConfig();
      unsubscribeOrders();
    };
  }, []);

  // --- THEME ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.appTheme.primaryColor);
    root.style.setProperty('--secondary-color', config.appTheme.secondaryColor);
    root.style.setProperty('--bg-color', config.appTheme.backgroundColor);
    root.style.setProperty('--text-color', config.appTheme.textColor);
    root.style.setProperty('--surface-color', config.appTheme.surfaceColor);
  }, [config.appTheme]);

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

  const calculateTotal = useCallback(() => {
    const size = config.sizes.find(s => s.id === state.selectedSize?.id) || config.sizes[0];
    const flavor = config.flavors.find(f => f.id === state.selectedFlavor?.id) || config.flavors[0];
    const filling = config.fillings.find(f => f.id === state.selectedFilling?.id) || config.fillings[0];
    const decor = config.decorations[state.selectedDecoration] || { priceModifier: 0 };
    const factor = size.costMultiplier || 1.0;

    let total = size.basePrice + 
                (flavor.priceModifier * factor) + 
                (filling.priceModifier * factor) + 
                (decor.priceModifier * factor) + 
                (config.coverageSurcharges[state.coverageType] * factor) + 
                (config.topperPrices[state.topperType] || 0);

    if (state.hasSpheres) total += (config.spheresPrice * factor);
    
    const hasSaturated = state.cakeColors.some(hex => config.colors.find(c => c.hex === hex)?.isSaturated);
    if (hasSaturated) total += (config.saturatedColorSurcharge * factor);
    
    return total;
  }, [state, config]);

  useEffect(() => {
    setState(prev => ({ ...prev, totalPrice: calculateTotal() }));
  }, [state.selectedSize, state.selectedFlavor, state.selectedFilling, state.selectedDecoration, state.coverageType, state.topperType, state.hasSpheres, state.cakeColors, config, calculateTotal]);

  const handleUpdateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    if (db) {
      try {
        await setDoc(doc(db, "settings", "appConfig"), newConfig);
      } catch (e: any) {
        if (e.code === 'permission-denied') {
          alert("ERROR DE PERMISOS: No se guardó en Firebase. Cambia las reglas a 'if true'.");
        } else {
          alert("Error al guardar: " + e.message);
        }
      }
    }
  };

  const handleFinalizeOrder = async () => {
    const simpleId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    try {
      const decorLabel = config.decorations[state.selectedDecoration]?.label || 'Liso';
      const colorNames = state.cakeColors.map(hex => config.colors.find(c => c.hex === hex)?.name || 'Personalizado').join(', ');
      
      const detailedInfo = `🎂 PASTEL ${state.selectedSize?.diameter}cm
🍰 Bizcocho: ${state.selectedFlavor?.name}
🍦 Relleno: ${state.selectedFilling?.id === 'others' ? state.customFilling : state.selectedFilling?.name}
✨ Estilo: ${decorLabel}
🎨 Colores: ${colorNames}
🎯 Cobertura: ${state.coverageType.toUpperCase()}
🚀 Extras: ${state.topperType !== 'none' ? 'Topper ' + state.topperType : 'Sin Topper'}${state.hasSpheres ? ', con Esferas' : ''}
🎉 Temática: ${state.theme}
📍 Entrega: ${state.deliveryMethod} - ${state.deliveryDate}`;

      const newOrder: Order = {
        id: simpleId,
        date: new Date().toLocaleString(),
        customerName: state.birthdayName || 'Cliente Web',
        details: detailedInfo,
        total: state.totalPrice,
        status: 'PENDING'
      };

      if (db) {
        try {
          await setDoc(doc(db, "orders", simpleId), newOrder);
        } catch (fbErr: any) {
          console.warn("No se pudo guardar en DB, abriendo WhatsApp.", fbErr);
        }
      }

      const message = `🎂 *NUEVO PEDIDO* (Ref: ${simpleId})\n\n${detailedInfo}\n\n💰 Total: $${state.totalPrice.toFixed(2)}`;
      window.open(`https://wa.me/${config.appTheme.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      setState(prev => ({ ...prev, step: 'SUCCESS', lastOrderId: simpleId }));

    } catch (error: any) {
      console.error("Error crítico:", error);
      alert("Error al procesar el pedido.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-quicksand overflow-hidden bg-background-light">
        {firebaseError && (
          <div className="bg-red-600 text-white text-[10px] md:text-xs py-2 px-4 text-center font-black uppercase tracking-widest z-[200] flex flex-col items-center justify-center gap-1 shadow-2xl border-b-2 border-red-800">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-sm animate-pulse">error_outline</span>
              {firebaseError}
            </div>
            <p className="opacity-70 text-[8px] md:text-[9px] font-bold">⚠️ Entra en Firebase Console y cambia las reglas Rules a 'if true'</p>
          </div>
        )}

        {!['ADMIN_PANEL'].includes(state.step) && (
          <div className="w-full bg-primary h-16 md:h-20 flex items-center justify-center relative shrink-0 z-[60] shadow-md px-4">
             {config.appTheme.logoUrl ? (
                <img src={config.appTheme.logoUrl} className="h-10 md:h-14 object-contain" alt="Logo" />
              ) : (
                <h2 className="font-display text-xl md:text-2xl text-white tracking-widest uppercase italic">{config.appTheme.brandName}</h2>
              )}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col relative">
            {state.step === 'SIZE' && <SizeStep selectedSize={state.selectedSize} onSelectSize={(s) => updateAppState({selectedSize: s})} onNext={() => navigateTo('FLAVOR')} onAdminClick={() => navigateTo('ADMIN_LOGIN')} config={config} />}
            {state.step === 'FLAVOR' && <FlavorStep {...state} onSelectFlavor={(f) => updateAppState({selectedFlavor: f})} onSelectFilling={(fill) => updateAppState({selectedFilling: fill})} onNext={() => navigateTo('DECORATION')} onBack={() => navigateTo('SIZE')} onCustomFillingChange={(v) => updateAppState({customFilling: v})} config={config} />}
            {state.step === 'DECORATION' && <DecorationStep {...state} onUpdateDecoration={(d) => updateAppState(d)} onNext={() => navigateTo('PERSONALIZATION')} onBack={() => navigateTo('FLAVOR')} config={config} />}
            {state.step === 'PERSONALIZATION' && <PersonalizationStep appState={state} onUpdate={(d) => updateAppState(d)} onNext={() => navigateTo('SUMMARY')} onBack={() => navigateTo('DECORATION')} />}
            {state.step === 'SUMMARY' && <SummaryStep appState={state} onUpdate={(d) => updateAppState(d)} onBack={() => navigateTo('PERSONALIZATION')} onConfirm={() => navigateTo('PAYMENT')} config={config} />}
            {state.step === 'PAYMENT' && <PaymentStep {...state} config={config} onUpdatePayment={(d) => updateAppState(d)} onBack={() => navigateTo('SUMMARY')} onComplete={handleFinalizeOrder} />}
            {state.step === 'SUCCESS' && <SuccessStep orderId={state.lastOrderId || ''} onReset={resetApp} config={config} />}
            {state.step === 'ADMIN_LOGIN' && <AdminLogin onLoginSuccess={() => navigateTo('ADMIN_PANEL')} onCancel={resetApp} />}
            {state.step === 'ADMIN_PANEL' && (
              <div className="fixed inset-0 z-[100]">
                <AdminPanel 
                  config={config} 
                  onUpdateConfig={handleUpdateConfig} 
                  orders={orders} 
                  onClearOrders={() => {}} 
                  onExit={resetApp} 
                />
              </div>
            )}
        </div>
    </div>
  );
};

export default App;
