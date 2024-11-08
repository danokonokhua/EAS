import firestore from '@react-native-firebase/firestore';
import { AdminSettings, CertificationRequirement, SubscriptionPlan } from '../../types/admin.types';
import { userService } from '../user/userService';
import { paymentService } from '../payment/paymentService';

class AdminService {
  private static instance: AdminService;
  private readonly adminCollection = 'adminSettings';
  private readonly auditCollection = 'auditLogs';

  private constructor() {}

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async verifyCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      const certification = await this.getCertification(certificationId);
      const userDocs = await this.getUserCertificationDocuments(userId, certificationId);
      
      // Verify documents
      const isValid = await this.validateCertificationDocuments(userDocs, certification);
      
      if (isValid) {
        await this.updateUserCertification(userId, certificationId, {
          verified: true,
          verifiedAt: Date.now(),
          expiresAt: Date.now() + (certification.validityPeriod * 30 * 24 * 60 * 60 * 1000)
        });
      }

      return isValid;
    } catch (error) {
      console.error('Failed to verify certification:', error);
      throw error;
    }
  }

  async manageSubscription(
    organizationId: string,
    planId: string,
    action: 'CREATE' | 'UPDATE' | 'CANCEL'
  ): Promise<void> {
    try {
      const plan = await this.getSubscriptionPlan(planId);
      
      switch (action) {
        case 'CREATE':
          await paymentService.createSubscription(organizationId, plan);
          break;
        case 'UPDATE':
          await paymentService.updateSubscription(organizationId, plan);
          break;
        case 'CANCEL':
          await paymentService.cancelSubscription(organizationId);
          break;
      }

      await this.updateOrganizationSubscription(organizationId, {
        planId,
        status: action === 'CANCEL' ? 'CANCELLED' : 'ACTIVE',
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to manage subscription:', error);
      throw error;
    }
  }

  async auditLog(event: {
    type: string;
    userId: string;
    action: string;
    details: any;
  }): Promise<void> {
    try {
      const settings = await this.getAuditSettings();
      
      if (settings.enabled && settings.events.includes(event.type)) {
        await firestore()
          .collection(this.auditCollection)
          .add({
            ...event,
            timestamp: Date.now(),
            ip: await this.getUserIP(),
            device: await this.getDeviceInfo()
          });
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  private async validateCertificationDocuments(
    documents: any[],
    certification: CertificationRequirement
  ): Promise<boolean> {
    // Implementation of document validation logic
    return true;
  }
}

export const adminService = AdminService.getInstance();
