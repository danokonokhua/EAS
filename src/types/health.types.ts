export interface HealthData {
  id: string;
  userId: string;
  timestamp: number;
  source: 'APPLE_HEALTH' | 'GOOGLE_FIT' | 'MANUAL' | 'WEARABLE';
  metrics: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    bloodGlucose?: number;
    oxygenSaturation?: number;
    temperature?: number;
    respiratoryRate?: number;
    steps?: number;
    activity?: {
      type: string;
      duration: number;
      calories: number;
    };
  };
  deviceInfo?: {
    type: string;
    model: string;
    manufacturer: string;
    version: string;
  };
}

export interface WearableDevice {
  id: string;
  userId: string;
  type: string;
  name: string;
  manufacturer: string;
  model: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING';
  lastSync: number;
  batteryLevel?: number;
}
