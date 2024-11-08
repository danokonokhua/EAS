import type { MD3Colors } from 'react-native-paper/lib/typescript/types';

declare global {
  namespace ReactNativePaper {
    interface MD3Colors extends MD3Colors {
      ambulanceAvailable: string;
      ambulanceBusy: string;
      ambulanceMaintenance: string;
    }
  }
}
