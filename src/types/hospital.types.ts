export interface Hospital {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    emergencyNumber: string;
  };
  capacity: {
    totalBeds: number;
    availableBeds: number;
    icuBeds: {
      total: number;
      available: number;
    };
    emergencyBeds: {
      total: number;
      available: number;
    };
  };
  emergencyStatus: 'OPEN' | 'FULL' | 'CRITICAL' | 'CLOSED';
  specialties: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface BedUpdate {
  hospitalId: string;
  bedType: 'regular' | 'icu' | 'emergency';
  action: 'occupy' | 'release';
  timestamp: number;
}

// Basic capacity data types
export type CapacityData = {
  departmentId: string;
  departmentName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  utilizationRate: number;
  lastUpdated: Date;
};

// Additional types for capacity monitoring
export type CapacityAlert = {
  id: string;
  departmentId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
};

export type CapacityThreshold = {
  warning: number; // e.g., 80%
  critical: number; // e.g., 90%
};

export type DepartmentCapacityStatus = {
  status: 'normal' | 'warning' | 'critical';
  message?: string;
};

export interface HospitalDashboardStats {
  availableBeds: number;
  activeRequests: number;
  availableAmbulances: number;
  capacityHistory: any[]; // Update this type based on your actual data structure
  activeEmergencyRequests: any[]; // Update this type based on your actual data structure
  ambulances: any[]; // Update this type based on your actual data structure
}
