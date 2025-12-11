
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebaseInstances } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const instances = useMemo(() => {
    try {
      return getFirebaseInstances();
    } catch (e) {
      // This can happen on the server if env vars are missing.
      // We'll return null and let the provider handle it.
      return null;
    }
  }, []);

  if (!instances) {
    // This could render a loading state or an error message if you want
    // but for now, we just won't render the provider, children will be un-rendered
    // until client-side hydration provides the config.
    return <>{children}</>;
  }

  const { firebaseApp, auth, firestore } = instances;

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
