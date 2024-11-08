export interface SavedLocation {
  id: string;
  userId: string;
  name: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  accessDetails: {
    doorCode?: string;
    floor?: string;
    buildingAccess?: string;
    specialInstructions?: string;
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    lastUsed?: number;
  };
}

export interface DynamicAlertRange {
  baseRadius: number;  // in meters
  maxRadius: number;
  expansionFactor: number;
  densityThreshold: number;
  timeThreshold: number;  // in milliseconds
  expansionInterval: number;  // in milliseconds
}

export interface MapCluster {
  id: string;
  count: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bounds: {
    ne: { latitude: number; longitude: number };
    sw: { latitude: number; longitude: number };
  };
  points: Array<{
    id: string;
    type: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
}
