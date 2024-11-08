import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon, List } from '@ui-kitten/components';
import { CommandPost, ResourceAllocation } from '../../types/command.types';
import { commandService } from '../../services/command/commandService';
import { ResourceAllocationForm } from './ResourceAllocationForm';
import { HandoffForm } from './HandoffForm';
import { CommandMap } from './CommandMap';

interface CommandPostProps {
  sceneId: string;
  onCommandUpdate: (command: CommandPost) => void;
}

export const CommandPostComponent: React.FC<CommandPostProps> = ({
  sceneId,
  onCommandUpdate,
}) => {
  const [commandPost, setCommandPost] = useState<CommandPost | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showHandoffForm, setShowHandoffForm] = useState(false);

  useEffect(() => {
    loadCommandPost();
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, []);

  const loadCommandPost = async () => {
    try {
      const post = await commandService.getCommandPost(sceneId);
      setCommandPost(post);
      onCommandUpdate(post);
    } catch (error) {
      console.error('Failed to load command post:', error);
    }
  };

  const handleResourceAllocation = async (allocation: ResourceAllocation) => {
    try {
      await commandService.allocateResources(commandPost!.id, allocation);
      setShowResourceForm(false);
    } catch (error) {
      console.error('Failed to allocate resource:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text category="h6">Command Post</Text>
          <Button
            size="small"
            status="info"
            onPress={() => setShowHandoffForm(true)}
          >
            Handoff Command
          </Button>
        </View>
        {commandPost && (
          <>
            <Text>Commander: {commandPost.commander.name}</Text>
            <Text>Role: {commandPost.commander.role}</Text>
            <Text>Status: {commandPost.status}</Text>
          </>
        )}
      </Card>

      <CommandMap
        commandPost={commandPost}
        resources={commandPost?.resourceAllocations || []}
        style={styles.map}
      />

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text category="h6">Resources</Text>
          <Button
            size="small"
            onPress={() => setShowResourceForm(true)}
          >
            Allocate Resource
          </Button>
        </View>
        <List
          data={commandPost?.resourceAllocations || []}
          renderItem={renderResourceItem}
        />
      </Card>

      <ResourceAllocationForm
        visible={showResourceForm}
        onSubmit={handleResourceAllocation}
        onCancel={() => setShowResourceForm(false)}
      />

      <HandoffForm
        visible={showHandoffForm}
        currentCommander={commandPost?.commander}
        onSubmit={handleHandoff}
        onCancel={() => setShowHandoffForm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  map: {
    height: 200,
    margin: 16,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
