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

// Pages where the loader should NEVER show (splash screen handles them)
const LOADER_EXCLUDED_PATHS = ['/', '/auth/login', '/auth/signup'];

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExcluded = LOADER_EXCLUDED_PATHS.includes(pathname);

  const clearAllTimers = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (resolveRef.current) clearTimeout(resolveRef.current);
  };

  const showLoader = (duration: number = 2500) => {
    if (isExcluded) return;
    clearAllTimers();
    setIsLoading(true);
    resolveRef.current = setTimeout(() => setIsLoading(false), duration);
  };

  // Show loader on route change — but NEVER on excluded pages,
  // and only after a 200ms debounce so it never flashes right after the splash.
  useEffect(() => {
    clearAllTimers();

    if (isExcluded) {
      setIsLoading(false);
      return;
    }

    // 200ms debounce — prevents loader from appearing for instant navigations
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);

      // Resolve when document signals it is ready, with a 500ms grace period on top.
      // Max cap: 4 seconds so it never hangs forever on slow pages.
      const tryResolve = () => {
        if (document.readyState === 'complete') {
          resolveRef.current = setTimeout(() => setIsLoading(false), 500);
        } else {
          resolveRef.current = setTimeout(() => setIsLoading(false), 4000);
        }
      };

      if (document.readyState === 'complete') {
        tryResolve();
      } else {
        window.addEventListener('load', tryResolve, { once: true });
        // Safety net: never hang longer than 4s
        resolveRef.current = setTimeout(() => setIsLoading(false), 4000);
      }
    }, 200);

    return () => {
      clearAllTimers();
      window.removeEventListener('load', () => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Global click listener for buttons and links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (isExcluded) return; // Never trigger on landing / auth pages

      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('button, a, [role="button"]');

      if (interactiveElement) {
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
        // Links that navigate within current page (#hash) should not trigger loader
        const isHashLink = interactiveElement.tagName === 'A' &&
                           (interactiveElement as HTMLAnchorElement).hash !== '' &&
                           (interactiveElement as HTMLAnchorElement).pathname === window.location.pathname;

        if (!isSwitch && !isDialogClose && !isAccordionTrigger && !isThemeToggle && !isTabTrigger && !isHashLink) {
          clearAllTimers();
          // Small debounce so rapid clicks don't stack
          debounceRef.current = setTimeout(() => {
            setIsLoading(true);
            // Auto-dismiss after 2.5s as a fallback
            resolveRef.current = setTimeout(() => setIsLoading(false), 2500);
          }, 80);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
