export interface MedicalRecord {
  id: string;
  patientId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    weight: number;
    height: number;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  medicalConditions: Array<{
    condition: string;
    diagnosedDate: string;
    severity: 'mild' | 'moderate' | 'severe';
    notes?: string;
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
  }>;
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    expirationDate: string;
  };
  lastUpdated: number;
}

// Basic vital sign types
export type VitalSignValue = {
  value: number;
  unit: string;
  timestamp: Date;
  isNormal: boolean;
};

export type VitalSign = {
  id: string;
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'oxygenSaturation' | 'respiratoryRate';
  name: string;
  currentReading: VitalSignValue;
  normalRange: {
    min: number;
    max: number;
  };
  history?: VitalSignValue[];
};

// Additional types for vital signs monitoring
export type VitalSignsData = {
  patientId: string;
  readings: VitalSign[];
  lastUpdated: Date;
};

export type VitalSignAlert = {
  id: string;
  vitalSignId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
};
