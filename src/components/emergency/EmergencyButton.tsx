import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useEmergencyService } from '../../hooks/useEmergencyService';

export const EmergencyButton: React.FC = () => {
  const { getCurrentLocation, isLoading, error } = useEmergencyService();

  const handleEmergency = async () => {
    const location = await getCurrentLocation();
    if (location) {
      // Handle the emergency with location data
      console.log('Emergency triggered at:', location);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleEmergency}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? 'Getting Location...' : 'Emergency'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#ff0000',
  },
});