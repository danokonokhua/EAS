import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native';
import { PTTSession } from '../../types/communication.types';
import { communicationService } from '../../services/communication/communicationService';
import { audioService } from '../../services/audio/audioService';
import { usePermissions } from '../../hooks/usePermissions';

interface PushToTalkProps {
  channelId: string;
  userId: string;
  onError: (error: Error) => void;
}

export const PushToTalk: React.FC<PushToTalkProps> = ({
  channelId,
  userId,
  onError,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [currentSession, setCurrentSession] = useState<PTTSession | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const { checkAndRequestMicrophonePermission } = usePermissions();

  useEffect(() => {
    const unsubscribe = subscribeToActiveSessions();
    return () => unsubscribe();
  }, []);

  const subscribeToActiveSessions = () => {
    // Subscribe to active PTT sessions
    return communicationService.subscribeToActivePTTSessions(channelId, (session) => {
      if (session) {
        setActiveSpeaker(session.speaker);
      } else {
        setActiveSpeaker(null);
      }
    });
  };

  const handlePressIn = async () => {
    try {
      // Check if someone else is speaking
      if (activeSpeaker) {
        throw new Error('Channel is busy');
      }

      // Check permissions
      const hasPermission = await checkAndRequestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start PTT session
      const sessionId = await communicationService.startPTTSession(channelId, userId);
      setCurrentSession({ id: sessionId } as PTTSession);
      setIsPressed(true);

      // Start recording
      await audioService.startRecording();
    } catch (error) {
      onError(error);
    }
  };

  const handlePressOut = async () => {
    try {
      if (currentSession) {
        // Stop recording
        const audioFile = await audioService.stopRecording();

        // End PTT session
        await communicationService.endPTTSession(currentSession.id);
        // Send audio message
        await communicationService.sendMessage(channelId, {
          senderId: userId,
          type: 'AUDIO',
          content: '',
          priority: 'NORMAL',
          channelId,
          attachments: [{
            type: 'audio/aac', 
            url: audioFile.path,
            size: audioFile.size,
            duration: audioFile.duration,
          }],
        });

        setCurrentSession(null);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsPressed(false);
    }
  };

  return (
    <View style={styles.container}>
      {activeSpeaker && activeSpeaker !== userId && (
        <Text style={styles.speakerText}>
          {activeSpeaker} is speaking...
        </Text>
      )}
      
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          isPressed && styles.buttonPressed,
          activeSpeaker && activeSpeaker !== userId && styles.buttonDisabled,
        ]}
        disabled={activeSpeaker !== null && activeSpeaker !== userId}
      >
        <Icon
          name={isPressed ? 'mic' : 'mic-outline'}
          style={styles.icon}
          fill={isPressed ? '#FFFFFF' : '#000000'}
        />
        <Text style={[styles.buttonText, isPressed && styles.buttonTextPressed]}>
          {isPressed ? 'Release to end' : 'Hold to speak'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  speakerText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    elevation: Platform.select({ android: 2, ios: 0 }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonPressed: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
  },
  buttonTextPressed: {
    color: '#FFFFFF',
  },
});
