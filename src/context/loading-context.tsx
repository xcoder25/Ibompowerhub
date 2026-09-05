'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Programmatic loader: only shown when explicitly requested by a component
  const showLoader = (duration: number = 2000) => {
    clearTimer();
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, duration);
  };

  // Whenever the route finishes changing, immediately dismiss any active loader
  useEffect(() => {
    clearTimer();
    setIsLoading(false);
  }, [pathname]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimer();
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
