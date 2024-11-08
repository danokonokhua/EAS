import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Medication } from '../../types/medical.types';
import { LoadingSpinner, CustomButton } from '../common';
import { colors } from '../../config/theme';
import { medicalService } from '../../services/medical/medicalService';

export const MedicationTracker: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const data = await medicalService.getMedications(user?.id);
      setMedications(data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationId: string) => {
    try {
      await medicalService.markMedicationAsTaken(medicationId);
      // Update local state
      setMedications(medications.map(med => 
        med.id === medicationId 
          ? { ...med, lastTaken: new Date().toISOString() }
          : med
      ));
    } catch (error) {
      // Handle error
    }
  };

  const renderMedication = ({ item }: { item: Medication }) => (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.dosage}>{item.dosage}</Text>
      </View>

      <View style={styles.medicationDetails}>
        <Text style={styles.frequency}>
          {item.frequency} times daily
        </Text>
        <Text style={styles.instructions}>
          {item.instructions}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Text style={styles.lastTaken}>
          Last taken: {item.lastTaken 
            ? new Date(item.lastTaken).toLocaleString()
            : 'Not taken yet'}
        </Text>
        <TouchableOpacity
          style={styles.takeButton}
          onPress={() => markAsTaken(item.id)}
        >
          <Icon name="pill" size={24} color={colors.white} />
          <Text style={styles.takeButtonText}>Take Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No medications scheduled</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  medicationCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dosage: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  medicationDetails: {
    marginBottom: 16,
  },
  frequency: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  lastTaken: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  takeButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
  },
});
