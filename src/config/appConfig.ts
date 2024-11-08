export const APP_CONFIG = {
  APP_NAME: 'AmGuard',
  VERSION: '1.0.0',
  
  // API Configuration
  API_BASE_URL: __DEV__ ? 'http://localhost:3000' : 'https://api.amguard.com',
  API_TIMEOUT: 30000,
  
  // Map Configuration
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
  DEFAULT_LOCATION: {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Emergency Settings
  EMERGENCY_TIMEOUT: 60000, // 1 minute
  MAX_AMBULANCE_SEARCH_RADIUS: 10000, // 10km
  
  // App Features
  FEATURES: {
    REAL_TIME_TRACKING: true,
    EMERGENCY_CONTACT: true,
    PAYMENT_INTEGRATION: true,
    VOICE_CALL: true,
    CHAT: true,
  }
};
