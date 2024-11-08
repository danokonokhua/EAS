export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TriageAssessment {
  id: string;
  patientId: string;
  timestamp: number;
  severity: EmergencySeverity;
  symptoms: string[];
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  chiefComplaint: string;
  notes: string;
  assessedBy: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: number;
  estimatedResponseTime: number;
}

export interface TriageRule {
  id: string;
  condition: string;
  severity: EmergencySeverity;
  priority: number;
  requiredResources: string[];
  responseTimeThreshold: number;
}
