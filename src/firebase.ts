import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//
// TODO: ¡IMPORTANTE! Reemplace esto con la configuración de su proyecto de Firebase.
//
// Puede encontrar esta configuración en la Consola de Firebase en:
// Configuración del proyecto > General > Sus aplicaciones > Configuración de SDK > Configuración
//
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la instancia de Firestore para usar en otras partes de la aplicación
export const db = getFirestore(app);