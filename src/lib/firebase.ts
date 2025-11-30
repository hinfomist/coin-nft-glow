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

// Log which config source is being used
console.log('🔥 [Firebase] Initializing with config from:', 
  import.meta.env.VITE_FIREBASE_API_KEY ? 'Environment Variables' : 'Fallback Values'
);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore (critical services)
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('🔥 [Firebase] Auth initialized:', auth ? '✅' : '❌');
console.log('🔥 [Firebase] Firestore initialized:', db ? '✅' : '❌');

// Initialize Analytics (optional - won't break app if blocked)
let analytics;
try {
  analytics = getAnalytics(app);
  console.log('🔥 [Firebase] Analytics initialized: ✅');
} catch (error) {
  console.warn('⚠️ [Firebase] Analytics blocked by ad blocker or privacy extension. App will continue without analytics.');
  console.warn('⚠️ [Firebase] Error details:', error);
  analytics = undefined;
}

export { analytics };