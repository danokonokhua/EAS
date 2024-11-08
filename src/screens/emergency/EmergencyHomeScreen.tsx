import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { EmergencyButton } from '../../components/emergency/EmergencyButton';
import { emergencyService } from '../../services/emergency/emergencyService';
import { LoadingSpinner } from '../../components/common';
import colors from '../../config/theme';

export const EmergencyHomeScreen = () => {
  const navigation = useNavigation();
  const { location, error } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleEmergencyRequest = async () => {
    try {
      setLoading(true);
      const request = await emergencyService.createEmergencyRequest({
        location: {
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude
        },
        status: 'PENDING'
      });

      navigation.navigate('EmergencyTracking', { requestId: request.id });
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
        <NearbyAmbulances location={location} />
      </MapView>

      <View style={styles.buttonContainer}>
        <EmergencyButton 
          onPress={handleEmergencyRequest}
          loading={loading}
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
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  }
});
