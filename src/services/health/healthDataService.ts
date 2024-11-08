import AppleHealthKit, { HealthInputOptions, HealthValue } from 'react-native-health';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { HealthData, WearableDevice } from '../../types/health.types';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

class HealthDataService {
  private static instance: HealthDataService;
  private readonly healthCollection = 'healthData';
  private readonly devicesCollection = 'wearableDevices';

  private constructor() {
    this.initializeHealthKit();
  }

  static getInstance(): HealthDataService {
    if (!HealthDataService.instance) {
      HealthDataService.instance = new HealthDataService();
    }
    return HealthDataService.instance;
  }

  private async initializeHealthKit(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const permissions = {
          permissions: {
            read: [
              AppleHealthKit.Constants.Permissions.HeartRate,
              AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
              AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
              AppleHealthKit.Constants.Permissions.BloodGlucose,
              AppleHealthKit.Constants.Permissions.OxygenSaturation,
              AppleHealthKit.Constants.Permissions.Steps,
            ],
            write: [],
          },
        };
        await AppleHealthKit.initHealthKit(permissions);
      } else {
        const options = {
          scopes: [
            Scopes.FITNESS_ACTIVITY_READ,
            Scopes.FITNESS_BODY_READ,
            Scopes.FITNESS_BLOOD_PRESSURE_READ,
            Scopes.FITNESS_BLOOD_GLUCOSE_READ,
            Scopes.FITNESS_HEART_RATE_READ,
          ],
        };
        await GoogleFit.authorize(options);
      }
    } catch (error) {
      console.error('Failed to initialize health kit:', error);
      throw error;
    }
  }

  async syncHealthData(userId: string): Promise<void> {
    try {
      const healthData = await this.fetchHealthData();
      await this.saveHealthData(userId, healthData);
    } catch (error) {
      console.error('Failed to sync health data:', error);
      throw error;
    }
  }

  private async fetchHealthData(): Promise<Partial<HealthData['metrics']>> {
    if (Platform.OS === 'ios') {
      return this.fetchAppleHealthData();
    } else {
      return this.fetchGoogleFitData();
    }
  }

  private async fetchAppleHealthData(): Promise<Partial<HealthData['metrics']>> {
    const options = {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    };

    const [
      heartRate,
      bloodPressure,
      bloodGlucose,
      oxygenSaturation,
    ] = await Promise.all([
      this.getAppleHealthMetric('heartRate', options),
      this.getAppleHealthMetric('bloodPressure', options),
      this.getAppleHealthMetric('bloodGlucose', options),
      this.getAppleHealthMetric('oxygenSaturation', options),
    ]);

    return {
      heartRate,
      bloodPressure,
      bloodGlucose,
      oxygenSaturation,
    };
  }

  private async getAppleHealthMetric(
    metric: string,
    options: HealthInputOptions
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      AppleHealthKit[`get${metric.charAt(0).toUpperCase() + metric.slice(1)}`](
        options,
        (err: string, results: HealthValue[]) => {
          if (err) {
            reject(err);
          }
          resolve(results);
        }
      );
    });
  }

  private async fetchGoogleFitData(): Promise<Partial<HealthData['metrics']>> {
    // TODO: Implement Google Fit data fetching
    return {};
  }

  async saveHealthData(
    userId: string,
    metrics: Partial<HealthData['metrics']>
  ): Promise<string> {
    try {
      const docRef = firestore().collection(this.healthCollection).doc();
      const healthData: HealthData = {
        id: docRef.id,
        userId,
        timestamp: Date.now(),
        source: Platform.OS === 'ios' ? 'APPLE_HEALTH' : 'GOOGLE_FIT',
        metrics,
      };

      await docRef.set(healthData);
      return docRef.id;
    } catch (error) {
      console.error('Failed to save health data:', error);
      throw error;
    }
  }

  async getLatestHealthData(userId: string): Promise<HealthData | null> {
    try {
      const snapshot = await firestore()
        .collection(this.healthCollection)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as HealthData;
    } catch (error) {
      console.error('Failed to get latest health data:', error);
      throw error;
    }
  }
}

export const healthDataService = HealthDataService.getInstance();
