import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { 
  Marker, 
  Polyline, 
  PROVIDER_GOOGLE, 
  Circle 
} from 'react-native-maps';
import { MapMarker } from './MapMarker';
import { routeOptimizationService } from '../../services/route/routeOptimizationService';
import { Hospital } from '../../types/hospital.types';

interface EnhancedEmergencyMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  ambulances: Array<{
    id: string;
    location: {
      latitude: number;
      longitude: number;
    };
    status: string;
  }>;
  hospitals: Hospital[];
  selectedRoute?: {
    coordinates: Array<{
      latitude: number;
      longitude: number;
    }>;
    duration: number;
    distance: number;
  };
  onAmbulanceSelect?: (ambulanceId: string) => void;
  onHospitalSelect?: (hospital: Hospital) => void;
}

export const EnhancedEmergencyMap: React.FC<EnhancedEmergencyMapProps> = ({
  userLocation,
  ambulances,
  hospitals,
  selectedRoute,
  onAmbulanceSelect,
  onHospitalSelect,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (selectedRoute) {
      fitToCoordinates(selectedRoute.coordinates);
    }
  }, [selectedRoute]);

  const fitToCoordinates = (coordinates: Array<{ latitude: number; longitude: number }>) => {
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
      showsTraffic
    >
      {/* Emergency radius circle */}
      <Circle
        center={userLocation}
        radius={1000}
        fillColor="rgba(255, 0, 0, 0.1)"
        strokeColor="rgba(255, 0, 0, 0.3)"
      />

      {/* Ambulance markers */}
      {ambulances.map(ambulance => (
        <Marker
          key={ambulance.id}
          coordinate={ambulance.location}
          onPress={() => onAmbulanceSelect?.(ambulance.id)}
        >
          <MapMarker type="ambulance" status={ambulance.status} />
        </Marker>
      ))}

      {/* Hospital markers */}
      {hospitals.map(hospital => (
        <Marker
          key={hospital.id}
          coordinate={hospital.location}
          onPress={() => onHospitalSelect?.(hospital)}
        >
          <MapMarker type="hospital" />
        </Marker>
      ))}

      {/* Selected route */}
      {selectedRoute && (
        <Polyline
          coordinates={selectedRoute.coordinates}
          strokeWidth={3}
          strokeColor="#FF0000"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
