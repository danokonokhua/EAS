import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, Toggle } from '@ui-kitten/components';
import { useDriver } from '../../hooks/useDriver';
import { DriverStatus } from '../../types/driver.types';
import { EmergencyMap } from '../../components/map/EmergencyMap';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DriverHomeScreen: React.FC = () => {
  const { driver, loading, error, updateStatus } = useDriver('current-driver-id');
  const [isOnline, setIsOnline] = useState(false);

  const handleStatusToggle = async (checked: boolean) => {
    setIsOnline(checked);
    await updateStatus(checked ? DriverStatus.AVAILABLE : DriverStatus.OFFLINE);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Text status="danger">{error.message}</Text>;

  return (
    <View style={styles.container}>
      <EmergencyMap />
      <Card style={styles.statusCard}>
        <Toggle
          checked={isOnline}
          onChange={handleStatusToggle}
          status={isOnline ? 'success' : 'basic'}
        >
          {isOnline ? 'Online' : 'Offline'}
        </Toggle>
        <Text category="h6" style={styles.statusText}>
          Status: {driver?.status}
        </Text>
        <Text category="s1">
          Total Trips: {driver?.totalTrips || 0}
        </Text>
        <Text category="s1">
          Rating: {driver?.rating || 0}/5
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
  },
  statusText: {
    marginVertical: 8,
  },
});
