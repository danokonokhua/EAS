import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { store } from '../../store';
import { updateLocation } from '../../store/slices/locationSlice';

interface GeolocationCoordinates {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number | null;
  readonly accuracy: number;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly speed: number | null;
}

interface GeolocationPosition {
  readonly coords: GeolocationCoordinates;
  readonly timestamp: number;
}

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private isTracking: boolean = false;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Emergency Ambulance Location Permission',
          message: 'We need access to your location for emergency services',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const geolocationPosition: GeolocationPosition = {
          coords: {
            ...position.coords,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
          },
          timestamp: position.timestamp
        };

        store.dispatch(updateLocation({
          latitude: geolocationPosition.coords.latitude,
          longitude: geolocationPosition.coords.longitude,
          accuracy: geolocationPosition.coords.accuracy,
          timestamp: geolocationPosition.timestamp,
          speed: geolocationPosition.coords.speed,
          heading: geolocationPosition.coords.heading,
        }));
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 3000,
        showLocationDialog: true,
      }
    );

    this.isTracking = true;
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  async getCurrentLocation(): Promise<GeolocationPosition> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const geolocationPosition: GeolocationPosition = {
            coords: {
              ...position.coords,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
            },
            timestamp: position.timestamp
          };

          resolve(geolocationPosition);
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  isLocationTrackingEnabled(): boolean {
    return this.isTracking;
  }
}

export const locationService = LocationService.getInstance();

