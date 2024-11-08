import { Location } from '../../types/emergency.types';
import mapsConfig from '../../config/maps.config';

class MapService {
  reverseGeocode // Assuming distance in meters and speed in meters/second
    (location: any) {
      throw new Error('Method not implemented.');
  }
  private apiKey = mapsConfig.apiKey;

  async getAddressFromCoordinates(location: Location): Promise<string> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${this.apiKey}`
      );
      const data = await response.json();
      return data.results[0]?.formatted_address || '';
    } catch (error) {
      throw new Error('Failed to get address from coordinates');
    }
  }

  async getRouteDetails(origin: Location, destination: Location): Promise<any> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${this.apiKey}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to get route details');
    }
  }

  calculateETA(distance: number, speed: number): number {
    // Assuming distance in meters and speed in meters/second
    return Math.round(distance / speed);
  }
}

export const mapService = new MapService();
