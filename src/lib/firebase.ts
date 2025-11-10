import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAhTlm5Flffm0gtSyVW0DJ9cNOuib8ww_g",
  authDomain: "cryptoflashr.firebaseapp.com",
  projectId: "cryptoflashr",
  storageBucket: "cryptoflashr.firebasestorage.app",
  messagingSenderId: "952508110777",
  appId: "1:952508110777:web:764c39b3e8264a885a4868",
  measurementId: "G-T14MV6HFMX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
