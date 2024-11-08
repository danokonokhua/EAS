import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon, Modal } from '@ui-kitten/components';
import { EmergencyScene, SceneHazard, SceneVictim } from '../../types/scene.types';
import { sceneManagementService } from '../../services/scene/sceneManagementService';
import { HazardForm } from './HazardForm';
import { VictimCard } from './VictimCard';
import { ResourceList } from './ResourceList';
import { SceneMap } from './SceneMap';
import { TimelineView } from './TimelineView';

interface SceneManagementProps {
  sceneId: string;
  onSceneUpdate: (scene: EmergencyScene) => void;
}

export const SceneManagement: React.FC<SceneManagementProps> = ({
  sceneId,
  onSceneUpdate,
}) => {
  const [scene, setScene] = useState<EmergencyScene | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHazardForm, setShowHazardForm] = useState(false);

  useEffect(() => {
    loadScene();
    const unsubscribe = subscribeToSceneUpdates();
    return () => unsubscribe();
  }, []);

  const loadScene = async () => {
    try {
      setLoading(true);
      const sceneData = await sceneManagementService.getScene(sceneId);
      setScene(sceneData);
      onSceneUpdate(sceneData);
    } catch (error) {
      console.error('Failed to load scene:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSceneUpdates = () => {
    return sceneManagementService.subscribeToScene(sceneId, (updatedScene) => {
      setScene(updatedScene);
      onSceneUpdate(updatedScene);
    });
  };

  const handleStatusUpdate = async (status: EmergencyScene['status']) => {
    try {
      await sceneManagementService.updateSceneStatus(sceneId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddHazard = async (hazard: Omit<SceneHazard, 'id'>) => {
    try {
      await sceneManagementService.addHazard(sceneId, hazard);
      setShowHazardForm(false);
    } catch (error) {
      console.error('Failed to add hazard:', error);
    }
  };

  if (loading || !scene) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text category="h6">Scene Management</Text>
          <Button
            size="small"
            status={scene.status === 'ACTIVE' ? 'danger' : 'success'}
            onPress={() => handleStatusUpdate(scene.status === 'ACTIVE' ? 'CONTAINED' : 'ACTIVE')}
          >
            {scene.status}
          </Button>
        </View>
      </Card>

      <SceneMap
        scene={scene}
        style={styles.map}
      />

      <Card style={styles.section}>
        <Text category="h6">Hazards</Text>
        <Button
          size="small"
          onPress={() => setShowHazardForm(true)}
          style={styles.addButton}
        >
          Report Hazard
        </Button>
        {scene.hazards.map(hazard => (
          <HazardCard
            key={hazard.id}
            hazard={hazard}
            onUpdate={(updates) => handleHazardUpdate(hazard.id, updates)}
          />
        ))}
      </Card>

      <Card style={styles.section}>
        <Text category="h6">Victims</Text>
        {scene.victims.map(victim => (
          <VictimCard
            key={victim.id}
            victim={victim}
            onUpdate={(updates) => handleVictimUpdate(victim.id, updates)}
          />
        ))}
      </Card>

      <ResourceList
        resources={scene.resources}
        onResourceUpdate={handleResourceUpdate}
        style={styles.section}
      />

      <TimelineView
        events={scene.timeline}
        style={styles.section}
      />

      <Modal
        visible={showHazardForm}
        onBackdropPress={() => setShowHazardForm(false)}
      >
        <HazardForm onSubmit={handleAddHazard} onCancel={() => setShowHazardForm(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  map: {
    height: 200,
    margin: 16,
  },
  section: {
    margin: 16,
  },
  addButton: {
    marginVertical: 8,
  },
});
