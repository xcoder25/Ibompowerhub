'use client';

import { useEffect } from 'react';
import { offlineLocationCache } from '@/lib/offline-location-cache';

export function AppInitializer() {
  useEffect(() => {
    // Initialize offline location cache
    offlineLocationCache.init();
  }, []);

  return null;
}