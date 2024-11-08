export type CommunicationType = 'AUDIO' | 'VIDEO' | 'TEXT' | 'PTT';

export interface CommunicationChannel {
  id: string;
  type: CommunicationType;
  emergencyId: string;
  participants: string[];
  status: 'ACTIVE' | 'CLOSED';
  createdAt: number;
  closedAt?: number;
  metadata: {
    quality?: 'LOW' | 'MEDIUM' | 'HIGH';
    encryption: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  type: CommunicationType;
  content: string;
  timestamp: number;
  status: 'SENT' | 'DELIVERED' | 'READ';
  priority: 'NORMAL' | 'URGENT';
  attachments?: {
    type: string;
    url: string;
    size: number;
    duration?: number;
  }[];
}

export interface PTTSession {
  id: string;
  channelId: string;
  speaker: string;
  startTime: number;
  endTime?: number;
  status: 'SPEAKING' | 'IDLE';
  quality: 'LOW' | 'MEDIUM' | 'HIGH';
}
