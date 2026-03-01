import { type LiveLocation } from './live-tracking';

type CachedLocation = LiveLocation & {
  cachedAt: number;
  synced: boolean;
};

class OfflineLocationCache {
  private static instance: OfflineLocationCache;
  private cache: Map<string, CachedLocation[]> = new Map();
  private syncInProgress: Set<string> = new Set();

  static getInstance(): OfflineLocationCache {
    if (!OfflineLocationCache.instance) {
      OfflineLocationCache.instance = new OfflineLocationCache();
    }
    return OfflineLocationCache.instance;
  }

  // Cache a location update when offline
  cacheLocation(orderId: string, location: Omit<LiveLocation, 'driverId' | 'orderId'>): void {
    const cachedLocation: CachedLocation = {
      ...location,
      driverId: '', // Will be set when syncing
      orderId,
      cachedAt: Date.now(),
      synced: false,
    };

    if (!this.cache.has(orderId)) {
      this.cache.set(orderId, []);
    }

    this.cache.get(orderId)!.push(cachedLocation);

    // Store in localStorage for persistence
    this.persistCache();
  }

  // Sync cached locations when back online
  async syncCachedLocations(orderId: string, driverId: string, liveTrackingService: any): Promise<void> {
    if (this.syncInProgress.has(orderId)) return;

    const cachedLocations = this.cache.get(orderId);
    if (!cachedLocations || cachedLocations.length === 0) return;

    this.syncInProgress.add(orderId);

    try {
      // Sort by timestamp to sync in order
      const unsyncedLocations = cachedLocations
        .filter(loc => !loc.synced)
        .sort((a, b) => a.timestamp - b.timestamp);

      for (const location of unsyncedLocations) {
        try {
          await liveTrackingService.updateLocation(orderId, {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
          });

          location.synced = true;
        } catch (error) {
          console.error('Failed to sync location:', error);
          // Continue with next location
        }
      }

      // Remove synced locations
      const remainingLocations = cachedLocations.filter(loc => !loc.synced);
      if (remainingLocations.length === 0) {
        this.cache.delete(orderId);
      } else {
        this.cache.set(orderId, remainingLocations);
      }

      this.persistCache();
    } finally {
      this.syncInProgress.delete(orderId);
    }
  }

  // Get cached locations for an order
  getCachedLocations(orderId: string): CachedLocation[] {
    return this.cache.get(orderId) || [];
  }

  // Clear cache for an order
  clearCache(orderId: string): void {
    this.cache.delete(orderId);
    this.persistCache();
  }

  // Check if there are unsynced locations
  hasUnsyncedLocations(orderId: string): boolean {
    const cached = this.cache.get(orderId);
    return cached ? cached.some(loc => !loc.synced) : false;
  }

  // Load cache from localStorage
  private loadCache(): void {
    try {
      const stored = localStorage.getItem('offline_location_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(
          Object.entries(parsed).map(([orderId, locations]: [string, any]) => [
            orderId,
            locations.map((loc: any) => ({
              ...loc,
              timestamp: new Date(loc.timestamp),
              cachedAt: new Date(loc.cachedAt),
            }))
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load location cache:', error);
      this.cache = new Map();
    }
  }

  // Persist cache to localStorage
  private persistCache(): void {
    try {
      const serialized = Object.fromEntries(
        Array.from(this.cache.entries()).map(([orderId, locations]) => [
          orderId,
          locations.map(loc => ({
            ...loc,
            timestamp: loc.timestamp,
            cachedAt: loc.cachedAt,
          }))
        ])
      );
      localStorage.setItem('offline_location_cache', JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist location cache:', error);
    }
  }

  // Initialize cache loading
  init(): void {
    this.loadCache();

    // Set up online/offline listeners
    window.addEventListener('online', () => {
      // Sync all cached locations when back online
      for (const orderId of this.cache.keys()) {
        if (this.hasUnsyncedLocations(orderId)) {
          // Note: We need driverId to sync, this will be handled by the component
          console.log(`Back online, pending sync for order ${orderId}`);
        }
      }
    });
  }
}

export const offlineLocationCache = OfflineLocationCache.getInstance();