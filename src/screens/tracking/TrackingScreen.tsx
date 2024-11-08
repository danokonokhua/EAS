import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { updateLocation } from '../../store/slices/trackingSlice';
import { socketService } from '../../services/socket/socketService';
import { CustomButton, LoadingSpinner } from '../../components/common';
import { useLocation } from '../../hooks/useLocation';
import { LocationUpdate, EmergencyRequest } from '../../types/emergency.types';
import { mapService } from '../../services/maps/mapService';
import { RootState } from '@/store';

export const TrackingScreen: React.FC = () => {
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const { location, error } = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (location) {
      const update: LocationUpdate = {
        userId: user?.id || '',
        role: user?.role || '',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading || 0,
          speed: location.coords.speed || 0,
        },
        timestamp: Date.now(),
      };

      dispatch(updateLocation(update));
      socketService.emitLocation(update);
    }
  }, [location, user]);

  useEffect(() => {
    socketService.subscribeToEmergencyRequests((newRequest) => {
      setRequest(newRequest);
      if (user?.role === 'DRIVER') {
        Alert.alert(
          'New Emergency Request',
          'You have a new emergency request. Would you like to accept?',
          [
            {
              text: 'Accept',
              onPress: () => handleAcceptRequest(newRequest),
            },
            {
              text: 'Decline',
              style: 'cancel',
            },
          ]
        );
      }
    });
  }, []);

  const handleAcceptRequest = async (request: EmergencyRequest) => {
    try {
      if (!location) return;
      
      const route = await mapService.getRouteDetails(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        request.location
      );

      // TODO: Handle route acceptance and navigation
    } catch (error) {
      Alert.alert('Error', 'Failed to get route details');
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
          title={user?.role === 'DRIVER' ? 'Ambulance Location' : 'Your Location'}
        />
        {request && (
          <Marker
            coordinate={request.location}
            title="Emergency Location"
            pinColor="red"
          />
        )}
      </MapView>
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
});
