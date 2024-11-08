import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { EmergencyType } from '../../types/emergency.types';
import { emergencyService } from '../../services/api/emergency.api';
import Button from '../../components/common/Button';
import { EmergencyTypeSelector } from '../../components/common/EmergencyTypeSelector';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RequestScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('CRITICAL');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleEmergencyRequest = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const request = await emergencyService.createEmergencyRequest({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        emergencyType,
        patientId: 'current-user-id' // TODO: Get from auth context
      });

      // TODO: Navigate to tracking screen
      console.log('Emergency request created:', request);
    } catch (error) {
      Alert.alert('Error', 'Failed to create emergency request');
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        />
      </MapView>
      
      <View style={styles.bottomContainer}>
        <EmergencyTypeSelector
          selectedType={emergencyType}
          onSelect={setEmergencyType}
        />
        <Button
          title="Request Emergency"
          onPress={handleEmergencyRequest}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
