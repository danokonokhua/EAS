import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Card, Text } from 'react-native-paper';

interface AmbulanceMarkerProps {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  status: 'available' | 'busy' | 'maintenance';
  vehicleNumber: string;
  onPress?: () => void;
}

export const AmbulanceMarker: React.FC<AmbulanceMarkerProps> = ({
  coordinate,
  status,
  vehicleNumber,
  onPress,
}) => {
  const getMarkerImage = () => {
    switch (status) {
      case 'available':
        return require('../../../assets/ambulance-available.png');
      case 'busy':
        return require('../../../assets/ambulance-busy.png');
      case 'maintenance':
        return require('../../../assets/ambulance-maintenance.png');
      default:
        return require('../../../assets/ambulance-available.png');
    }
  };

  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
    >
      <Image 
        source={getMarkerImage()} 
        style={styles.markerImage} 
      />
      <Callout>
        <Card style={styles.callout}>
          <Card.Content>
            <Text variant="titleMedium">{vehicleNumber}</Text>
            <Text variant="bodyMedium" style={styles.statusText}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Card.Content>
        </Card>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  callout: {
    minWidth: 150,
    maxWidth: 200,
  },
  statusText: {
    marginTop: 4,
  },
});
