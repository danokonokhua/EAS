import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAmbulanceTracking } from '../../hooks/useAmbulanceTracking';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Props {
  ambulanceId: string;
}

export const AmbulanceTracker: React.FC<Props> = ({ ambulanceId }) => {
  const { 
    ambulanceLocation, 
    userLocation,
    isLoading,
    error 
  } = useAmbulanceTracking(ambulanceId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !userLocation) {
    return <ErrorView message={error?.message} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User Marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
          pinColor="blue"
        />

        {/* Ambulance Marker */}
        {ambulanceLocation && (
          <Marker
            coordinate={{
              latitude: ambulanceLocation.latitude,
              longitude: ambulanceLocation.longitude,
            }}
            title="Ambulance"
          >
            <AmbulanceMarker heading={ambulanceLocation.heading} />
          </Marker>
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
