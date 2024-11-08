import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from '@ui-kitten/components';
import { Hospital } from '../../types/hospital.types';

interface HospitalCardProps {
  hospital: Hospital;
  distance?: number;
  onSelect?: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  distance,
  onSelect,
}) => {
  const getStatusColor = (status: Hospital['emergencyStatus']) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CRITICAL': return 'warning';
      case 'FULL': return 'danger';
      default: return 'basic';
    }
  };

  return (
    <Card
      style={styles.card}
      onPress={() => onSelect?.(hospital)}
      status={getStatusColor(hospital.emergencyStatus)}
    >
      <View style={styles.header}>
        <Text category="h6">{hospital.name}</Text>
        {distance && (
          <Text category="s1">{distance.toFixed(1)} km</Text>
        )}
      </View>

      <View style={styles.stats}>
        <Text category="s1">
          Available Beds: {hospital.capacity.availableBeds}
        </Text>
        <Text category="s1">
          ICU: {hospital.capacity.icuBeds.available}/{hospital.capacity.icuBeds.total}
        </Text>
        <Text category="s1">
          ER: {hospital.capacity.emergencyBeds.available}/{hospital.capacity.emergencyBeds.total}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          size="small"
          onPress={() => onSelect?.(hospital)}
        >
          View Details
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stats: {
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
