import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Input, Select, Text } from '@ui-kitten/components';
import { PaymentDetails } from '../../types/payment.types';
import { paymentService } from '../../services/payment/paymentService';
import { InsuranceForm } from './InsuranceForm';
import { DirectPaymentForm } from './DirectPaymentForm';
import { SplitPaymentForm } from './SplitPaymentForm';

interface PaymentProcessorProps {
  emergencyId: string;
  patientId: string;
  amount: number;
  onComplete: (paymentId: string) => void;
  onError: (error: Error) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  emergencyId,
  patientId,
  amount,
  onComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentDetails['type']>('DIRECT');
  const [paymentDetails, setPaymentDetails] = useState<Partial<PaymentDetails>>({
    emergencyId,
    patientId,
    amount,
    currency: 'USD',
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const paymentId = await paymentService.processPayment(
        emergencyId,
        paymentDetails as Omit<PaymentDetails, 'id' | 'status' | 'createdAt' | 'updatedAt'>
      );
      onComplete(paymentId);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentType) {
      case 'INSURANCE':
        return (
          <InsuranceForm
            onChange={(insurance) =>
              setPaymentDetails({
                ...paymentDetails,
                metadata: { insurance },
              })
            }
          />
        );
      case 'SPLIT':
        return (
          <SplitPaymentForm
            amount={amount}
            onChange={(split) =>
              setPaymentDetails({
                ...paymentDetails,
                metadata: { split },
              })
            }
          />
        );
      default:
        return (
          <DirectPaymentForm
            amount={amount}
            onChange={(details) =>
              setPaymentDetails({
                ...paymentDetails,
                ...details,
              })
            }
          />
        );
    }
  };

  return (
    <Card style={styles.container}>
      <Text category="h6">Payment Processing</Text>
      
      <Select
        label="Payment Type"
        value={paymentType}
        onSelect={(value) => setPaymentType(value as PaymentDetails['type'])}
        options={[
          { label: 'Direct Payment', value: 'DIRECT' },
          { label: 'Insurance', value: 'INSURANCE' },
          { label: 'Split Payment', value: 'SPLIT' },
        ]}
      />

      {renderPaymentForm()}

      <Button
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Submit Payment'}
      </Button>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
});
