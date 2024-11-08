import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text } from '@ui-kitten/components';
import { EmergencyRecording } from '../../types/emergency.types';
import { emergencyRecordingService } from '../../services/emergency/emergencyRecordingService';
import { useLocation } from '../../hooks/useLocation';
import { RecordingTimer } from './RecordingTimer';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface EmergencyRecorderProps {
  emergencyId: string;
  onRecordingComplete: (recording: EmergencyRecording) => void;
  onError: (error: Error) => void;
}

export const EmergencyRecorder: React.FC<EmergencyRecorderProps> = ({
  emergencyId,
  onRecordingComplete,
  onError,
}) => {
  const [recording, setRecording] = useState<EmergencyRecording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { location } = useLocation();

  useEffect(() => {
    // Override DO NOT DISTURB mode if possible
    if (Platform.OS === 'android') {
      // TODO: Implement DND override for Android
    }
  }, []);

  const handleStartRecording = async (type: EmergencyRecording['type']) => {
    try {
      setIsRecording(true);
      const recordingId = await emergencyRecordingService.startRecording(emergencyId, type);
      setRecording({ id: recordingId } as EmergencyRecording);
    } catch (error) {
      setIsRecording(false);
      onError(error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recording) return;
      
      const completedRecording = await emergencyRecordingService.stopRecording();
      setIsRecording(false);
      setRecording(null);
      onRecordingComplete(completedRecording);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text category="h6">Emergency Recording</Text>
        
        {!isRecording ? (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => handleStartRecording('AUDIO')}
              status="danger"
              style={styles.button}
            >
              Start Audio Recording
            </Button>
            <Button
              onPress={() => handleStartRecording('VIDEO')}
              status="danger"
              style={styles.button}
            >
              Start Video Recording
            </Button>
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            <RecordingTimer />
            <Button
              onPress={handleStopRecording}
              status="danger"
              style={styles.button}
            >
              Stop Recording
            </Button>
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  recordingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    marginHorizontal: 8,
  },
});
