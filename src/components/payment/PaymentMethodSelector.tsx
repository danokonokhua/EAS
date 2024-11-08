import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { usePayment } from '../../hooks/usePayment';
import { PaymentMethod } from '../../types/payment';

export const PaymentMethodSelector: React.FC = () => {
  const { selectedMethod, setPaymentMethod } = usePayment();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paystack',
      name: 'Paystack',
      image: require('../../assets/images/paystack.png'),
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      image: require('../../assets/images/flutterwave.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod?.id === method.id && styles.selectedCard,
          ]}
          onPress={() => setPaymentMethod(method)}
        >
          <Image source={method.image} style={styles.methodImage} />
          <Text style={styles.methodName}>{method.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  methodImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
  },
});
