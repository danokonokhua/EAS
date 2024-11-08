import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/theme';

interface Props {
  status: string;
}

export const EmergencyStatus: React.FC<Props> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: 'clock-outline',
          text: 'Finding nearest ambulance...',
          color: colors.warning
        };
      case 'ACCEPTED':
        return {
          icon: 'ambulance',
          text: 'Ambulance is on the way',
          color: colors.success
        };
      case 'ARRIVED':
        return {
          icon: 'map-marker-check',
          text: 'Ambulance has arrived',
          color: colors.success
        };
      case 'COMPLETED':
        return {
          icon: 'check-circle',
          text: 'Emergency completed',
          color: colors.success
        };
      default:
        return {
          icon: 'alert-circle',
          text: 'Unknown status',
          color: colors.textSecondary
        };
    }
  };

  const { icon, text, color } = getStatusInfo();

  return (
    <View style={styles.container}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  }
});
