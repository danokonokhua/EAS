import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { AmbulanceMarker } from './AmbulanceMarker';

interface Ambulance {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  status: 'available' | 'busy' | 'maintenance';
  vehicleNumber: string;
}

interface EmergencyMapProps {
  initialRegion: Region;
  ambulances: Ambulance[];
  onAmbulancePress?: (ambulance: Ambulance) => void;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  initialRegion,
  ambulances,
  onAmbulancePress,
}) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {ambulances.map((ambulance) => (
          <AmbulanceMarker
            key={ambulance.id}
            {...ambulance}
            onPress={() => onAmbulancePress?.(ambulance)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
