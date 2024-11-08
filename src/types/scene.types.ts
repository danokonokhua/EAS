export interface EmergencyScene {
  id: string;
  emergencyId: string;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    accessNotes?: string;
  };
  hazards: SceneHazard[];
  resources: SceneResource[];
  victims: SceneVictim[];
  notes: SceneNote[];
  timeline: SceneEvent[];
  commandPost?: {
    location: {
      latitude: number;
      longitude: number;
    };
    commander: string;
  };
  weatherConditions?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    conditions: string;
  };
}

export interface SceneHazard {
  id: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  location?: {
    latitude: number;
    longitude: number;
  };
  containmentStatus: 'UNCONTAINED' | 'PARTIALLY_CONTAINED' | 'CONTAINED';
  reportedBy: string;
  timestamp: number;
}

export interface SceneResource {
  id: string;
  type: 'AMBULANCE' | 'FIRE_TRUCK' | 'POLICE' | 'HAZMAT' | 'OTHER';
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'DEPARTING';
  assignedPersonnel: string[];
  estimatedArrival?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface SceneVictim {
  id: string;
  triageStatus: 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';
  location: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  condition: string;
  transportPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
  hospital?: string;
  notes: string[];
}

export interface SceneNote {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  type: 'GENERAL' | 'MEDICAL' | 'HAZARD' | 'RESOURCE' | 'COMMAND';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  attachments?: {
    type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
    url: string;
  }[];
}

export interface SceneEvent {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  author: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  relatedResources?: string[];
}
