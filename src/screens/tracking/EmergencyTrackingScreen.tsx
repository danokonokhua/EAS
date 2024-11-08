import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { socket } from '../../services/socket/socketService';
import { LoadingSpinner, CustomButton } from '../../components/common';
import theme from '../../config/theme';
import { EmergencyStatus } from '../../components/emergency/EmergencyStatus';
import { Location } from '../../types/core.types';
import { emergencyService } from '@/services/emergency/emergencyService';

export const EmergencyTrackingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<string>('PENDING');
  const [driverInfo, setDriverInfo] = useState(null);

  useEffect(() => {
    initializeTracking();
    return () => {
      socket.off(`emergency:${requestId}`);
      socket.off(`location:${requestId}`);
    };
  }, []);

  const initializeTracking = async () => {
    try {
      // Get initial emergency request details
      const emergency = await emergencyService.getEmergencyDetails(requestId);
      setStatus(emergency.status);
      setDriverInfo(emergency.driver);
      setUserLocation(emergency.userLocation);
      
      // Listen for status updates
      socket.on(`emergency:${requestId}`, handleEmergencyUpdate);
      
      // Listen for driver location updates
      socket.on(`location:${requestId}`, handleLocationUpdate);
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency details');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyUpdate = (data: any) => {
    setStatus(data.status);
    if (data.driver) {
      setDriverInfo(data.driver);
    }
  };

  const handleLocationUpdate = (location: Location) => {
    setDriverLocation(location);
  };

  const cancelEmergency = async () => {
    try {
      await emergencyService.cancelEmergency(requestId);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel emergency');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
          />
        )}
        
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Ambulance"
          />
        )}
      </MapView>

      <View style={styles.statusContainer}>
        <EmergencyStatus status={status} />
        {driverInfo && <DriverInfo driver={driverInfo} />}
        
        {status === 'PENDING' && (
          <CustomButton
            title="Cancel Emergency"
            onPress={cancelEmergency}
            style={styles.cancelButton}
          />
        )}
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
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: colors.error,
    marginTop: 16,
  }
});
