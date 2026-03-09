
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import firebaseConfig from "./firebase-applet-config.json";

// Inicializar Firebase
let db = null as unknown as Firestore;
let auth = null as unknown as Auth;

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

function safeJsonStringify(obj: any) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_, value) => {
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  // Usar el databaseId específico si está disponible en la configuración
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  console.log("🔥 Firebase conectado exitosamente");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

export { db, auth };
