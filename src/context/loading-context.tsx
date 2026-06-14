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

  const showLoader = (duration: number = 3000) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, duration);
  };

  // Trigger loader on page switch (pathname changes)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [pathname]);

  // Global click listener for buttons and links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('button, a, [role="button"]');

      if (interactiveElement) {
        // Exclude specific elements to avoid annoying UX (like close/cancel buttons, switches, accordion headers, tab triggers)
        const isSwitch = interactiveElement.getAttribute('role') === 'switch' || 
                          interactiveElement.classList.contains('switch') ||
                          interactiveElement.closest('.switch');
        const isDialogClose = interactiveElement.getAttribute('aria-label') === 'Close' || 
                               interactiveElement.classList.contains('dialog-close') ||
                               interactiveElement.closest('[data-dialog-close]') ||
                               target.closest('button[class*="DialogClose"]') ||
                               target.closest('button[class*="close"]');
        const isAccordionTrigger = interactiveElement.getAttribute('data-state') !== null && 
                                    (interactiveElement.classList.contains('accordion-trigger') || 
                                     interactiveElement.closest('.accordion-trigger'));
        const isThemeToggle = interactiveElement.id === 'dark-mode' || 
                              interactiveElement.closest('#dark-mode');
        const isTabTrigger = interactiveElement.getAttribute('role') === 'tab';

        if (!isSwitch && !isDialogClose && !isAccordionTrigger && !isThemeToggle && !isTabTrigger) {
          setIsLoading(true);
          const timer = setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
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
