import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, Icon } from '@ui-kitten/components';
import { EmergencyRequest } from '../../types/emergency.types';
import { emergencyService } from '../../services/emergency/emergencyService';
import { locationService } from '../../services/location/locationService';
import { MapView } from '../map/MapView';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { EmergencyContactList } from './EmergencyContactList';
import { MedicalInfoForm } from './MedicalInfoForm';

interface EmergencyRequestProps {
  userId: string;
  onRequestComplete: () => void;
}

export const EmergencyRequestComponent: React.FC<EmergencyRequestProps> = ({
  userId,
  onRequestComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [request, setRequest] = useState<Partial<EmergencyRequest>>({
    userId,
    type: 'EMERGENCY',
    priority: 'HIGH',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      const address = await locationService.reverseGeocode(location);
      
      setRequest(prev => ({
        ...prev,
        location: {
          pickup: {
            ...location,
            address,
          },
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleEmergencyRequest = async () => {
    try {
      setLoading(true);
      const requestId = await emergencyService.createEmergencyRequest(request);
      Alert.alert(
        'Emergency Request Created',
        'Help is on the way! You can track the ambulance in real-time.',
        [{ text: 'OK', onPress: onRequestComplete }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create emergency request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text category="h6">Confirm Your Location</Text>
            <MapView
              location={request.location?.pickup}
              onLocationChange={(location) =>
                setRequest(prev => ({
                  ...prev,
                  location: { pickup: location },
                }))
              }
            />
          </View>
        );
      case 2:
        return (
          <MedicalInfoForm
            value={request.patient}
            onChange={(patient) =>
              setRequest(prev => ({
                ...prev,
                patient,
              }))
            }
          />
        );
      case 3:
        return (
          <EmergencyContactList
            contacts={request.patient?.emergencyContacts || []}
            onContactsChange={(contacts) =>
              setRequest(prev => ({
                ...prev,
                patient: {
                  ...prev.patient!,
                  emergencyContacts: contacts,
                },
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card disabled style={styles.container}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          {renderStepContent()}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <Button
                appearance="ghost"
                status="basic"
                onPress={() => setCurrentStep(prev => prev - 1)}
              >
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onPress={() => setCurrentStep(prev => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button onPress={handleEmergencyRequest}>
                Confirm Emergency Request
              </Button>
            )}
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
