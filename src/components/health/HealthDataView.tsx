import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Spinner } from '@ui-kitten/components';
import { HealthData } from '../../types/health.types';
import { healthDataService } from '../../services/health/healthDataService';
import { useAuth } from '../../hooks/useAuth';
import { MetricCard } from './MetricCard';
import { WearableDevicesList } from './WearableDevicesList';

export const HealthDataView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const data = await healthDataService.getLatestHealthData(user.id);
      setHealthData(data);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      if (!user) return;

      await healthDataService.syncHealthData(user.id);
      await loadHealthData();
    } catch (error) {
      console.error('Failed to sync health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text category="h6">Health Data</Text>
        <Text category="s1" appearance="hint">
          Last updated: {healthData ? new Date(healthData.timestamp).toLocaleString() : 'Never'}
        </Text>

        <View style={styles.metricsContainer}>
          {healthData?.metrics.heartRate && (
            <MetricCard
              title="Heart Rate"
              value={`${healthData.metrics.heartRate} BPM`}
              icon="heart"
            />
          )}
          {healthData?.metrics.bloodPressure && (
            <MetricCard
              title="Blood Pressure"
              value={`${healthData.metrics.bloodPressure.systolic}/${healthData.metrics.bloodPressure.diastolic}`}
              icon="activity"
            />
          )}
          {healthData?.metrics.oxygenSaturation && (
            <MetricCard
              title="Oxygen Saturation"
              value={`${healthData.metrics.oxygenSaturation}%`}
              icon="droplet"
            />
          )}
        </View>

        <Button onPress={handleSync}>
          Sync Health Data
        </Button>
      </Card>

      <WearableDevicesList />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
});
