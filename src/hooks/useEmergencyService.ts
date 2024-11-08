import { useState, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useEmergencyService = () => {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'ios') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for emergency services',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      return location.coords;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    requestLocationPermission,
  };
};
