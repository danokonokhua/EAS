import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import theme from '../../config/theme';

interface Ambulance {
  id: string;
  vehicleNumber: string;
  status: 'available' | 'busy' | 'maintenance';
  location?: string;
}

interface AmbulanceListProps {
  ambulances: any[];
  onAmbulanceAssign: (ambulanceId: string, requestId: string) => Promise<void>;
}

export const AmbulanceList: React.FC<AmbulanceListProps> = ({
  ambulances,
  onAmbulanceAssign,
}) => {
  const { colors } = useTheme();

  const getStatusColor = (status: Ambulance['status']) => {
    switch (status) {
      case 'available':
        return colors.ambulanceAvailable;
      case 'busy':
        return colors.ambulanceBusy;
      case 'maintenance':
        return colors.ambulanceMaintenance;
      default:
        return colors.disabled;
    }
  };

  const renderItem = ({ item }: { item: Ambulance }) => (
    <Card
      style={styles.card}
      onPress={() => onAmbulanceAssign(item.id, 'requestId')}
    >
      <Card.Content>
        <Text variant="titleMedium">{item.vehicleNumber}</Text>
        <Text
          variant="bodyMedium"
          style={{ color: getStatusColor(item.status) }}
        >
          {item.status.toUpperCase()}
        </Text>
        {item.location && (
          <Text variant="bodySmall" style={styles.location}>
            {item.location}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ambulances}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
  location: {
    marginTop: 4,
    opacity: 0.7,
  },
});

export type { AmbulanceListProps };
