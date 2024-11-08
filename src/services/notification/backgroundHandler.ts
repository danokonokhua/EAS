import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { notificationService } from './notificationService';

// Register background handler before app is loaded
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background:', remoteMessage);

  // Handle the background message here
  if (remoteMessage.data?.type === 'EMERGENCY_ALERT') {
    notificationService.showLocalNotification({
      title: remoteMessage.notification?.title || 'Emergency Alert',
      message: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
    });
  }

  return Promise.resolve();
});

// Register the background handler with React Native
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => 
  async (taskData) => {
    // Handle background task
    console.log('Background task executed:', taskData);
    return Promise.resolve();
  }
);
