import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { EmergencyMap } from '../../components/map/EmergencyMap';
import { AmbulanceLocation } from '../../types/ambulance.types';
import { Region } from 'react-native-maps';

export const EmergencyScreen: React.FC = () => {
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [nearbyAmbulances, setNearbyAmbulances] = useState<AmbulanceLocation[]>([]);

  const handleRegionChange = (region: Region) => {
    // Fetch nearby ambulances based on new region
    // Update nearbyAmbulances state
  };

  const handleAmbulanceSelect = (ambulanceId: string) => {
    setSelectedAmbulance(ambulanceId);
    // Show ambulance details or booking modal
  };

  return (
    <View style={styles.container}>
      <EmergencyMap
        ambulances={nearbyAmbulances}
        onRegionChange={handleRegionChange}
        onAmbulanceSelect={handleAmbulanceSelect}
      />
      {/* Add other emergency UI components */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
