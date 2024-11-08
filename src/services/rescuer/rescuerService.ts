import firestore from '@react-native-firebase/firestore';
import { RescuerProfile, RescuerLevel, RescuerCertification, RescuerEquipment } from '../../types/rescuer.types';
import { EmergencyType } from '../../types/emergency.types';
import { locationService } from '../location/locationService';

class RescuerService {
  private static instance: RescuerService;
  private readonly rescuersCollection = 'rescuers';
  private readonly certificationsCollection = 'certifications';
  private readonly equipmentCollection = 'equipment';

  private constructor() {}

  static getInstance(): RescuerService {
    if (!RescuerService.instance) {
      RescuerService.instance = new RescuerService();
    }
    return RescuerService.instance;
  }

  async findAvailableRescuers(
    emergencyType: EmergencyType,
    location: { latitude: number; longitude: number },
    requiredEquipment?: string[]
  ): Promise<RescuerProfile[]> {
    try {
      // First get all available rescuers within the dynamic radius
      const radius = this.calculateDynamicRadius(location);
      const nearbyRescuers = await this.getNearbyRescuers(location, radius);

      // Filter rescuers based on emergency type and level requirements
      const qualifiedRescuers = nearbyRescuers.filter(rescuer => 
        this.isQualifiedForEmergency(rescuer, emergencyType)
      );

      // If specific equipment is required, filter further
      if (requiredEquipment && requiredEquipment.length > 0) {
        return qualifiedRescuers.filter(rescuer =>
          this.hasRequiredEquipment(rescuer, requiredEquipment)
        );
      }

      return qualifiedRescuers;
    } catch (error) {
      console.error('Failed to find available rescuers:', error);
      throw error;
    }
  }

  private calculateDynamicRadius(location: { latitude: number; longitude: number }): number {
    // TODO: Implement dynamic radius calculation based on:
    // 1. Urban vs rural area detection
    // 2. Time of day
    // 3. Historical emergency response data
    // 4. Current available rescuers
    return 5000; // Default 5km radius
  }

  private async getNearbyRescuers(
    location: { latitude: number; longitude: number },
    radius: number
  ): Promise<RescuerProfile[]> {
    // Using geohashing for efficient location queries
    const bounds = locationService.getGeohashBounds(location, radius);
    
    const snapshot = await firestore()
      .collection(this.rescuersCollection)
      .where('isAvailable', '==', true)
      .where('geohash', '>=', bounds.lower)
      .where('geohash', '<=', bounds.upper)
      .get();

    return snapshot.docs.map(doc => doc.data() as RescuerProfile);
  }

  private isQualifiedForEmergency(
    rescuer: RescuerProfile,
    emergencyType: EmergencyType
  ): boolean {
    // Define minimum required level for each emergency type
    const requiredLevel = this.getRequiredLevelForEmergency(emergencyType);
    
    // Check if rescuer meets minimum level requirement
    const levelHierarchy = {
      [RescuerLevel.BASIC]: 1,
      [RescuerLevel.EMT]: 2,
      [RescuerLevel.ADVANCED]: 3
    };

    return levelHierarchy[rescuer.level] >= levelHierarchy[requiredLevel];
  }

  private getRequiredLevelForEmergency(emergencyType: EmergencyType): RescuerLevel {
    // Define minimum required level for each emergency type
    const emergencyLevels: Record<EmergencyType, RescuerLevel> = {
      CARDIAC: RescuerLevel.EMT,
      TRAUMA: RescuerLevel.EMT,
      BREATHING: RescuerLevel.EMT,
      BURN: RescuerLevel.BASIC,
      ALLERGIC: RescuerLevel.BASIC,
      OTHER: RescuerLevel.BASIC
    };

    return emergencyLevels[emergencyType] || RescuerLevel.BASIC;
  }

  private hasRequiredEquipment(
    rescuer: RescuerProfile,
    requiredEquipment: string[]
  ): boolean {
    return requiredEquipment.every(equipment =>
      rescuer.equipment.some(
        e => e.type === equipment && e.status === 'AVAILABLE'
      )
    );
  }

  async updateRescuerStatus(
    rescuerId: string,
    isAvailable: boolean
  ): Promise<void> {
    try {
      await firestore()
        .collection(this.rescuersCollection)
        .doc(rescuerId)
        .update({
          isAvailable,
          lastActive: Date.now()
        });
    } catch (error) {
      console.error('Failed to update rescuer status:', error);
      throw error;
    }
  }

  async addCertification(
    rescuerId: string,
    certification: Omit<RescuerCertification, 'id'>
  ): Promise<string> {
    try {
      const docRef = firestore()
        .collection(this.certificationsCollection)
        .doc();

      await docRef.set({
        id: docRef.id,
        rescuerId,
        ...certification,
        verificationStatus: 'PENDING'
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to add certification:', error);
      throw error;
    }
  }
}

export const rescuerService = RescuerService.getInstance();
