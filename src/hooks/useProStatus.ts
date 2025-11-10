import { useState, useEffect } from 'react';
import { collection, query, where, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Determines Pro strictly by backend approval:
// 1) users/{email}.isPro === true OR
// 2) An order exists in orders where email == user.email AND status == 'approved'.
// Default is non-Pro until verified.
export const useProStatus = () => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setIsPro(false);
      setExpiresAt(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    let isProFromUser = false;
    let expiresFromUser: Date | null = null;
    let isProFromOrder = false;
    let expiresFromOrder: Date | null = null;

    const updateUserStatus = () => {
      if (isProFromUser) {
        setIsPro(true);
        setExpiresAt(expiresFromUser);
      } else if (isProFromOrder) {
        setIsPro(true);
        setExpiresAt(expiresFromOrder);
      } else {
        setIsPro(false);
        setExpiresAt(null);
      }
      setLoading(false);
    };

    // Listener for the user document
    const userRef = doc(db, 'users', user.email);
    const unsubscribeUser = onSnapshot(
      userRef,
      (snap) => {
        isProFromUser = false;
        expiresFromUser = null;
        if (snap.exists()) {
          const data = snap.data();
          const exp = data?.proExpiresAt?.toDate ? data.proExpiresAt.toDate() : data?.proExpiresAt ? new Date(data.proExpiresAt) : null;
          if (data?.isPro === true && exp && exp.getTime() > Date.now()) {
            isProFromUser = true;
            expiresFromUser = exp;
          }
        }
        updateUserStatus();
      },
      (err) => {
        console.error('Error listening to user document:', err);
        setLoading(false);
      }
    );

    // Listener for the orders collection
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('email', '==', user.email), where('status', '==', 'approved'));

    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        isProFromOrder = false;
        expiresFromOrder = null;
        const now = Date.now();

        snapshot.forEach((d) => {
          const data = d.data();
          const exp = data?.expiresAt?.toDate ? data.expiresAt.toDate() : data?.expiresAt ? new Date(data.expiresAt) : null;
          if (exp && exp.getTime() > now) {
            isProFromOrder = true;
            if (!expiresFromOrder || exp > expiresFromOrder) {
              expiresFromOrder = exp;
            }
          }
        });
        updateUserStatus();
      },
      (err) => {
        console.error('Error listening to orders collection:', err);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribeUser();
      unsubscribeOrders();
    };
  }, [user?.email]);

  useEffect(() => {
    if (expiresAt) {
      const days = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      setRemainingDays(days > 0 ? days : 0);
    } else {
      setRemainingDays(null);
    }
  }, [expiresAt]);

  return { isPro, loading, expiresAt, remainingDays };
};
