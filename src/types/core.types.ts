export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  driverId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location: Location;
  destinationLocation?: Location;
  emergencyType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceDriver {
  id: string;
  name: string;
  vehicleNumber: string;
  phoneNumber: string;
  rating: number;
  currentLocation?: Location;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  documents: {
    license: string;
    insurance: string;
    vehicleRegistration: string;
  };
}
