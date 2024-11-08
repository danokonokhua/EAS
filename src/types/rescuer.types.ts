export enum RescuerLevel {
  BASIC = 'BASIC',
  EMT = 'EMT',
  ADVANCED = 'ADVANCED'
}

export interface RescuerCertification {
  id: string;
  rescuerId: string;
  type: string;
  issuer: string;
  issueDate: number;
  expiryDate: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentUrl: string;
  verifiedBy?: string;
  verificationDate?: number;
}

export interface RescuerEquipment {
  id: string;
  rescuerId: string;
  type: string;
  name: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  lastInspection: number;
  nextInspection: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface RescuerProfile extends User {
  level: RescuerLevel;
  isAvailable: boolean;
  lastActive: number;
  certifications: RescuerCertification[];
  equipment: RescuerEquipment[];
  specialties: string[];
  responseRadius: number;
  rating: number;
  totalResponses: number;
  successfulResponses: number;
  activeHours: {
    start: number;
    end: number;
    days: number[];
  };
}
