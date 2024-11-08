import firestore from '@react-native-firebase/firestore';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { CommunicationChannel, Message, PTTSession } from '../../types/communication.types';
import { notificationService } from '../notification/notificationService';

class CommunicationService {
  private static instance: CommunicationService;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private readonly channelsCollection = 'communicationChannels';
  private readonly messagesCollection = 'messages';
  private readonly pttSessionsCollection = 'pttSessions';

  private constructor() {}

  static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  async createChannel(
    emergencyId: string,
    type: CommunicationChannel['type'],
    participants: string[]
  ): Promise<string> {
    try {
      const channel: CommunicationChannel = {
        id: firestore().collection(this.channelsCollection).doc().id,
        type,
        emergencyId,
        participants,
        status: 'ACTIVE',
        createdAt: Date.now(),
        metadata: {
          encryption: true,
          priority: 'HIGH',
          quality: 'HIGH'
        }
      };

      await firestore()
        .collection(this.channelsCollection)
        .doc(channel.id)
        .set(channel);

      // Notify participants
      await Promise.all(
        participants.map(participantId =>
          notificationService.sendChannelInvite(participantId, channel)
        )
      );

      return channel.id;
    } catch (error) {
      console.error('Failed to create communication channel:', error);
      throw error;
    }
  }

  async startPTTSession(channelId: string, speakerId: string): Promise<string> {
    try {
      // Check if there's an active session
      const activeSession = await this.getActivePTTSession(channelId);
      if (activeSession) {
        throw new Error('Another user is currently speaking');
      }

      const session: PTTSession = {
        id: firestore().collection(this.pttSessionsCollection).doc().id,
        channelId,
        speaker: speakerId,
        startTime: Date.now(),
        status: 'SPEAKING',
        quality: 'HIGH'
      };

      await firestore()
        .collection(this.pttSessionsCollection)
        .doc(session.id)
        .set(session);

      return session.id;
    } catch (error) {
      console.error('Failed to start PTT session:', error);
      throw error;
    }
  }

  async endPTTSession(sessionId: string): Promise<void> {
    try {
      await firestore()
        .collection(this.pttSessionsCollection)
        .doc(sessionId)
        .update({
          status: 'IDLE',
          endTime: Date.now()
        });
    } catch (error) {
      console.error('Failed to end PTT session:', error);
      throw error;
    }
  }

  async sendMessage(channelId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<string> {
    try {
      const messageData: Message = {
        ...message,
        id: firestore().collection(this.messagesCollection).doc().id,
        channelId,
        timestamp: Date.now(),
        status: 'SENT'
      };

      await firestore()
        .collection(this.messagesCollection)
        .doc(messageData.id)
        .set(messageData);

      // Notify channel participants
      const channel = await this.getChannel(channelId);
      await Promise.all(
        channel.participants
          .filter(p => p !== message.senderId)
          .map(participantId =>
            notificationService.sendMessageNotification(participantId, messageData)
          )
      );

      return messageData.id;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async initializeWebRTC(channelId: string, participantId: string): Promise<RTCPeerConnection> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      this.peerConnections.set(participantId, peerConnection);

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state changed: ${peerConnection.connectionState}`);
      };

      // Handle ICE candidate events
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          this.sendICECandidate(channelId, participantId, event.candidate);
        }
      };

      return peerConnection;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  private async sendICECandidate(channelId: string, participantId: string, candidate: RTCIceCandidate): Promise<void> {
    try {
      await firestore()
        .collection(this.channelsCollection)
        .doc(channelId)
        .collection('candidates')
        .add({
          participantId,
          candidate: JSON.stringify(candidate),
          timestamp: Date.now()
        });
    } catch (error) {
      console.error('Failed to send ICE candidate:', error);
      throw error;
    }
  }
}

export const communicationService = CommunicationService.getInstance();
