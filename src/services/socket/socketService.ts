import io, { Socket } from 'socket.io-client';
import { config } from '../../config';
import { store } from '../store';
import { updateDriverLocation, updateEmergencyStatus } from '../store/slices/emergencySlice';

class SocketService {
  emitLocation(update: LocationUpdate) {
    throw new Error('Method not implemented.');
  }
  subscribeToEmergencyRequests(arg0: (newRequest: any) => void) {
    throw new Error('Method not implemented.');
  }
  private socket: Socket | null = null;
  private emergencyId: string | null = null;

  initialize() {
    this.socket = io(config.SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      secure: true
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('driver_location', (data) => {
      store.dispatch(updateDriverLocation(data));
    });

    this.socket.on('emergency_status', (data) => {
      store.dispatch(updateEmergencyStatus(data));
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  joinEmergencyRoom(emergencyId: string) {
    if (!this.socket) return;
    this.emergencyId = emergencyId;
    this.socket.emit('join_emergency', { emergencyId });
  }

  leaveEmergencyRoom() {
    if (!this.socket || !this.emergencyId) return;
    this.socket.emit('leave_emergency', { emergencyId: this.emergencyId });
    this.emergencyId = null;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
