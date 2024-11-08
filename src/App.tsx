import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import theme, { darkTheme } from './config/theme';

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={colorScheme === 'dark' ? darkTheme : theme} children={''}>
      {/* Your app content */}
    </PaperProvider>
  );
}
