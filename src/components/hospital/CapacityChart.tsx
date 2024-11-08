import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { CapacityData } from '../../types/hospital.types';

interface CapacityChartProps {
  data: CapacityData[];
  onThresholdExceeded?: (departmentId: string, utilizationRate: number) => void;
}

export const CapacityChart: React.FC<CapacityChartProps> = ({
  data,
  onThresholdExceeded,
}) => {
  const { colors } = useTheme();

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return colors.error;
    if (rate >= 80) return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.container}>
      {data.map((department) => (
        <Card key={department.departmentId} style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{department.departmentName}</Text>
            <ProgressBar
              progress={department.utilizationRate / 100}
              color={getUtilizationColor(department.utilizationRate)}
              style={styles.progressBar}
            />
            <View style={styles.statsRow}>
              <Text variant="bodySmall">
                Occupied: {department.occupiedBeds}/{department.totalBeds}
              </Text>
              <Text variant="bodySmall">
                Available: {department.availableBeds}
              </Text>
            </View>
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
  progressBar: {
    marginVertical: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
