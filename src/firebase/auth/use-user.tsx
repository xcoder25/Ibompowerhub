
'use client';

import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/provider';
import type { Auth } from 'firebase/auth';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    if (!auth) {
      // Auth is not available yet, this can happen during SSR
      // or if the provider is not yet mounted.
      // We'll wait for the auth instance to be available.
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading };
}
