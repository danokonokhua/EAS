import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from '@ui-kitten/components';

interface MapMarkerProps {
  type: 'ambulance' | 'user' | 'hospital';
}

export const MapMarker: React.FC<MapMarkerProps> = ({ type }) => {
  const getMarkerIcon = () => {
    switch (type) {
      case 'ambulance':
        return 'car-outline';
      case 'user':
        return 'person-outline';
      case 'hospital':
        return 'home-outline';
      default:
        return 'pin-outline';
    }
  };

  return (
    <View style={styles.markerContainer}>
      <Icon
        name={getMarkerIcon()}
        fill="#FF3D71"
        style={styles.markerIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FF3D71',
  },
  markerIcon: {
    width: 24,
    height: 24,
  },
});
