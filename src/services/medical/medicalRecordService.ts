import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { MedicalRecord } from '../../types/medical.types';
import { encryptData, decryptData } from '../../utils/encryption';

class MedicalRecordService {
  private static instance: MedicalRecordService;
  private readonly collection = 'medicalRecords';

  private constructor() {}

  static getInstance(): MedicalRecordService {
    if (!MedicalRecordService.instance) {
      MedicalRecordService.instance = new MedicalRecordService();
    }
    return MedicalRecordService.instance;
  }

  async createMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<string> {
    try {
      // Encrypt sensitive data before storing
      const encryptedRecord = this.encryptSensitiveData(record);
      
      const docRef = await firestore()
        .collection(this.collection)
        .add({
          ...encryptedRecord,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create medical record:', error);
      throw error;
    }
  }

  async getMedicalRecord(patientId: string): Promise<MedicalRecord | null> {
    try {
      const record = await firestore()
        .collection(this.collection)
        .where('patientId', '==', patientId)
        .get();

      if (record.empty) {
        return null;
      }

      const data = record.docs[0].data();
      // Decrypt sensitive data before returning
      return {
        id: record.docs[0].id,
        ...this.decryptSensitiveData(data),
      } as MedicalRecord;
    } catch (error) {
      console.error('Failed to get medical record:', error);
      throw error;
    }
  }

  async updateMedicalRecord(
    recordId: string, 
    updates: Partial<MedicalRecord>
  ): Promise<void> {
    try {
      const encryptedUpdates = this.encryptSensitiveData(updates);
      
      await firestore()
        .collection(this.collection)
        .doc(recordId)
        .update({
          ...encryptedUpdates,
          lastUpdated: Date.now(),
        });
    } catch (error) {
      console.error('Failed to update medical record:', error);
      throw error;
    }
  }

  async attachDocument(
    recordId: string,
    file: { uri: string; type: string; name: string }
  ): Promise<string> {
    try {
      const reference = storage().ref(
        `medical_records/${recordId}/${file.name}`
      );
      
      await reference.putFile(file.uri);
      const url = await reference.getDownloadURL();

      await this.updateMedicalRecord(recordId, {
        documents: firestore.FieldValue.arrayUnion({
          name: file.name,
          type: file.type,
          url,
          uploadedAt: Date.now(),
        }),
      });

      return url;
    } catch (error) {
      console.error('Failed to attach document:', error);
      throw error;
    }
  }

  private encryptSensitiveData(data: any): any {
    // Implement encryption for sensitive fields
    const sensitiveFields = [
      'personalInfo',
      'medicalConditions',
      'medications',
      'insuranceInfo',
    ];

    const encrypted = { ...data };
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = encryptData(JSON.stringify(encrypted[field]));
      }
    });

    return encrypted;
  }

  private decryptSensitiveData(data: any): any {
    // Implement decryption for sensitive fields
    const sensitiveFields = [
      'personalInfo',
      'medicalConditions',
      'medications',
      'insuranceInfo',
    ];

    const decrypted = { ...data };
    sensitiveFields.forEach(field => {
      if (decrypted[field]) {
        decrypted[field] = JSON.parse(decryptData(decrypted[field]));
      }
    });

    return decrypted;
  }
}

export const medicalRecordService = MedicalRecordService.getInstance();
