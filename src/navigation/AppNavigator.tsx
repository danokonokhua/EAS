import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { EmergencyHomeScreen } from '../screens/emergency/EmergencyHomeScreen';
import { EmergencyTrackingScreen } from '../screens/emergency/EmergencyTrackingScreen';
import { RideHistoryScreen } from '../screens/history/RideHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EmergencyPaymentScreen } from '../screens/payment/EmergencyPaymentScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EmergencyHome">
        <Stack.Screen 
          name="EmergencyHome" 
          component={EmergencyHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmergencyTracking" 
          component={EmergencyTrackingScreen}
          options={{ title: 'Emergency Status' }}
        />
        <Stack.Screen 
          name="RideHistory" 
          component={RideHistoryScreen}
          options={{ title: 'Emergency History' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen 
          name="EmergencyPayment" 
          component={EmergencyPaymentScreen}
          options={{ title: 'Payment' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
