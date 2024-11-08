import firestore from '@react-native-firebase/firestore';
import { Hospital, BedUpdate } from '../../types/hospital.types';
import { notificationService } from '../notification/notificationService';

class HospitalService {
  getHospitalStats(id: any) {
      throw new Error('Method not implemented.');
  }
  assignAmbulance(ambulanceId: string, requestId: string) {
      throw new Error('Method not implemented.');
  }
  private static instance: HospitalService;
  private readonly hospitalCollection = 'hospitals';
  private readonly bedUpdatesCollection = 'bedUpdates';

  private constructor() {}

  static getInstance(): HospitalService {
    if (!HospitalService.instance) {
      HospitalService.instance = new HospitalService();
    }
    return HospitalService.instance;
  }

  async registerHospital(hospitalData: Omit<Hospital, 'id'>): Promise<string> {
    try {
      const hospital = await firestore()
        .collection(this.hospitalCollection)
        .add({
          ...hospitalData,
          verificationStatus: 'PENDING',
          createdAt: Date.now(),
        });
      
      await this.notifyAdminOfNewHospital(hospital.id);
      return hospital.id;
    } catch (error) {
      console.error('Failed to register hospital:', error);
      throw error;
    }
  }

  async updateBedAvailability(update: BedUpdate): Promise<void> {
    try {
      const hospitalRef = firestore()
        .collection(this.hospitalCollection)
        .doc(update.hospitalId);

      await firestore().runTransaction(async (transaction) => {
        const hospital = await transaction.get(hospitalRef);
        const data = hospital.data() as Hospital;

        // Update bed counts based on action and type
        const capacity = { ...data.capacity };
        if (update.bedType === 'regular') {
          capacity.availableBeds += update.action === 'release' ? 1 : -1;
        } else if (update.bedType === 'icu') {
          capacity.icuBeds.available += update.action === 'release' ? 1 : -1;
        } else {
          capacity.emergencyBeds.available += update.action === 'release' ? 1 : -1;
        }

        // Update emergency status based on availability
        const emergencyStatus = this.calculateEmergencyStatus(capacity);

        transaction.update(hospitalRef, {
          capacity,
          emergencyStatus,
          lastUpdated: Date.now(),
        });

        // Log the update
        await this.logBedUpdate(update);
      });
    } catch (error) {
      console.error('Failed to update bed availability:', error);
      throw error;
    }
  }

  private calculateEmergencyStatus(capacity: Hospital['capacity']): Hospital['emergencyStatus'] {
    const emergencyOccupancy = (capacity.emergencyBeds.total - capacity.emergencyBeds.available) / capacity.emergencyBeds.total;
    const icuOccupancy = (capacity.icuBeds.total - capacity.icuBeds.available) / capacity.icuBeds.total;
    
    if (emergencyOccupancy >= 0.95) return 'FULL';
    if (emergencyOccupancy >= 0.85 || icuOccupancy >= 0.9) return 'CRITICAL';
    return 'OPEN';
  }

  async getHospitalsByDistance(
    location: { latitude: number; longitude: number },
    maxDistance: number = 50 // km
  ): Promise<Hospital[]> {
    try {
      const hospitals = await firestore()
        .collection(this.hospitalCollection)
        .where('verificationStatus', '==', 'VERIFIED')
        .get();

      return hospitals.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Hospital))
        .filter(hospital => 
          this.calculateDistance(location, hospital.location) <= maxDistance
        )
        .sort((a, b) => 
          this.calculateDistance(location, a.location) - 
          this.calculateDistance(location, b.location)
        );
    } catch (error) {
      console.error('Failed to get nearby hospitals:', error);
      throw error;
    }
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async setupEmergencyRoomStatusListener(
    hospitalId: string,
    callback: (status: Hospital['emergencyStatus']) => void
  ): Promise<() => void> {
    const unsubscribe = firestore()
      .collection(this.hospitalCollection)
      .doc(hospitalId)
      .onSnapshot(snapshot => {
        const data = snapshot.data() as Hospital;
        callback(data.emergencyStatus);
      });

    return unsubscribe;
  }
}

export const hospitalService = HospitalService.getInstance();
