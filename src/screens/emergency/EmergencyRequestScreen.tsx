import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Button, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { Button as CustomButton, LoadingSpinner } from '../../components/common';
import colors from '../../config/theme';
import { emergencyService } from '../../services/emergency/emergencyService';
import { mapService } from '@/services/maps/mapService';
import { AmbulanceDriver } from '@/types/core.types';

// Define GeoPosition type based on the package's actual response structure
type GeoPosition = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

// Add at the top with other imports
type EmergencyResponse = {
  id: string | number;
  // ... other response fields
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
  emergencyButton: {
    backgroundColor: colors.colors.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const EmergencyRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nearbyAmbulances, setNearbyAmbulances] = useState<AmbulanceDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentLocation: location } = useLocation() as unknown as { currentLocation: GeoPosition };

  useEffect(() => {
    if (location) {
      setNearbyAmbulances([]);
    }
  }, [location]);

  const requestEmergency = async () => {
    try {
      setLoading(true);
      const response = emergencyService.createRequest({
        location: {
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
          address: mapService.reverseGeocode(location)
        },
        emergencyType: 'MEDICAL',
        status: 'PENDING'
      }) as unknown as EmergencyResponse;
      
      if (!response?.id) {
        throw new Error('Invalid response format');
      }
      
      navigation.navigate('TrackingScreen', { requestId: response.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to create emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? <LoadingSpinner /> : (
        <>
          <MapView 
            style={styles.map}
            initialRegion={{
              latitude: location?.coords.latitude,
              longitude: location?.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {nearbyAmbulances.map(ambulance => (
              ambulance.currentLocation && (
                <Marker
                  key={ambulance.id}
                  coordinate={{
                    latitude: ambulance.currentLocation.latitude,
                    longitude: ambulance.currentLocation.longitude
                  }}
                  title={`Ambulance ${ambulance.vehicleNumber}`}
                />
              )
            ))}
          </MapView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={requestEmergency}
            >
              <Text style={styles.buttonText}>
                Request Emergency Ambulance
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
