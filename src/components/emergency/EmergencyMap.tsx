import React, { useEffect, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { Location } from '../../types/core.types';
import { colors } from '../../config/theme';

interface Props {
  userLocation: Location;
  driverLocation?: Location;
  onRegionChange?: (region: any) => void;
}

export const EmergencyMap: React.FC<Props> = ({
  userLocation,
  driverLocation,
  onRegionChange
}) => {
  const mapRef = useRef<MapView>(null);
  const { status } = useSelector((state: RootState) => state.emergency);

  useEffect(() => {
    if (driverLocation && mapRef.current) {
      // Fit both markers in view
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: driverLocation.latitude, longitude: driverLocation.longitude }
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        }
      );
    }
  }, [driverLocation]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onRegionChange={onRegionChange}
    >
      <Marker
        coordinate={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }}
        title="Your Location"
        pinColor={colors.error}
      />
      {driverLocation && (
        <Marker
          coordinate={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          }}
          title="Ambulance"
          pinColor={colors.success}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  }
});
