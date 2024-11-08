import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List } from '@ui-kitten/components';
import { MedicalRecord } from '../../types/medical.types';
import { medicalRecordService } from '../../services/medical/medicalRecordService';

interface MedicalRecordViewProps {
  patientId: string;
  onEdit?: () => void;
  isEmergency?: boolean;
}

export const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
  patientId,
  onEdit,
  isEmergency = false,
}) => {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicalRecord();
  }, [patientId]);

  const loadMedicalRecord = async () => {
    try {
      const data = await medicalRecordService.getMedicalRecord(patientId);
      setRecord(data);
    } catch (error) {
      console.error('Failed to load medical record:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!record) {
    return (
      <View style={styles.container}>
        <Text category="h6">No medical record found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text category="h6">Personal Information</Text>
        <View style={styles.infoRow}>
          <Text>Name: {`${record.personalInfo.firstName} ${record.personalInfo.lastName}`}</Text>
          <Text>DOB: {record.personalInfo.dateOfBirth}</Text>
          <Text>Blood Type: {record.personalInfo.bloodType}</Text>
        </View>
      </Card>

      {isEmergency && (
        <Card style={[styles.card, styles.emergencyCard]}>
          <Text category="h6">Emergency Information</Text>
          <List
            data={record.allergies}
            renderItem={({ item }) => (
              <Text style={styles.alertText}>
                ⚠️ Allergic to {item.allergen} - {item.severity} reaction
              </Text>
            )}
          />
          <List
            data={record.medicalConditions}
            renderItem={({ item }) => (
              <Text style={styles.alertText}>
                ⚕️ {item.condition} - {item.severity}
              </Text>
            )}
          />
        </Card>
      )}

      <Card style={styles.card}>
        <Text category="h6">Medications</Text>
        <List
          data={record.medications}
          renderItem={({ item }) => (
            <Text>{`${item.name} - ${item.dosage} ${item.frequency}`}</Text>
          )}
        />
      </Card>

      <Card style={styles.card}>
        <Text category="h6">Emergency Contacts</Text>
        <List
          data={record.emergencyContacts}
          renderItem={({ item }) => (
            <View style={styles.contactRow}>
              <Text>{item.name} ({item.relationship})</Text>
              <Text>{item.phone}</Text>
            </View>
          )}
        />
      </Card>

      {onEdit && (
        <Button
          style={styles.editButton}
          onPress={onEdit}
        >
          Edit Medical Record
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 8,
  },
  emergencyCard: {
    backgroundColor: '#FFF3F3',
  },
  infoRow: {
    marginVertical: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  alertText: {
    color: '#D14343',
    marginVertical: 2,
  },
  editButton: {
    margin: 16,
  },
});
