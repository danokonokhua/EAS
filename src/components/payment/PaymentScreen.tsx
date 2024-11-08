import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from '@rneui/themed';
import { usePayment } from '../../hooks/usePayment';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaystackWebView } from 'react-native-paystack-webview';
import { useFlutterwave } from 'flutterwave-react-native';
import { useAuth } from '../../hooks/useAuth';

export const PaymentScreen: React.FC = () => {
  const { user } = useAuth();
  const { selectedMethod, amount, emergencyId, processPayment } = usePayment();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await processPayment({
        amount,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emergencyId,
      });

      if (response.status === 'success') {
        Alert.alert('Success', 'Payment processed successfully');
      } else {
        Alert.alert('Error', 'Payment failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title>Emergency Service Payment</Card.Title>
        <Card.Divider />
        <Text style={styles.amount}>Amount: ₦{amount.toFixed(2)}</Text>
        
        <PaymentMethodSelector />
        
        <Button
          title={isProcessing ? 'Processing...' : 'Pay Now'}
          onPress={handlePayment}
          disabled={isProcessing || !selectedMethod}
          loading={isProcessing}
          buttonStyle={styles.payButton}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  payButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
  },
});
