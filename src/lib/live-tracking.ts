import { doc, setDoc, updateDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

export type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  driverId: string;
  orderId: string;
};

export class LiveTrackingService {
  private firestore: any;

  constructor(firestore: any) {
    this.firestore = firestore;
  }

  // Start sharing location for an order
  async startSharingLocation(orderId: string, driverId: string, location: Omit<LiveLocation, 'driverId' | 'orderId'>): Promise<void> {
    const trackingDoc = doc(this.firestore, 'live_tracking', orderId);
    const data: LiveLocation = {
      ...location,
      driverId,
      orderId,
    };

    await setDoc(trackingDoc, {
      ...data,
      isActive: true,
      startedAt: new Date(),
    });
  }

  // Update location
  async updateLocation(orderId: string, location: Omit<LiveLocation, 'driverId' | 'orderId'>): Promise<void> {
    const trackingDoc = doc(this.firestore, 'live_tracking', orderId);
    await updateDoc(trackingDoc, {
      ...location,
      lastUpdated: new Date(),
    });
  }

  // Stop sharing location
  async stopSharingLocation(orderId: string): Promise<void> {
    const trackingDoc = doc(this.firestore, 'live_tracking', orderId);
    await updateDoc(trackingDoc, {
      isActive: false,
      stoppedAt: new Date(),
    });
  }

  // Delete tracking data
  async deleteTrackingData(orderId: string): Promise<void> {
    const trackingDoc = doc(this.firestore, 'live_tracking', orderId);
    await deleteDoc(trackingDoc);
  }

  // Subscribe to location updates
  subscribeToLocation(orderId: string, callback: (location: LiveLocation | null) => void): () => void {
    const trackingDoc = doc(this.firestore, 'live_tracking', orderId);

    const unsubscribe = onSnapshot(trackingDoc, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.isActive) {
          callback(data as LiveLocation);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  // Get all active tracking sessions (for admin/debugging)
  subscribeToAllActiveTracking(callback: (tracking: Record<string, LiveLocation>) => void): () => void {
    const trackingCollection = collection(this.firestore, 'live_tracking');

    const unsubscribe = onSnapshot(trackingCollection, (snapshot) => {
      const activeTracking: Record<string, LiveLocation> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          activeTracking[doc.id] = data as LiveLocation;
        }
      });

      callback(activeTracking);
    });

    return unsubscribe;
  }
}

let _instance: LiveTrackingService | null = null;

export const getLiveTrackingService = (firestore: any): LiveTrackingService => {
  if (!_instance) {
    _instance = new LiveTrackingService(firestore);
  }
  return _instance;
};