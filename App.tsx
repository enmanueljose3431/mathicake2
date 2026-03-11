
import React, { useState, useCallback, useEffect } from 'react';
import { Step, AppState, AppConfig, Order, CakeSize, Flavor, Filling } from './types';
import { CAKE_SIZES, FLAVORS, FILLINGS, DECORATIONS, TOPPER_PRICES, SPHERES_PRICE, CAKE_COLORS, SATURATED_COLOR_SURCHARGE, INSPIRATION_GALLERY } from './constants';
import SizeStep from './components/SizeStep';
import FlavorStep from './components/FlavorStep';
import DecorationStep from './components/DecorationStep';
import PersonalizationStep from './components/PersonalizationStep';
import SummaryStep from './components/SummaryStep';
import PaymentStep from './components/PaymentStep';
import SuccessStep from './components/SuccessStep';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AuthStep from './components/AuthStep';
import UserDashboard from './components/UserDashboard';

// Firebase imports
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, getDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

const DEFAULT_CONFIG: AppConfig = {
  sizes: CAKE_SIZES,
  flavors: FLAVORS,
  fillings: FILLINGS,
  colors: CAKE_COLORS.map(c => ({ ...c, priceModifier: 0 })),
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
  },
  inspirationGallery: INSPIRATION_GALLERY
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const sheetConfigRef = React.useRef<Partial<AppConfig>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getInitialState = useCallback((): AppState => ({
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
  }), [config.sizes, config.flavors, config.fillings]);

  const [state, setState] = useState<AppState>(() => getInitialState());

  // --- NAVEGACIÓN Y ESTADO ---
  const navigateTo = (step: Step) => setState(prev => ({ ...prev, step }));
  const updateAppState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));
  const resetApp = () => setState(getInitialState());

  const handleSelectSize = (s: CakeSize) => updateAppState({ selectedSize: s });
  const handleGoToFlavor = () => navigateTo('FLAVOR');
  const handleGoToAdminLogin = () => navigateTo('ADMIN_LOGIN');
  const handleGoToAuth = () => navigateTo('AUTH');
  const handleGoToDashboard = () => navigateTo('USER_DASHBOARD');
  const handleAuthSuccess = () => {
    // Si el usuario estaba en el flujo de compra (tenía algo configurado más allá del default)
    // O si venía específicamente de SUMMARY
    if (state.step === 'AUTH' && state.birthdayName) {
      navigateTo('PAYMENT');
    } else {
      navigateTo('USER_DASHBOARD');
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      resetApp();
    } catch (e: any) {
      console.error("Error logging out:", e);
      setFirebaseError("Error al cerrar sesión. Por favor intenta de nuevo.");
    }
  };
  const handleSelectFlavor = (f: Flavor) => updateAppState({ selectedFlavor: f });
  const handleSelectFilling = (fill: Filling) => updateAppState({ selectedFilling: fill });
  const handleGoToDecoration = () => navigateTo('DECORATION');
  const handleGoToSize = () => navigateTo('SIZE');
  const handleCustomFillingChange = (v: string) => updateAppState({ customFilling: v });
  const handleUpdateDecoration = (d: Partial<AppState>) => updateAppState(d);
  const handleGoToPersonalization = () => navigateTo('PERSONALIZATION');
  const handleUpdatePersonalization = (d: Partial<AppState>) => updateAppState(d);
  const handleGoToSummary = () => navigateTo('SUMMARY');
  const handleUpdateSummary = (d: Partial<AppState>) => updateAppState(d);
  const handleGoToPayment = () => {
    if (!user) {
      navigateTo('AUTH');
    } else {
      navigateTo('PAYMENT');
    }
  };
  const handleLoginSuccess = () => navigateTo('ADMIN_PANEL');

  // --- GESTIÓN DE PEDIDOS ---
  const handleDeleteOrder = async (orderId: string) => {
    if (!db) return;
    
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
      console.log("Orden eliminada exitosamente en Firestore");
    } catch (e: any) {
      handleFirestoreError(e, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'PENDING' | 'COMPLETED') => {
    if (!db) return;
    try {
      // 1. Update Firestore
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });

      // 2. Sync with Google Sheets
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error syncing status to Sheets:", errorData.message);
        // We don't throw here to avoid crashing the app for a sync failure, 
        // but we log it.
      } else {
        console.log(`✅ Order ${orderId} status synced to Sheets`);
      }

    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!db) return;
    const configDocRef = doc(db, "settings", "appConfig");
    
    const initConfig = async () => {
      try {
        let finalConfig = { ...DEFAULT_CONFIG };

        // 1. Load from Firestore (Admin Panel overrides - Base)
        const docSnap = await getDoc(configDocRef);
        if (docSnap.exists()) {
          finalConfig = { ...finalConfig, ...docSnap.data() };
          console.log("✅ Base config loaded from Firestore");
        } else {
          // Solo intentar inicializar si parece ser el admin, pero no fallar si no se puede
          if (auth?.currentUser?.email === 'enmanueljose3431@gmail.com') {
            try {
              await setDoc(configDocRef, DEFAULT_CONFIG);
              console.log("✅ Base config initialized in Firestore");
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, "settings/appConfig");
            }
          }
        }

        // 2. Load from Google Sheets (Source of Truth - High Priority)
        try {
          const sheetResponse = await fetch('/api/config');
          if (sheetResponse.ok) {
            const sData = await sheetResponse.json();
            if (Object.keys(sData).length > 0) {
              sheetConfigRef.current = sData;
              finalConfig = { ...finalConfig, ...sData };
              console.log("✅ Source of truth applied from Google Sheets");
            }
          }
        } catch (_e) {
          console.log("Sheets config not available, using Firestore/Defaults");
        }

        setConfig(finalConfig);
      } catch (e: any) {
        handleFirestoreError(e, OperationType.GET, "settings/appConfig");
      }
    };
    initConfig();

    const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // Al recibir cambios de Firestore, volvemos a aplicar los datos de Sheets para que sigan mandando
        const firestoreData = docSnap.data() as AppConfig;
        setConfig(prev => ({ ...prev, ...firestoreData, ...sheetConfigRef.current }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/appConfig");
    });

    return () => { unsubscribeConfig(); };
  }, []);

  // --- ORDERS SYNC (Admin Only) ---
  useEffect(() => {
    if (!db || !user || user.email !== 'enmanueljose3431@gmail.com') {
      setOrders([]);
      return;
    }

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const remoteOrders: Order[] = [];
      snapshot.forEach((doc) => { remoteOrders.push({ ...doc.data(), id: doc.id } as Order); });
      // Ordenar por fecha descendente
      remoteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(remoteOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
    });

    return () => unsubscribeOrders();
  }, [user]);

  // --- AUTH SYNC ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
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

  const calculateTotal = useCallback(() => {
    const size = config.sizes.find(s => s.id === state.selectedSize?.id) || config.sizes[0];
    const flavor = config.flavors.find(f => f.id === state.selectedFlavor?.id) || config.flavors[0];
    const filling = config.fillings.find(f => f.id === state.selectedFilling?.id) || config.fillings[0];
    const decor = config.decorations[state.selectedDecoration] || { priceModifier: 0 };
    const factor = size.costMultiplier || 1.0;
    
    let total = size.basePrice + (flavor.priceModifier * factor) + (filling.priceModifier * factor) + (decor.priceModifier * factor) + (config.coverageSurcharges[state.coverageType] * factor) + (config.topperPrices[state.topperType] || 0);
    
    if (state.hasSpheres) total += (config.spheresPrice * factor);
    
    const colorObjs = state.cakeColors.map(hex => config.colors.find(c => c.hex === hex));
    
    // Recargo por color saturado
    const hasSaturated = colorObjs.some(c => c?.isSaturated);
    if (hasSaturated) total += (config.saturatedColorSurcharge * factor);
    
    // Recargo por color individual
    const colorPriceSum = colorObjs.reduce((sum, c) => sum + (c?.priceModifier || 0), 0);
    total += (colorPriceSum * factor);
    
    return total;
  }, [
    state.selectedSize, 
    state.selectedFlavor, 
    state.selectedFilling, 
    state.selectedDecoration, 
    state.coverageType, 
    state.topperType, 
    state.hasSpheres, 
    state.cakeColors, 
    config
  ]);

  useEffect(() => {
    const newTotal = calculateTotal();
    if (state.totalPrice !== newTotal) {
      setState(prev => ({ ...prev, totalPrice: newTotal }));
    }
  }, [calculateTotal, state.totalPrice]);

  const handleUpdateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      if (db) await setDoc(doc(db, "settings", "appConfig"), newConfig);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "settings/appConfig");
    }
  };

  const handleRefreshFromSheets = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const sData = await res.json();
        if (Object.keys(sData).length > 0) {
          sheetConfigRef.current = sData;
          const merged = { ...config, ...sData };
          setConfig(merged);
          try {
            if (db) await setDoc(doc(db, "settings", "appConfig"), merged);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, "settings/appConfig");
          }
        }
      } else {
        throw new Error("Error en respuesta de API");
      }
    } catch (e) {
      console.error("Error refreshing from sheets:", e);
      throw e;
    }
  };

  const handleFinalizeOrder = async () => {
    const simpleId = Math.random().toString(36).substr(2, 6).toUpperCase();
    try {
      const decorLabel = config.decorations[state.selectedDecoration]?.label || 'Liso';
      const colorNames = state.cakeColors.map(hex => config.colors.find(c => c.hex === hex)?.name || 'Personalizado').join(', ');
      const detailedInfo = `🎂 PASTEL ${state.selectedSize?.diameter}cm\n🍰 Bizcocho: ${state.selectedFlavor?.name}\n🍦 Relleno: ${state.selectedFilling?.id === 'others' ? state.customFilling : state.selectedFilling?.name}\n✨ Estilo: ${decorLabel}\n🎨 Colores: ${colorNames}\n🎯 Cobertura: ${state.coverageType.toUpperCase()}\n🚀 Extras: ${state.topperType !== 'none' ? 'Topper ' + state.topperType : 'Sin Topper'}${state.hasSpheres ? ', con Esferas' : ''}\n🎉 Temática: ${state.theme}\n📍 Entrega: ${state.deliveryMethod} - ${state.deliveryDate}`;
      const newOrder: Order = { 
        id: simpleId, 
        userId: user?.uid || '',
        date: new Date().toISOString(), 
        customerName: state.birthdayName || 'Cliente Web', 
        details: detailedInfo, 
        total: state.totalPrice, 
        status: 'PENDING',
        referenceImage: state.referenceImage || '',
        paymentProof: state.paymentProof || '',
        paymentStrategy: state.paymentStrategy,
        deliveryDate: state.deliveryDate,
        deliveryTime: state.deliveryTime,
        deliveryMethod: state.deliveryMethod,
        selectedSizeId: state.selectedSize?.id || '',
        selectedFlavorId: state.selectedFlavor?.id || '',
        selectedFillingId: state.selectedFilling?.id || '',
        selectedDecorationId: state.selectedDecoration,
        cakeColors: state.cakeColors,
        topperType: state.topperType,
        hasSpheres: state.hasSpheres,
        theme: state.theme,
        birthdayName: state.birthdayName,
        birthdayAge: state.birthdayAge,
        specialRequirements: state.specialRequirements || '',
        coverageType: state.coverageType,
        customFilling: state.customFilling,
        paymentDate: state.paymentProof ? new Date().toISOString() : ''
      };
      try {
        if (db) await setDoc(doc(db, "orders", simpleId), newOrder);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `orders/${simpleId}`);
        return; // Stop if we can't even save the order
      }
      
      // Notificar al administrador (Non-blocking)
      if (db) {
        addDoc(collection(db, "notifications"), {
          orderId: simpleId,
          userId: user?.uid || 'anonymous',
          userName: user?.displayName || state.birthdayName || 'Cliente Web',
          type: 'NEW_ORDER',
          message: `Nuevo pedido recibido #${simpleId}`,
          timestamp: new Date().toISOString(),
          read: false
        }).catch(e => console.warn("Notification failed:", e));
      }
      
      // Sync to Google Sheets (Non-blocking)
      fetch('/api/sync-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(e => console.warn("Google Sheets sync failed:", e));

      const waUrl = `https://wa.me/${config.appTheme.whatsappNumber}?text=${encodeURIComponent(`🎂 *NUEVO PEDIDO* (Ref: ${simpleId})\n\n${detailedInfo}\n\n💰 Total: $${state.totalPrice.toFixed(2)}`)}`;
      
      // Actualizamos el estado para mostrar la pantalla de éxito
      setState(prev => ({ ...prev, step: 'SUCCESS', lastOrderId: simpleId, whatsappUrl: waUrl }));
      
      // Intentamos abrir WhatsApp en una nueva pestaña
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 100);
    } catch (error) { 
      console.error("Error crítico en handleFinalizeOrder:", error); 
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-quicksand overflow-hidden bg-background-light">
        {firebaseError && (
          <div className="bg-red-600 text-white text-[10px] md:text-xs py-2 px-4 text-center font-black uppercase tracking-widest z-[200] flex flex-col items-center justify-center gap-1 shadow-2xl border-b-2 border-red-800">
            <div className="flex items-center gap-2"><span className="material-icons-round text-sm animate-pulse">error_outline</span>{firebaseError}</div>
          </div>
        )}

        {!['ADMIN_PANEL'].includes(state.step) && (
          <div className="w-full bg-primary h-16 md:h-20 flex items-center justify-between relative shrink-0 z-[60] shadow-md px-4 md:px-8">
             <div className="flex-1"></div>
             <div className="flex-1 flex justify-center">
               {config.appTheme.logoUrl ? <img src={config.appTheme.logoUrl} className="h-10 md:h-14 object-contain" alt="Logo" /> : <h2 className="font-display text-xl md:text-2xl text-white tracking-widest uppercase italic">{config.appTheme.brandName}</h2>}
             </div>
             <div className="flex-1 flex justify-end items-center gap-2">
               {user ? (
                 <div className="flex items-center gap-3">
                   <button 
                    onClick={handleGoToDashboard}
                    className="hidden md:flex flex-col items-end"
                   >
                     <span className="text-[10px] text-white/70 font-black uppercase tracking-tighter">Mi Cuenta</span>
                     <span className="text-xs text-white font-bold">{user.displayName || 'Usuario'}</span>
                   </button>
                   <button 
                    onClick={handleGoToDashboard}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
                   >
                     <span className="material-icons-round">person</span>
                   </button>
                   <button 
                    onClick={handleLogout}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all"
                   >
                     <span className="material-icons-round text-sm">logout</span>
                   </button>
                 </div>
               ) : (
                 <button 
                  onClick={handleGoToAuth}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                 >
                   <span className="material-icons-round text-sm">login</span>
                   Ingresar
                 </button>
               )}
             </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col relative">
            {state.step === 'SIZE' && <SizeStep selectedSize={state.selectedSize} onSelectSize={handleSelectSize} onNext={handleGoToFlavor} onAdminClick={handleGoToAdminLogin} config={config} />}
            {state.step === 'FLAVOR' && <FlavorStep {...state} onSelectFlavor={handleSelectFlavor} onSelectFilling={handleSelectFilling} onNext={handleGoToDecoration} onBack={handleGoToSize} onCustomFillingChange={handleCustomFillingChange} config={config} />}
            {state.step === 'DECORATION' && <DecorationStep {...state} onUpdateDecoration={handleUpdateDecoration} onNext={handleGoToPersonalization} onBack={handleGoToFlavor} config={config} />}
            {state.step === 'PERSONALIZATION' && <PersonalizationStep appState={state} onUpdate={handleUpdatePersonalization} onNext={handleGoToSummary} onBack={handleGoToDecoration} />}
            {state.step === 'SUMMARY' && <SummaryStep appState={state} onUpdate={handleUpdateSummary} onBack={handleGoToPersonalization} onConfirm={handleGoToPayment} config={config} user={user} />}
            {state.step === 'PAYMENT' && <PaymentStep {...state} config={config} onUpdatePayment={(d) => updateAppState(d)} onBack={handleGoToSummary} onComplete={handleFinalizeOrder} />}
            {state.step === 'SUCCESS' && <SuccessStep orderId={state.lastOrderId || ''} whatsappUrl={state.whatsappUrl || ''} onReset={resetApp} config={config} />}
            {state.step === 'AUTH' && <AuthStep onSuccess={handleAuthSuccess} onCancel={resetApp} />}
            {state.step === 'USER_DASHBOARD' && <UserDashboard config={config} onExit={resetApp} />}
            {state.step === 'ADMIN_LOGIN' && <AdminLogin onLoginSuccess={handleLoginSuccess} onCancel={resetApp} />}
            {state.step === 'ADMIN_PANEL' && (
              <div className="fixed inset-0 z-[100]">
                <AdminPanel 
                  config={config} 
                  onUpdateConfig={handleUpdateConfig} 
                  onRefreshFromSheets={handleRefreshFromSheets}
                  orders={orders} 
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onExit={resetApp} 
                  user={user}
                />
              </div>
            )}
        </div>
    </div>
  );
};

export default App;