import { PaystackWebView } from 'react-native-paystack-webview';
import { FlutterwaveInit } from 'flutterwave-react-native';
import { PAYMENT_CONFIG } from '../../config/paymentConfig';
import { apiService } from '../api/ApiService';

interface PaymentDetails {
  amount: number;
  email: string;
  reference: string;
  metadata: {
    emergencyId: string;
    userId: string;
  };
}

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initiatePaystackPayment(details: PaymentDetails) {
    try {
      const response = await PaystackWebView.startTransaction({
        key: PAYMENT_CONFIG.PAYSTACK_PUBLIC_KEY,
        amount: details.amount * 100, // Convert to kobo
        email: details.email,
        reference: details.reference,
        currency: 'NGN',
        metadata: details.metadata,
      });
      
      if (response.status === 'success') {
        await this.verifyPayment(response.reference, 'paystack');
      }
      return response;
    } catch (error) {
      console.error('Paystack payment failed:', error);
      throw error;
    }
  }

  async initiateFlutterwavePayment(details: PaymentDetails) {
    try {
      const response = await FlutterwaveInit({
        tx_ref: details.reference,
        authorization: PAYMENT_CONFIG.FLUTTERWAVE_PUBLIC_KEY,
        amount: details.amount,
        currency: 'NGN',
        payment_options: 'card,ussd,bank_transfer',
        meta: details.metadata,
        customer: {
          email: details.email,
        },
        customizations: {
          title: 'Emergency Ambulance Service',
          description: 'Payment for emergency service',
        },
      });
      
      if (response.status === 'successful') {
        await this.verifyPayment(response.transaction_id, 'flutterwave');
      }
      return response;
    } catch (error) {
      console.error('Flutterwave payment failed:', error);
      throw error;
    }
  }

  private async verifyPayment(reference: string, provider: 'paystack' | 'flutterwave') {
    try {
      const response = await apiService.post('/payments/verify', {
        reference,
        provider,
      });
      return response;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }
}

export const paymentService = PaymentService.getInstance();
