import { locationService } from '../location/locationService';
import { APP_CONFIG } from '../../config/appConfig';

interface TrackingUpdate {
  ambulanceId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  heading: number;
  speed: number;
  timestamp: number;
}

class AmbulanceTrackingService {
  private static instance: AmbulanceTrackingService;
  private trackingListeners: Map<string, Set<(update: TrackingUpdate) => void>> = new Map();
  private mockUpdateInterval: NodeJS.Timer | null = null;

  private constructor() {}

  static getInstance(): AmbulanceTrackingService {
    if (!AmbulanceTrackingService.instance) {
      AmbulanceTrackingService.instance = new AmbulanceTrackingService();
    }
    return AmbulanceTrackingService.instance;
  }

  startTracking(ambulanceId: string, listener: (update: TrackingUpdate) => void): void {
    if (!this.trackingListeners.has(ambulanceId)) {
      this.trackingListeners.set(ambulanceId, new Set());
    }
    this.trackingListeners.get(ambulanceId)?.add(listener);

    // Start mock updates if not already started
    if (!this.mockUpdateInterval) {
      this.startMockUpdates();
    }
  }

  stopTracking(ambulanceId: string, listener: (update: TrackingUpdate) => void): void {
    this.trackingListeners.get(ambulanceId)?.delete(listener);
    if (this.trackingListeners.get(ambulanceId)?.size === 0) {
      this.trackingListeners.delete(ambulanceId);
    }

    // Stop mock updates if no listeners remain
    if (this.trackingListeners.size === 0 && this.mockUpdateInterval) {
      clearInterval(this.mockUpdateInterval);
      this.mockUpdateInterval = null;
    }
  }

  private startMockUpdates(): void {
    this.mockUpdateInterval = setInterval(() => {
      this.trackingListeners.forEach((listeners, ambulanceId) => {
        const update = this.generateMockUpdate(ambulanceId);
        listeners.forEach(listener => listener(update));
      });
    }, 3000); // Update every 3 seconds
  }

  private generateMockUpdate(ambulanceId: string): TrackingUpdate {
    return {
      ambulanceId,
      location: {
        latitude: APP_CONFIG.DEFAULT_LOCATION.latitude + (Math.random() - 0.5) * 0.01,
        longitude: APP_CONFIG.DEFAULT_LOCATION.longitude + (Math.random() - 0.5) * 0.01,
      },
      heading: Math.random() * 360,
      speed: Math.random() * 60, // km/h
      timestamp: Date.now(),
    };
  }
}

export const ambulanceTrackingService = AmbulanceTrackingService.getInstance();
