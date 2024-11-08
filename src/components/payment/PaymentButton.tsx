import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { paymentService } from '../../services/payment/paymentService';

interface PaymentButtonProps {
  amount: number;
  description: string;
  onSuccess: (response: any) => void;
  onError: (error: Error) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      await paymentService.initializePayment(amount, description);
      const response = await paymentService.processPayment();
      onSuccess(response);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePayment}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>Pay ${amount.toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
