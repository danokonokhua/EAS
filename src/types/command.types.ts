export interface CommandPost {
  id: string;
  sceneId: string;
  establishedAt: number;
  commander: {
    id: string;
    name: string;
    role: string;
    location?: {
      latitude: number;
      longitude: number;
    }
  };
  status: 'ACTIVE' | 'CLOSED';
  resourceAllocations: ResourceAllocation[];
  handoffHistory: CommandHandoff[];
  notes: CommandNote[];
}

export interface CommandHandoff {
  timestamp: number;
  previousCommander: {
    id: string;
    name: string;
    role: string;
  };
  newCommander: {
    id: string;
    name: string;
    role: string;
  };
  reason: string;
}

export interface ResourceAllocation {
  id: string;
  resourceType: 'PERSONNEL' | 'EQUIPMENT' | 'VEHICLE';
  resourceId: string;
  assignedTo: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'RELEASED';
  timestamp: number;
}

export interface CommandNote {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'GENERAL' | 'TACTICAL' | 'STRATEGIC' | 'SAFETY';
}
