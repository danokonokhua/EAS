import firestore from '@react-native-firebase/firestore';
import { CommandPost, CommandHandoff, ResourceAllocation } from '../../types/command.types';
import { notificationService } from '../notification/notificationService';

class CommandService {
  private static instance: CommandService;
  private readonly commandCollection = 'commandPosts';

  private constructor() {}

  static getInstance(): CommandService {
    if (!CommandService.instance) {
      CommandService.instance = new CommandService();
    }
    return CommandService.instance;
  }

  async establishCommandPost(sceneId: string, commanderDetails: {
    id: string;
    name: string;
    role: string;
    location: {
      latitude: number;
      longitude: number;
    }
  }): Promise<string> {
    try {
      const commandPost: CommandPost = {
        id: firestore().collection(this.commandCollection).doc().id,
        sceneId,
        establishedAt: Date.now(),
        commander: commanderDetails,
        status: 'ACTIVE',
        resourceAllocations: [],
        handoffHistory: [],
        notes: []
      };

      await firestore()
        .collection(this.commandCollection)
        .doc(commandPost.id)
        .set(commandPost);

      await notificationService.notifyTeam({
        type: 'COMMAND_POST_ESTABLISHED',
        data: commandPost
      });

      return commandPost.id;
    } catch (error) {
      console.error('Failed to establish command post:', error);
      throw error;
    }
  }

  async handoffCommand(
    commandPostId: string, 
    newCommander: {
      id: string;
      name: string;
      role: string;
    },
    reason: string
  ): Promise<void> {
    try {
      const handoff: CommandHandoff = {
        timestamp: Date.now(),
        previousCommander: (await this.getCommandPost(commandPostId)).commander,
        newCommander,
        reason
      };

      await firestore()
        .collection(this.commandCollection)
        .doc(commandPostId)
        .update({
          commander: newCommander,
          handoffHistory: firestore.FieldValue.arrayUnion(handoff)
        });

      await notificationService.notifyTeam({
        type: 'COMMAND_HANDOFF',
        data: handoff
      });
    } catch (error) {
      console.error('Failed to handoff command:', error);
      throw error;
    }
  }

  async allocateResources(
    commandPostId: string,
    allocation: ResourceAllocation
  ): Promise<void> {
    try {
      await firestore()
        .collection(this.commandCollection)
        .doc(commandPostId)
        .update({
          resourceAllocations: firestore.FieldValue.arrayUnion(allocation)
        });

      await notificationService.notifyTeam({
        type: 'RESOURCE_ALLOCATED',
        data: allocation
      });
    } catch (error) {
      console.error('Failed to allocate resources:', error);
      throw error;
    }
  }
}

export const commandService = CommandService.getInstance();
