import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  id: string;
  name?: string;
  email: string;
  isPro: boolean;
  proExpiresAt?: any;
  planLimit?: number;
  usageCount?: number;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isPro: boolean;
  loading: boolean;
  planLimit: number;
  usageCount: number;
  daysRemaining: number;
  canUseFeature: () => boolean;
  incrementUsage: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User is logged in, fetch their Pro status from Firestore
        fetchUserData(firebaseUser.email!);
      } else {
        // User is logged out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data from Firestore and listen for real-time updates
  const fetchUserData = (email: string) => {
    const userRef = doc(db, 'users', email);
    
    // Real-time listener for user document
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          id: docSnap.id,
          email: email,
          name: userData.name,
          isPro: userData.isPro || false,
          proExpiresAt: userData.proExpiresAt,
          planLimit: userData.planLimit || 30,
          usageCount: userData.usageCount || 0,
          createdAt: userData.createdAt?.toDate?.() || new Date(),
        });
      } else {
        // User document doesn't exist, create a free user profile
        setUser({
          id: email,
          email: email,
          isPro: false,
          planLimit: 5, // Free plan limit
          usageCount: 0,
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  };

  // Calculate days remaining for Pro subscription
  const getDaysRemaining = (): number => {
    if (!user?.isPro || !user?.proExpiresAt) return 0;
    
    const expiryDate = user.proExpiresAt.toDate ? user.proExpiresAt.toDate() : new Date(user.proExpiresAt);
    const remaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  // Check if user can use Pro features
  const canUseFeature = (): boolean => {
    if (!user) return false;
    
    const daysRemaining = getDaysRemaining();
    
    // Pro user with active subscription
    if (user.isPro && daysRemaining > 0) {
      return (user.usageCount || 0) < (user.planLimit || 30);
    }
    
    // Free user
    return (user.usageCount || 0) < 5; // Free limit
  };

  // Increment usage counter
  const incrementUsage = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.email);
      const currentCount = user.usageCount || 0;
      
      // Update Firestore (will trigger onSnapshot listener)
      await updateDoc(userRef, {
        usageCount: currentCount + 1,
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  // Login with Firebase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', userCredential.user.email);
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error.code, error.message);
      return false;
    }
  };

  // Register with Firebase
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase Auth account created:', userCredential.user.email);
      
      // Create Firestore user document
      const userRef = doc(db, 'users', email);
      await setDoc(userRef, {
        name: name,
        email: email,
        isPro: false,
        planLimit: 5,
        usageCount: 0,
        createdAt: new Date(),
      });
      console.log('✅ Firestore user document created');
      
      return true;
    } catch (error: any) {
      console.error('❌ Registration error:', error.code, error.message);
      
      // Show specific error messages
      if (error.code === 'auth/email-already-in-use') {
        console.error('❌ Email already exists');
      } else if (error.code === 'auth/weak-password') {
        console.error('❌ Password too weak (min 6 characters)');
      } else if (error.code === 'auth/invalid-email') {
        console.error('❌ Invalid email format');
      }
      
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const daysRemaining = getDaysRemaining();
  const isPro = user?.isPro && daysRemaining > 0;

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    isPro: isPro || false,
    loading,
    planLimit: user?.planLimit || 5,
    usageCount: user?.usageCount || 0,
    daysRemaining,
    canUseFeature,
    incrementUsage,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};