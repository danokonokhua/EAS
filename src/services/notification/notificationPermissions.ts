import { Platform, PermissionsAndroid } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs notification permission to send you updates',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // Permissions are granted by default for Android < 13
    }
    return true; // iOS permissions are handled by PushNotification.configure()
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}
