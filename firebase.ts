
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración real de tu proyecto MathiCake
const firebaseConfig = {
  apiKey: "AIzaSyBfs7qFJFAsK5Jrz8MKXV_e4JL_Cz98Qb4",
  authDomain: "mathicake-aae97.firebaseapp.com",
  projectId: "mathicake-aae97",
  storageBucket: "mathicake-aae97.firebasestorage.app",
  messagingSenderId: "141693083714",
  appId: "1:141693083714:web:268fa556b911be3b6e0ddb",
  measurementId: "G-NZMWR9WPSG"
};

// Inicializar Firebase
let db: any = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 Firebase conectado exitosamente a MathiCake");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

export { db };
