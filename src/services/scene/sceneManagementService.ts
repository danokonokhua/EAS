import firestore from '@react-native-firebase/firestore';
import { EmergencyScene, SceneHazard, SceneResource, SceneVictim, SceneNote } from '../../types/scene.types';
import { locationService } from '../location/locationService';
import { weatherService } from '../weather/weatherService';
import { notificationService } from '../notification/notificationService';

class SceneManagementService {
  private static instance: SceneManagementService;
  private readonly scenesCollection = 'emergencyScenes';

  private constructor() {}

  static getInstance(): SceneManagementService {
    if (!SceneManagementService.instance) {
      SceneManagementService.instance = new SceneManagementService();
    }
    return SceneManagementService.instance;
  }

  async createScene(emergencyId: string, location: { latitude: number; longitude: number }): Promise<string> {
    try {
      const weatherData = await weatherService.getCurrentWeather(location);
      const address = await locationService.getAddressFromCoordinates(location);

      const scene: EmergencyScene = {
        id: firestore().collection(this.scenesCollection).doc().id,
        emergencyId,
        status: 'ACTIVE',
        priority: 'HIGH',
        location: {
          ...location,
          address,
        },
        hazards: [],
        resources: [],
        victims: [],
        notes: [],
        timeline: [{
          id: Date.now().toString(),
          type: 'SCENE_CREATED',
          description: 'Emergency scene established',
          timestamp: Date.now(),
          author: 'SYSTEM',
          severity: 'INFO'
        }],
        weatherConditions: weatherData
      };

      await firestore()
        .collection(this.scenesCollection)
        .doc(scene.id)
        .set(scene);

      return scene.id;
    } catch (error) {
      console.error('Failed to create scene:', error);
      throw error;
    }
  }

  async updateSceneStatus(
    sceneId: string,
    status: EmergencyScene['status'],
    notes?: string
  ): Promise<void> {
    try {
      const batch = firestore().batch();
      const sceneRef = firestore().collection(this.scenesCollection).doc(sceneId);

      batch.update(sceneRef, { status });

      if (notes) {
        const noteData: SceneNote = {
          id: Date.now().toString(),
          content: notes,
          author: 'SYSTEM',
          timestamp: Date.now(),
          type: 'GENERAL',
          priority: 'MEDIUM'
        };

        batch.update(sceneRef, {
          notes: firestore.FieldValue.arrayUnion(noteData)
        });
      }

      const timelineEvent = {
        id: Date.now().toString(),
        type: 'STATUS_CHANGE',
        description: `Scene status updated to ${status}`,
        timestamp: Date.now(),
        author: 'SYSTEM',
        severity: 'INFO'
      };

      batch.update(sceneRef, {
        timeline: firestore.FieldValue.arrayUnion(timelineEvent)
      });

      await batch.commit();
    } catch (error) {
      console.error('Failed to update scene status:', error);
      throw error;
    }
  }

  async addHazard(sceneId: string, hazard: Omit<SceneHazard, 'id'>): Promise<string> {
    try {
      const hazardData: SceneHazard = {
        ...hazard,
        id: Date.now().toString()
      };

      const batch = firestore().batch();
      const sceneRef = firestore().collection(this.scenesCollection).doc(sceneId);

      batch.update(sceneRef, {
        hazards: firestore.FieldValue.arrayUnion(hazardData)
      });

      const timelineEvent = {
        id: Date.now().toString(),
        type: 'HAZARD_REPORTED',
        description: `New hazard reported: ${hazard.description}`,
        timestamp: Date.now(),
        author: hazard.reportedBy,
        severity: 'WARNING'
      };

      batch.update(sceneRef, {
        timeline: firestore.FieldValue.arrayUnion(timelineEvent)
      });

      await batch.commit();
      
      // Notify relevant personnel about the hazard
      await notificationService.sendHazardAlert(sceneId, hazardData);

      return hazardData.id;
    } catch (error) {
      console.error('Failed to add hazard:', error);
      throw error;
    }
  }

  async updateVictimStatus(
    sceneId: string,
    victimId: string,
    updates: Partial<SceneVictim>
  ): Promise<void> {
    try {
      const sceneRef = firestore().collection(this.scenesCollection).doc(sceneId);
      const scene = (await sceneRef.get()).data() as EmergencyScene;

      const victimIndex = scene.victims.findIndex(v => v.id === victimId);
      if (victimIndex === -1) throw new Error('Victim not found');

      const updatedVictim = {
        ...scene.victims[victimIndex],
        ...updates
      };

      const updatedVictims = [...scene.victims];
      updatedVictims[victimIndex] = updatedVictim;

      const timelineEvent = {
        id: Date.now().toString(),
        type: 'VICTIM_UPDATE',
        description: `Victim ${victimId} status updated`,
        timestamp: Date.now(),
        author: 'SYSTEM',
        severity: 'INFO'
      };

      await sceneRef.update({
        victims: updatedVictims,
        timeline: firestore.FieldValue.arrayUnion(timelineEvent)
      });
    } catch (error) {
      console.error('Failed to update victim status:', error);
      throw error;
    }
  }
}

export const sceneManagementService = SceneManagementService.getInstance();
