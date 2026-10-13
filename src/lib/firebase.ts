import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCG0TKTctGlA3mvcoraLvdzP227JUnZXfo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'arenaevo-prod.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'arenaevo-prod',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'arenaevo-prod.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1093507669265',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1093507669265:web:bb4ab51552e0cedda2c0b0',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

