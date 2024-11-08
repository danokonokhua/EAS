import { firestore, storage } from '../firebase/firebase';
import { Driver } from '../../types/driver.types';

interface VerificationDocument {
  type: 'license' | 'insurance' | 'certification';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

class DriverVerificationService {
  private static instance: DriverVerificationService;

  private constructor() {}

  static getInstance(): DriverVerificationService {
    if (!DriverVerificationService.instance) {
      DriverVerificationService.instance = new DriverVerificationService();
    }
    return DriverVerificationService.instance;
  }

  async uploadDocument(
    driverId: string,
    documentType: VerificationDocument['type'],
    file: File
  ): Promise<string> {
    try {
      const ref = storage.ref(`drivers/${driverId}/${documentType}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();

      await firestore
        .collection('drivers')
        .doc(driverId)
        .update({
          [`documents.${documentType}`]: {
            url,
            status: 'pending',
            uploadedAt: Date.now(),
          },
        });

      return url;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  async verifyDocument(
    driverId: string,
    documentType: VerificationDocument['type'],
    status: VerificationDocument['status'],
    comment?: string
  ): Promise<void> {
    try {
      await firestore
        .collection('drivers')
        .doc(driverId)
        .update({
          [`documents.${documentType}.status`]: status,
          [`documents.${documentType}.comment`]: comment,
          [`documents.${documentType}.verifiedAt`]: Date.now(),
        });

      // Check if all documents are verified
      const driver = await firestore
        .collection('drivers')
        .doc(driverId)
        .get();

      const documents = (driver.data() as Driver).documents;
      const allVerified = Object.values(documents).every(
        doc => doc.status === 'approved'
      );

      if (allVerified) {
        await firestore
          .collection('drivers')
          .doc(driverId)
          .update({
            isVerified: true,
            verifiedAt: Date.now(),
          });
      }
    } catch (error) {
      console.error('Failed to verify document:', error);
      throw error;
    }
  }
}

export const driverVerificationService = DriverVerificationService.getInstance();
