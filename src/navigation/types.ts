import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  // Add other routes as needed
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
