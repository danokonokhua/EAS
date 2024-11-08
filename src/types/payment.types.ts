export interface PaymentMethodData {
  supportedMethods: string[];
  data: {
    merchantIdentifier?: string;
    supportedNetworks: string[];
    countryCode?: string;
    currencyCode: string;
    environment?: 'TEST' | 'PRODUCTION';
    paymentMethodTokenizationParameters?: {
      tokenizationType: string;
      parameters: {
        publicKey: string;
      };
    };
  };
}

export interface PaymentDetails {
  id: string;
  patientId: string;
  emergencyId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  type: 'INSURANCE' | 'DIRECT' | 'SPLIT';
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  primaryInsured: {
    name: string;
    relationship: string;
    dateOfBirth: string;
  };
  coverageDetails: {
    emergencyServices: boolean;
    ambulanceService: boolean;
    copay?: number;
    deductible?: number;
  };
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
}

export interface SplitPaymentDetails {
  parts: Array<{
    type: 'INSURANCE' | 'PATIENT' | 'OTHER';
    amount: number;
    status: PaymentDetails['status'];
    reference?: string;
  }>;
}

export interface PaymentOptions {
  requestPayerName?: boolean;
  requestPayerPhone?: boolean;
  requestPayerEmail?: boolean;
  requestShipping?: boolean;
}

export interface PaymentResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
  details?: any;
}
