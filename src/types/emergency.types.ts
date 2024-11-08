export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export enum EmergencyType {
  CRITICAL = 'CRITICAL',
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  ACCIDENT = 'ACCIDENT'
}

export enum EmergencyStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface EmergencyRequest {
  id?: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  emergencyType: EmergencyType;
  status: EmergencyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isNotified: boolean;
}

export interface MedicalTeamMember {
  id: string;
  name: string;
  role: 'DOCTOR' | 'PARAMEDIC' | 'NURSE';
  specialization?: string;
  phone: string;
}

export interface AmbulanceVehicle {
  id: string;
  type: 'BASIC' | 'ADVANCED' | 'SPECIALIZED';
  registrationNumber: string;
  equipment: string[];
  status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: number;
  };
  maintenance: {
    lastCheck: number;
    nextCheck: number;
    status: string;
  };
}

export interface EmergencyDetails {
  id: string;
  userId: string;
  userName: string;
  timestamp: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  type: string;
  description?: string;
}

export interface EmergencyResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface EmergencyRecording {
  id: string;
  emergencyId: string;
  type: 'AUDIO' | 'VIDEO';
  startTime: number;
  endTime?: number;
  url: string;
  size: number;
  duration: number;
  metadata: {
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    deviceInfo: {
      model: string;
      platform: string;
      osVersion: string;
    };
  };
  status: 'RECORDING' | 'COMPLETED' | 'FAILED';
}

export interface RescuerTier {
  id: string;
  level: 'BASIC' | 'EMT' | 'ADVANCED';
  certifications: string[];
  skills: string[];
  equipmentAccess: string[];
  maxResponseDistance: number;
  isAvailable: boolean;
  lastActive: number;
}

export interface EmergencyEquipment {
  id: string;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  assignedTo?: string;
  lastMaintenance: number;
  nextMaintenance: number;
}

export interface AmbulanceDriver {
  id: string;
  name: string;
  vehicleNumber: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}
