import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import {
  CapacityChart,
  EmergencyRequestsList, 
  StatsCard,
  AmbulanceList,
  type AmbulanceListProps
} from '../../components/hospital';
import { hospitalService } from '../../services/hospital/hospitalService';
import { LoadingSpinner } from '../../components/common';
import { HospitalDashboardStats } from '../../types/hospital.types';
import { RootState } from '@/store';

export const HospitalDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<HospitalDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchHospitalStats();
  }, []);

  const fetchHospitalStats = async () => {
    try {
      const hospitalStats = await hospitalService.getHospitalStats(user?.id);
      setStats(hospitalStats);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch hospital statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <StatsCard
          title="Available Beds"
          value={stats.availableBeds}
          icon="bed"
        />
        <StatsCard
          title="Active Requests"
          value={stats.activeRequests}
          icon="ambulance"
        />
        <StatsCard
          title="Available Ambulances"
          value={stats.availableAmbulances}
          icon="truck-medical"
        />
      </View>

      <View style={styles.chartContainer}>
        <CapacityChart data={stats.capacityHistory} />
      </View>

      <View style={styles.listContainer}>
        <EmergencyRequestsList
          requests={stats.activeEmergencyRequests}
          onRequestAccept={handleRequestAccept}
        />
      </View>

      <View style={styles.ambulanceContainer}>
        <AmbulanceList
          ambulances={stats.ambulances}
          onAmbulanceAssign={async (ambulanceId: string, requestId: string) => {
            try {
              await hospitalService.assignAmbulance(ambulanceId, requestId);
              await fetchHospitalStats(); // Refresh data after assignment
            } catch (error) {
              Alert.alert('Error', 'Failed to assign ambulance');
            }
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    flexWrap: 'wrap',
  },
  chartContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  listContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  ambulanceContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
});
