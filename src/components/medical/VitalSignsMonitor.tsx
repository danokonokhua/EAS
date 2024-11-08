import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useAppTheme } from '../../config/theme';
import { VitalSign } from '../../types/medical.types';

interface VitalSignsMonitorProps {
  vitalSigns: VitalSign[];
  onAlertTriggered?: (alert: VitalSignAlert) => void;
}

export const VitalSignsMonitor: React.FC<VitalSignsMonitorProps> = ({
  vitalSigns,
  onAlertTriggered,
}) => {
  const theme = useAppTheme();

  const getStatusColor = (vitalSign: VitalSign) => {
    const { currentReading, normalRange } = vitalSign;
    const value = currentReading.value;
    const { min, max } = normalRange;

    if (value < min || value > max) {
      // Critical reading
      return theme.colors.error;
    }
    
    // Calculate warning thresholds (e.g., within 10% of normal range)
    const warningThreshold = (max - min) * 0.1;
    if (
      value < min + warningThreshold ||
      value > max - warningThreshold
    ) {
      return theme.colors.warning;
    }
    
    return theme.colors.success;
  };

  return (
    <View style={styles.container}>
      {vitalSigns.map((vitalSign) => (
        <Card key={vitalSign.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{vitalSign.name}</Text>
            <Text 
              variant="headlineMedium" 
              style={{ color: getStatusColor(vitalSign) }}
            >
              {vitalSign.currentReading.value} {vitalSign.currentReading.unit}
            </Text>
            <Text variant="bodySmall">
              Normal Range: {vitalSign.normalRange.min} - {vitalSign.normalRange.max} {vitalSign.currentReading.unit}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
});
