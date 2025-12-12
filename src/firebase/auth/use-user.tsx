'use client';

import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/provider';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserLoading] = useState(true);

  // Safely get auth only on the client
  const [auth, setAuth] = useState<any>(null);
  useEffect(() => {
    // This effect runs only on the client, after hydration
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const authInstance = useAuth();
    setAuth(authInstance);
  }, []);

  useEffect(() => {
    // If auth is not yet available (e.g., on the server or during initial client render), do nothing.
    if (!auth) {
      setUserLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]); // This now safely depends on the client-side auth instance

  return { user, isUserLoading };
}