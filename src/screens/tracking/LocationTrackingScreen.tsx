import React, { useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { useLocation } from '../../hooks/useLocation';

export const LocationTrackingScreen: React.FC = () => {
  const { 
    currentLocation, 
    isTracking, 
    error, 
    startTracking, 
    stopTracking 
  } = useLocation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracking</Text>
      
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text>Latitude: {currentLocation.latitude}</Text>
          <Text>Longitude: {currentLocation.longitude}</Text>
          <Text>Accuracy: {currentLocation.accuracy}m</Text>
          <Text>Speed: {currentLocation.speed || 'N/A'}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
          onPress={isTracking ? stopTracking : startTracking}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationInfo: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
