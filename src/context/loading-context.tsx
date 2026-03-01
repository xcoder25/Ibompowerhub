'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GlobalLoader } from '@/components/global-loader';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  showLoader: (duration?: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const showLoader = (duration: number = 10000) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, duration);
  };

  // Hide loader when navigating to a new page
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    // We removed the global click listener to prevent the loader from showing on every click.
    // The loader should now be triggered manually where necessary (e.g. login, signup, routing).
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoader }}>
      {isLoading && <GlobalLoader />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
