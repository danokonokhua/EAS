import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

export const NetworkInspector: React.FC = () => {
  const [netInfo, setNetInfo] = React.useState<NetInfoState | null>(null);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetInfo(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!netInfo) {
    return null;
  }

  const getConnectionDetails = () => {
    if (!netInfo.isConnected) {
      return 'Disconnected';
    }

    let details = `Type: ${netInfo.type}`;

    // Add connection-specific details based on type
    if (netInfo.type === NetInfoStateType.wifi && 'strength' in netInfo.details) {
      details += `\nStrength: ${netInfo.details.strength}%`;
      details += netInfo.details.ssid ? `\nSSID: ${netInfo.details.ssid}` : '';
    } else if (netInfo.type === NetInfoStateType.cellular && 'cellularGeneration' in netInfo.details) {
      details += `\nGeneration: ${netInfo.details.cellularGeneration}`;
      details += netInfo.details.carrier ? `\nCarrier: ${netInfo.details.carrier}` : '';
    }

    return details;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Status</Text>
      <Text style={styles.details}>
        Connected: {netInfo.isConnected ? 'Yes' : 'No'}
      </Text>
      <Text style={styles.details}>
        Internet Reachable: {netInfo.isInternetReachable ? 'Yes' : 'No'}
      </Text>
      <Text style={styles.details}>{getConnectionDetails()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    marginBottom: 4,
  },
});
