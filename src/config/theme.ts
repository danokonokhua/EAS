import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Extend the MD3Colors type to include our custom colors
declare global {
  export interface MD3Colors {
    success: string;
    warning: string;
    error: string;
    info: string;
    ambulanceAvailable: string;
    ambulanceBusy: string;
    ambulanceMaintenance: string;
  }
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Add medical-specific colors
    success: '#4CAF50', // Green for normal readings
    warning: '#FFA500', // Orange for borderline readings
    error: '#FF0000',   // Red for critical readings
    info: '#2196F3',    // Blue for informational states
    ambulanceAvailable: '#4CAF50',  // Green
    ambulanceBusy: '#F44336',       // Red
    ambulanceMaintenance: '#FFC107', // Yellow
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    success: '#81C784', // Lighter green for dark theme
    warning: '#FFB74D', // Lighter orange for dark theme
    error: '#FF5252',   // Lighter red for dark theme
    info: '#64B5F6',    // Lighter blue for dark theme
  },
};

export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme();

export default theme;
