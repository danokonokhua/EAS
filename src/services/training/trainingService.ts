import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { TrainingModule, EmergencyProcedure } from '../../types/training.types';
import { userService } from '../user/userService';

class TrainingService {
  private static instance: TrainingService;
  private readonly modulesCollection = 'trainingModules';
  private readonly proceduresCollection = 'emergencyProcedures';

  private constructor() {}

  static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  async getTrainingModules(category?: string): Promise<TrainingModule[]> {
    try {
      let query = firestore().collection(this.modulesCollection);
      
      if (category) {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TrainingModule[];
    } catch (error) {
      console.error('Failed to fetch training modules:', error);
      throw error;
    }
  }

  async trackProgress(userId: string, moduleId: string, contentId: string): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('progress')
        .doc(moduleId)
        .set({
          completedContent: firestore.FieldValue.arrayUnion(contentId),
          lastUpdated: Date.now()
        }, { merge: true });
    } catch (error) {
      console.error('Failed to track progress:', error);
      throw error;
    }
  }

  async getEmergencyProcedures(type?: string): Promise<EmergencyProcedure[]> {
    try {
      let query = firestore().collection(this.proceduresCollection);
      
      if (type) {
        query = query.where('type', '==', type);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyProcedure[];
    } catch (error) {
      console.error('Failed to fetch emergency procedures:', error);
      throw error;
    }
  }

  async downloadOfflineContent(moduleId: string): Promise<void> {
    try {
      const module = await this.getTrainingModule(moduleId);
      
      // Download all content files
      const downloadPromises = module.content.map(async content => {
        if (content.type === 'VIDEO' || content.type === 'ANIMATION') {
          const url = content.content.url;
          if (url) {
            const reference = storage().refFromURL(url);
            await reference.downloadFile(`${moduleId}/${content.id}`);
          }
        }
      });

      await Promise.all(downloadPromises);
    } catch (error) {
      console.error('Failed to download offline content:', error);
      throw error;
    }
  }
}

export const trainingService = TrainingService.getInstance();
