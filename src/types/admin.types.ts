export interface AdminSettings {
  id: string;
  organizationId: string;
  settings: {
    certificationRequirements: CertificationRequirement[];
    insuranceRequirements: InsuranceRequirement[];
    trainingModules: string[];
    subscriptionPlans: SubscriptionPlan[];
    paymentGateways: PaymentGateway[];
    auditSettings: AuditSettings;
  };
}

export interface CertificationRequirement {
  id: string;
  name: string;
  type: 'MEDICAL' | 'SAFETY' | 'EQUIPMENT' | 'SPECIALIZED';
  validityPeriod: number; // in months
  renewalRequired: boolean;
  verificationProcess: {
    steps: string[];
    requiredDocuments: string[];
    approvalWorkflow: string[];
  };
}

export interface InsuranceRequirement {
  id: string;
  type: 'LIABILITY' | 'MEDICAL' | 'EQUIPMENT';
  minimumCoverage: number;
  provider?: string;
  validityPeriod: number;
  documents: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  limits: {
    users: number;
    storage: number;
    api: number;
  };
  enterprise: boolean;
}

export interface PaymentGateway {
  id: string;
  provider: string;
  enabled: boolean;
  config: {
    apiKey: string;
    secretKey: string;
    webhookUrl: string;
    supportedMethods: string[];
  };
}

export interface AuditSettings {
  enabled: boolean;
  retentionPeriod: number;
  events: string[];
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    pci: boolean;
  };
}
