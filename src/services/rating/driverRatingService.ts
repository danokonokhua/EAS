import { firestore } from '../firebase/firebase';
import { Driver } from '../../types/driver.types';

interface Rating {
  driverId: string;
  userId: string;
  emergencyId: string;
  rating: number;
  comment?: string;
  createdAt: number;
}

class DriverRatingService {
  private static instance: DriverRatingService;

  private constructor() {}

  static getInstance(): DriverRatingService {
    if (!DriverRatingService.instance) {
      DriverRatingService.instance = new DriverRatingService();
    }
    return DriverRatingService.instance;
  }

  async rateDriver(rating: Rating): Promise<void> {
    try {
      await firestore.runTransaction(async (transaction) => {
        const driverRef = firestore.collection('drivers').doc(rating.driverId);
        const driverDoc = await transaction.get(driverRef);
        const driver = driverDoc.data() as Driver;

        const newRating = 
          (driver.rating * driver.totalTrips + rating.rating) / 
          (driver.totalTrips + 1);

        transaction.update(driverRef, {
          rating: newRating,
          totalTrips: driver.totalTrips + 1,
        });

        transaction.set(
          firestore.collection('ratings').doc(),
          {
            ...rating,
            createdAt: Date.now(),
          }
        );
      });
    } catch (error) {
      console.error('Failed to rate driver:', error);
      throw error;
    }
  }

  async getDriverRatings(driverId: string): Promise<Rating[]> {
    try {
      const ratingsSnapshot = await firestore
        .collection('ratings')
        .where('driverId', '==', driverId)
        .orderBy('createdAt', 'desc')
        .get();

      return ratingsSnapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      console.error('Failed to get driver ratings:', error);
      throw error;
    }
  }
}

export const driverRatingService = DriverRatingService.getInstance();
