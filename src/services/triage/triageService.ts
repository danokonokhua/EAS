import firestore from '@react-native-firebase/firestore';
import { TriageAssessment, TriageRule } from '../../types/triage.types';
import { hospitalService } from '../hospital/hospitalService';
import { medicalRecordService } from '../medical/medicalRecordService';

class TriageService {
  private static instance: TriageService;
  private readonly assessmentCollection = 'triageAssessments';
  private readonly rulesCollection = 'triageRules';

  private constructor() {}

  static getInstance(): TriageService {
    if (!TriageService.instance) {
      TriageService.instance = new TriageService();
    }
    return TriageService.instance;
  }

  async createAssessment(assessment: Omit<TriageAssessment, 'id'>): Promise<string> {
    try {
      const priority = await this.calculatePriority(assessment);
      const estimatedResponseTime = await this.calculateResponseTime(priority);

      const docRef = await firestore()
        .collection(this.assessmentCollection)
        .add({
          ...assessment,
          priority,
          estimatedResponseTime,
          timestamp: Date.now(),
          status: 'PENDING',
        });

      // Notify nearest available hospitals
      await this.notifyHospitals(docRef.id, assessment);

      return docRef.id;
    } catch (error) {
      console.error('Failed to create triage assessment:', error);
      throw error;
    }
  }

  private async calculatePriority(assessment: Omit<TriageAssessment, 'id'>): Promise<number> {
    try {
      const rules = await this.getTriageRules();
      let maxPriority = 0;

      // Apply triage rules to determine priority
      rules.forEach(rule => {
        if (this.evaluateRule(rule, assessment)) {
          maxPriority = Math.max(maxPriority, rule.priority);
        }
      });

      return maxPriority;
    } catch (error) {
      console.error('Failed to calculate priority:', error);
      throw error;
    }
  }

  private async calculateResponseTime(priority: number): Promise<number> {
    // Calculate estimated response time based on priority and available resources
    const baseTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    return baseTime / priority;
  }

  private async notifyHospitals(assessmentId: string, assessment: Omit<TriageAssessment, 'id'>): Promise<void> {
    try {
      const nearbyHospitals = await hospitalService.findNearbyHospitals(
        assessment.location.latitude,
        assessment.location.longitude,
        10 // 10km radius
      );

      // Notify hospitals in parallel
      await Promise.all(
        nearbyHospitals.map(hospital =>
          hospitalService.notifyEmergency(hospital.id, {
            assessmentId,
            patientId: assessment.patientId,
            severity: assessment.severity,
            location: assessment.location,
          })
        )
      );
    } catch (error) {
      console.error('Failed to notify hospitals:', error);
      throw error;
    }
  }

  private evaluateRule(rule: TriageRule, assessment: Omit<TriageAssessment, 'id'>): boolean {
    // Implement rule evaluation logic here
    // This is a simplified example
    return assessment.severity === rule.severity;
  }

  async getAssessment(assessmentId: string): Promise<TriageAssessment | null> {
    try {
      const doc = await firestore()
        .collection(this.assessmentCollection)
        .doc(assessmentId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as TriageAssessment;
    } catch (error) {
      console.error('Failed to get triage assessment:', error);
      throw error;
    }
  }

  async updateAssessmentStatus(
    assessmentId: string,
    status: TriageAssessment['status']
  ): Promise<void> {
    try {
      await firestore()
        .collection(this.assessmentCollection)
        .doc(assessmentId)
        .update({
          status,
          lastUpdated: Date.now(),
        });
    } catch (error) {
      console.error('Failed to update assessment status:', error);
      throw error;
    }
  }

  private async getTriageRules(): Promise<TriageRule[]> {
    try {
      const snapshot = await firestore()
        .collection(this.rulesCollection)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TriageRule[];
    } catch (error) {
      console.error('Failed to get triage rules:', error);
      throw error;
    }
  }
}

export const triageService = TriageService.getInstance();
