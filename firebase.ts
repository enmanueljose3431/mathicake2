
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer, collection, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "./firebase-applet-config.json";

// Inicializar Firebase
let db: any = null;
let auth: any = null;
let inspirationCol: any = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function safeJsonStringify(obj: any) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for quota exceeded
  if (errorMessage.includes('resource-exhausted') || errorMessage.includes('Quota exceeded')) {
    console.error('❌ Firestore Quota Exceeded: The daily free tier write limit (20,000 writes) has been reached. It will reset in 24 hours.');
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: String(provider.providerId || ''),
        displayName: String(provider.displayName || ''),
        email: String(provider.email || ''),
        photoUrl: String(provider.photoURL || '')
      })) || []
    },
    operationType,
    path
  }
  
  const safeInfo = safeJsonStringify(errInfo);
  console.error('Firestore Error:', errInfo);
  throw new Error(safeInfo);
}

try {
  const app = initializeApp(firebaseConfig);
  
  // Intentar con la base de datos específica, si falla o no está, usar la por defecto
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log(`🔥 Intentando conectar a base de datos: ${firebaseConfig.firestoreDatabaseId}`);
  } else {
    db = getFirestore(app);
    console.log("🔥 Conectando a base de datos por defecto");
  }
  
  auth = getAuth(app);
  console.log("🔥 Firebase inicializado");

  // Habilitar persistencia offline
  if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence failed: Multiple tabs open");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence failed: Browser not supported");
      }
    });
  }

  // Colecciones
  inspirationCol = collection(db, "inspiration");

  // Test de conexión
  const testConnection = async () => {
    try {
      // Intentar obtener el documento con un timeout corto para el test
      await getDocFromServer(doc(db, 'settings', 'appConfig'));
      console.log("✅ Conexión a Firestore verificada");
    } catch (error: any) {
      console.warn("⚠️ Aviso de conexión inicial:", error.message);
      
      // Si falla con la base de datos específica, intentar con la por defecto como fallback
      if (firebaseConfig.firestoreDatabaseId && (error.message.includes('offline') || error.message.includes('not-found'))) {
        console.log("🔄 Reintentando con base de datos por defecto...");
        try {
          const defaultDb = getFirestore(app);
          await getDocFromServer(doc(defaultDb, 'settings', 'appConfig'));
          db = defaultDb;
          console.log("✅ Conexión exitosa usando base de datos por defecto");
        } catch (fallbackError: any) {
          console.error("❌ Falló también la base de datos por defecto:", fallbackError.message);
        }
      }
    }
  };
  testConnection();
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

export { db, auth, inspirationCol };
