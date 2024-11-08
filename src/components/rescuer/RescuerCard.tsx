import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon } from '@ui-kitten/components';
import { RescuerProfile, RescuerLevel } from '../../types/rescuer.types';

interface RescuerCardProps {
  rescuer: RescuerProfile;
  distance: number;
  onAccept: () => void;
  onViewProfile: () => void;
}

export const RescuerCard: React.FC<RescuerCardProps> = ({
  rescuer,
  distance,
  onAccept,
  onViewProfile,
}) => {
  const getLevelIcon = (level: RescuerLevel) => {
    switch (level) {
      case RescuerLevel.ADVANCED:
        return 'star';
      case RescuerLevel.EMT:
        return 'plus-circle';
      default:
        return 'heart';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Icon
            name={getLevelIcon(rescuer.level)}
            style={styles.icon}
            fill="#0095ff"
          />
          <Text category="s1">{rescuer.level}</Text>
        </View>
        <Text category="s2">{(distance / 1000).toFixed(1)}km away</Text>
      </View>

      <View style={styles.content}>
        <Text category="h6">{rescuer.name}</Text>
        <Text category="s2" appearance="hint">
          {rescuer.specialties.join(' • ')}
        </Text>
        
        {rescuer.equipment.length > 0 && (
          <View style={styles.equipment}>
            <Text category="s2">Available Equipment:</Text>
            {rescuer.equipment
              .filter(e => e.status === 'AVAILABLE')
              .map(e => (
                <Text key={e.id} category="c1">
                  • {e.name}
                </Text>
              ))}
          </View>
        )}

        <View style={styles.stats}>
          <Text category="c1">
            Success Rate: {(rescuer.successfulResponses / rescuer.totalResponses * 100).toFixed(0)}%
          </Text>
          <Text category="c1">Rating: {rescuer.rating.toFixed(1)}/5</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          size="small"
          status="basic"
          appearance="ghost"
          onPress={onViewProfile}
        >
          View Profile
        </Button>
        <Button size="small" status="primary" onPress={onAccept}>
          Accept Help
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  content: {
    marginVertical: 8,
  },
  equipment: {
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
