export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  ON_ROUTE = 'ON_ROUTE',
  AT_PICKUP = 'AT_PICKUP',
  AT_HOSPITAL = 'AT_HOSPITAL'
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  status: DriverStatus;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalTrips: number;
  isVerified: boolean;
  documents: {
    license: string;
    insurance: string;
    certification: string;
  };
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: number;
}
