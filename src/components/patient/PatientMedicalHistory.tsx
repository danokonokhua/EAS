import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MedicalRecord } from '../../types/patient.types';
import { patientService } from '../../services/patient/patientService';
import { LoadingSpinner } from '../common';
import { colors } from '../../config/theme';

interface Props {
  patientId?: string;
}

export const PatientMedicalHistory: React.FC<Props> = ({ patientId }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchMedicalHistory();
    }
  }, [patientId]);

  const fetchMedicalHistory = async () => {
    try {
      const history = await patientService.getMedicalHistory(patientId!);
      setRecords(history);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderRecord = ({ item }: { item: MedicalRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.recordType}>{item.type}</Text>
      </View>
      
      <Text style={styles.recordTitle}>{item.title}</Text>
      <Text style={styles.recordDescription}>{item.description}</Text>
      
      {item.medications && (
        <View style={styles.medicationsContainer}>
          <Text style={styles.medicationsTitle}>Medications:</Text>
          {item.medications.map((med, index) => (
            <Text key={index} style={styles.medication}>
              • {med.name} - {med.dosage} ({med.frequency})
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={records}
      renderItem={renderRecord}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>No medical records found</Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recordType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  recordDescription: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  medicationsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  medicationsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  medication: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
  },
});
