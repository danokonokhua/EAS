import { Platform, PermissionsAndroid } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Camera } from 'react-native-vision-camera';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { EmergencyRecording, RescuerTier } from '../../types/emergency.types';
import { locationService } from '../location/locationService';
import { notificationService } from '../notification/notificationService';

class EmergencyRecordingService {
  private static instance: EmergencyRecordingService;
  private audioRecorder: AudioRecorderPlayer;
  private currentRecording: EmergencyRecording | null = null;
  private readonly recordingsCollection = 'emergencyRecordings';

  private constructor() {
    this.audioRecorder = new AudioRecorderPlayer();
  }

  static getInstance(): EmergencyRecordingService {
    if (!EmergencyRecordingService.instance) {
      EmergencyRecordingService.instance = new EmergencyRecordingService();
    }
    return EmergencyRecordingService.instance;
  }

  async startRecording(emergencyId: string, type: EmergencyRecording['type']): Promise<string> {
    try {
      await this.requestPermissions(type);
      const location = await locationService.getCurrentLocation();
      
      const recording: EmergencyRecording = {
        id: firestore().collection(this.recordingsCollection).doc().id,
        emergencyId,
        type,
        startTime: Date.now(),
        url: '',
        size: 0,
        duration: 0,
        metadata: {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          },
          deviceInfo: {
            model: Platform.select({ ios: 'iOS', android: 'Android' }),
            platform: Platform.OS,
            osVersion: Platform.Version.toString(),
          },
        },
        status: 'RECORDING',
      };

      if (type === 'AUDIO') {
        await this.startAudioRecording(recording);
      } else {
        await this.startVideoRecording(recording);
      }

      this.currentRecording = recording;
      await this.saveRecording(recording);

      return recording.id;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  private async requestPermissions(type: EmergencyRecording['type']): Promise<void> {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      if (type === 'VIDEO') {
        permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        throw new Error('Required permissions not granted');
      }
    } else {
      // iOS permissions handling
      const audioPermission = await this.audioRecorder.checkPermission();
      if (!audioPermission) {
        throw new Error('Audio permission not granted');
      }

      if (type === 'VIDEO') {
        const cameraPermission = await Camera.requestCameraPermission();
        if (cameraPermission !== 'authorized') {
          throw new Error('Camera permission not granted');
        }
      }
    }
  }

  private async startAudioRecording(recording: EmergencyRecording): Promise<void> {
    const filename = `audio_${recording.id}.m4a`;
    const path = Platform.select({
      ios: `${filename}`,
      android: `sdcard/${filename}`,
    });

    await this.audioRecorder.startRecorder(path);
    this.audioRecorder.addRecordBackListener((e) => {
      // Update recording duration
      if (this.currentRecording) {
        this.currentRecording.duration = e.currentPosition;
      }
    });
  }

  private async startVideoRecording(recording: EmergencyRecording): Promise<void> {
    // TODO: Implement video recording using react-native-vision-camera
  }

  async stopRecording(): Promise<EmergencyRecording> {
    try {
      if (!this.currentRecording) {
        throw new Error('No active recording');
      }

      if (this.currentRecording.type === 'AUDIO') {
        const result = await this.audioRecorder.stopRecorder();
        this.audioRecorder.removeRecordBackListener();
        
        // Upload to Firebase Storage
        const filename = `recordings/${this.currentRecording.id}/${Path.basename(result)}`;
        const reference = storage().ref(filename);
        await reference.putFile(result);
        const url = await reference.getDownloadURL();

        this.currentRecording.url = url;
        this.currentRecording.endTime = Date.now();
        this.currentRecording.status = 'COMPLETED';

        await this.saveRecording(this.currentRecording);
        return this.currentRecording;
      } else {
        // TODO: Implement video recording stop
        throw new Error('Video recording not implemented');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      if (this.currentRecording) {
        this.currentRecording.status = 'FAILED';
        await this.saveRecording(this.currentRecording);
      }
      throw error;
    } finally {
      this.currentRecording = null;
    }
  }

  private async saveRecording(recording: EmergencyRecording): Promise<void> {
    try {
      await firestore()
        .collection(this.recordingsCollection)
        .doc(recording.id)
        .set(recording);
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  }
}

export const emergencyRecordingService = EmergencyRecordingService.getInstance();
