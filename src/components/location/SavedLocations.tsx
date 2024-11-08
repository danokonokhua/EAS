import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, Icon, Modal } from '@ui-kitten/components';
import { SavedLocation } from '../../types/location.types';
import { enhancedLocationService } from '../../services/location/enhancedLocationService';

interface SavedLocationsProps {
  userId: string;
  onLocationSelect: (location: SavedLocation) => void;
}

export const SavedLocations: React.FC<SavedLocationsProps> = ({
  userId,
  onLocationSelect,
}) => {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    try {
      const userLocations = await enhancedLocationService.getUserSavedLocations(userId);
      setLocations(userLocations);
    } catch (error) {
      console.error('Failed to load saved locations:', error);
    }
  };

  const handleAddLocation = async (locationData: Partial<SavedLocation>) => {
    try {
      await enhancedLocationService.saveFavoriteLocation({
        userId,
        ...locationData as Omit<SavedLocation, 'id' | 'metadata'>
      });
      setShowAddForm(false);
      await loadSavedLocations();
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  const renderLocationItem = ({ item }: { item: SavedLocation }) => (
    <Card
      style={styles.locationCard}
      onPress={() => setSelectedLocation(item)}
    >
      <View style={styles.locationHeader}>
        <Icon
          name={getLocationIcon(item.type)}
          style={styles.icon}
          fill="#8F9BB3"
        />
        <Text category="h6">{item.name}</Text>
      </View>
      <Text category="s1">{item.location.address}</Text>
      {item.accessDetails.specialInstructions && (
        <Text category="p2" style={styles.instructions}>
          {item.accessDetails.specialInstructions}
        </Text>
      )}
    </Card>
  );

  const getLocationIcon = (type: SavedLocation['type']) => {
    switch (type) {
      case 'HOME':
        return 'home-outline';
      case 'WORK':
        return 'briefcase-outline';
      default:
        return 'pin-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Button
        appearance="ghost"
        status="primary"
        accessoryLeft={props => <Icon {...props} name="plus-outline" />}
        onPress={() => setShowAddForm(true)}
      >
        Add New Location
      </Button>

      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <Modal
        visible={showAddForm}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowAddForm(false)}
      >
        <LocationForm
          onSubmit={handleAddLocation}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      <Modal
        visible={!!selectedLocation}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setSelectedLocation(null)}
      >
        {selectedLocation && (
          <LocationDetails
            location={selectedLocation}
            onSelect={() => {
              onLocationSelect(selectedLocation);
              setSelectedLocation(null);
            }}
            onClose={() => setSelectedLocation(null)}
          />
        )}
      </Modal>
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
  locationCard: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  instructions: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
