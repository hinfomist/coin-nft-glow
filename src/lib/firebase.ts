import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhTlm5Flffm0gtSyVW0DJ9cNOuib8ww_g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cryptoflashr.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cryptoflashr",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cryptoflashr.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "952508110777",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:952508110777:web:764c39b3e8264a885a4868",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T14MV6HFMX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
