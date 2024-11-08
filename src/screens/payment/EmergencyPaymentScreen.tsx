import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { PaymentButton } from '../../components/payment/PaymentButton';
import { paymentService } from '../../services/payment/paymentService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Text } from '@ui-kitten/components';
import { EmergencyDetails } from '../../types/emergency.types';

interface EmergencyPaymentScreenProps {
  route: {
    params: {
      emergencyDetails: EmergencyDetails;
    };
  };
  navigation: any;
}

export const EmergencyPaymentScreen: React.FC<EmergencyPaymentScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { emergencyDetails } = route.params;
  const [loading, setLoading] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const key = await paymentService.getPublishableKey();
      setPublishableKey(key);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Update emergency status to paid
      // Navigate to confirmation screen
      navigation.replace('EmergencyComplete', { 
        emergencyId: emergencyDetails.id 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const handlePaymentError = (error: Error) => {
    Alert.alert('Payment Failed', error.message);
  };

  if (loading || !publishableKey) {
    return <LoadingSpinner />;
  }

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.ambulanceapp"
    >
      <View style={styles.container}>
        <Text category="h5" style={styles.title}>
          Emergency Service Payment
        </Text>
        <Text category="s1" style={styles.amount}>
          Amount: ${emergencyDetails.amount}
        </Text>
        <PaymentButton
          amount={emergencyDetails.amount}
          description="Emergency Ambulance Service"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  amount: {
    textAlign: 'center',
    marginBottom: 32,
  },
});
