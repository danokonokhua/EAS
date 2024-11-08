import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import { locationService } from '../location/locationService';
import { APP_CONFIG } from '../../config/appConfig';

interface TrackingUpdate {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
  emergencyId?: string;
}

class RealTimeTrackingService {
  private static instance: RealTimeTrackingService;
  private trackingInterval: NodeJS.Timer | null = null;
  private firestoreUnsubscribe: (() => void) | null = null;

  private constructor() {}

  static getInstance(): RealTimeTrackingService {
    if (!RealTimeTrackingService.instance) {
      RealTimeTrackingService.instance = new RealTimeTrackingService();
    }
    return RealTimeTrackingService.instance;
  }

  startTracking(userId: string, emergencyId?: string) {
    // Start sending location updates
    this.trackingInterval = setInterval(async () => {
      try {
        const location = await locationService.getCurrentLocation();
        await this.updateLocation({
          userId,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading || 0,
            speed: location.speed || 0,
          },
          timestamp: Date.now(),
          emergencyId,
        });
      } catch (error) {
        console.error('Location update failed:', error);
      }
    }, APP_CONFIG.TRACKING_INTERVAL);
  }

  private async updateLocation(update: TrackingUpdate) {
    try {
      await firestore()
        .collection('locations')
        .doc(update.userId)
        .set(update, { merge: true });
    } catch (error) {
      console.error('Firestore update failed:', error);
    }
  }

  listenToAmbulanceLocation(ambulanceId: string, callback: (location: any) => void) {
    this.firestoreUnsubscribe = firestore()
      .collection('locations')
      .doc(ambulanceId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          callback(snapshot.data());
        }
      });
  }

  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
  }
}

export const realTimeTrackingService = RealTimeTrackingService.getInstance();
