import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Select, Text } from '@ui-kitten/components';
import { TriageAssessment } from '../../types/triage.types';
import { triageService } from '../../services/triage/triageService';
import { useLocation } from '../../hooks/useLocation';
import { VitalSignsInput } from './VitalSignsInput';

interface TriageAssessmentFormProps {
  patientId: string;
  onComplete: (assessmentId: string) => void;
}

export const TriageAssessmentForm: React.FC<TriageAssessmentFormProps> = ({
  patientId,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<TriageAssessment['severity']>('MEDIUM');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: 0,
    temperature: 0,
    oxygenSaturation: 0,
    respiratoryRate: 0,
  });
  const [notes, setNotes] = useState('');
  
  const { currentLocation } = useLocation();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!currentLocation) {
        throw new Error('Location not available');
      }

      const assessmentId = await triageService.createAssessment({
        patientId,
        severity,
        symptoms,
        vitalSigns,
        chiefComplaint,
        notes,
        assessedBy: 'current-user-id', // TODO: Get from auth context
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.address || '',
        },
      });

      onComplete(assessmentId);
    } catch (error) {
      console.error('Failed to submit triage assessment:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text category="h6" style={styles.title}>
        Emergency Triage Assessment
      </Text>

      <Input
        label="Chief Complaint"
        value={chiefComplaint}
        onChangeText={setChiefComplaint}
        multiline
        textStyle={styles.input}
      />

      <Select
        label="Severity"
        value={severity}
        onSelect={value => setSeverity(value as TriageAssessment['severity'])}
        options={[
          { label: 'Critical', value: 'CRITICAL' },
          { label: 'High', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ]}
      />

      <VitalSignsInput
        value={vitalSigns}
        onChange={setVitalSigns}
      />

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        textStyle={styles.input}
      />

      <Button
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Assessment'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    minHeight: 40,
  },
});
