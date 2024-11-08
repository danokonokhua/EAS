import { Driver, DriverStatus, DriverLocation } from '../../types/driver.types';
import { locationService } from '../location/locationService';
import { firestore } from '../firebase/firebase';
import { BehaviorSubject } from 'rxjs';

class DriverService {
  private static instance: DriverService;
  private currentDriver: BehaviorSubject<Driver | null> = new BehaviorSubject<Driver | null>(null);
  private locationUpdateInterval: NodeJS.Timer | null = null;

  private constructor() {}

  static getInstance(): DriverService {
    if (!DriverService.instance) {
      DriverService.instance = new DriverService();
    }
    return DriverService.instance;
  }

  async initializeDriver(driverId: string): Promise<void> {
    try {
      const driverDoc = await firestore.collection('drivers').doc(driverId).get();
      if (driverDoc.exists) {
        this.currentDriver.next(driverDoc.data() as Driver);
        this.startLocationUpdates();
      }
    } catch (error) {
      console.error('Failed to initialize driver:', error);
      throw error;
    }
  }

  private startLocationUpdates(): void {
    if (this.locationUpdateInterval) return;

    this.locationUpdateInterval = setInterval(async () => {
      const location = await locationService.getCurrentLocation();
      if (location && this.currentDriver.value) {
        this.updateDriverLocation({
          driverId: this.currentDriver.value.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading || 0,
          timestamp: Date.now()
        });
      }
    }, 10000); // Update every 10 seconds
  }

  async updateDriverLocation(location: DriverLocation): Promise<void> {
    try {
      await firestore
        .collection('driver_locations')
        .doc(location.driverId)
        .set(location, { merge: true });

      // Update driver's current location in main document
      await firestore
        .collection('drivers')
        .doc(location.driverId)
        .update({
          currentLocation: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });
    } catch (error) {
      console.error('Failed to update driver location:', error);
      throw error;
    }
  }

  async updateDriverStatus(status: DriverStatus): Promise<void> {
    const driver = this.currentDriver.value;
    if (!driver) throw new Error('No driver initialized');

    try {
      await firestore
        .collection('drivers')
        .doc(driver.id)
        .update({ status });
      
      this.currentDriver.next({ ...driver, status });
    } catch (error) {
      console.error('Failed to update driver status:', error);
      throw error;
    }
  }

  async acceptEmergencyRequest(emergencyId: string): Promise<void> {
    const driver = this.currentDriver.value;
    if (!driver) throw new Error('No driver initialized');

    try {
      await firestore.runTransaction(async (transaction) => {
        const emergencyRef = firestore.collection('emergencies').doc(emergencyId);
        const emergency = await transaction.get(emergencyRef);

        if (!emergency.exists) {
          throw new Error('Emergency request not found');
        }

        if (emergency.data()?.status !== 'PENDING') {
          throw new Error('Emergency request already accepted');
        }

        transaction.update(emergencyRef, {
          driverId: driver.id,
          status: 'ACCEPTED',
          acceptedAt: Date.now()
        });

        transaction.update(firestore.collection('drivers').doc(driver.id), {
          status: DriverStatus.ON_ROUTE
        });
      });
    } catch (error) {
      console.error('Failed to accept emergency request:', error);
      throw error;
    }
  }

  stopLocationUpdates(): void {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  getCurrentDriver(): Driver | null {
    return this.currentDriver.value;
  }

  onDriverUpdate(callback: (driver: Driver | null) => void): () => void {
    const subscription = this.currentDriver.subscribe(callback);
    return () => subscription.unsubscribe();
  }
}

export const driverService = DriverService.getInstance();
