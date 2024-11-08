import { loggerService } from './loggerService';

interface StateSnapshot {
  id: number;
  timestamp: number;
  state: any;
  action?: string;
  metadata?: Record<string, any>;
}

class StateTimeTravel {
  private static instance: StateTimeTravel;
  private snapshots: StateSnapshot[] = [];
  private currentIndex: number = -1;
  private maxSnapshots: number = 50;
  private isRecording: boolean = false;
  private stateSubscribers: Set<(state: any) => void> = new Set();

  private constructor() {}

  static getInstance(): StateTimeTravel {
    if (!StateTimeTravel.instance) {
      StateTimeTravel.instance = new StateTimeTravel();
    }
    return StateTimeTravel.instance;
  }

  startRecording() {
    this.isRecording = true;
    loggerService.info('State Recording Started');
  }

  stopRecording() {
    this.isRecording = false;
    loggerService.info('State Recording Stopped');
  }

  captureState(state: any, action?: string, metadata?: Record<string, any>) {
    if (!this.isRecording) return;

    const snapshot: StateSnapshot = {
      id: this.snapshots.length,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
      action,
      metadata,
    };

    // Remove future states if we're not at the latest snapshot
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
    }

    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;

    // Maintain maximum number of snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
      this.currentIndex--;
    }

    loggerService.debug('State Captured', {
      action,
      snapshotId: snapshot.id,
      timestamp: snapshot.timestamp,
    });
  }

  travelTo(index: number) {
    if (index >= 0 && index < this.snapshots.length) {
      this.currentIndex = index;
      const snapshot = this.snapshots[index];
      this.notifySubscribers(snapshot.state);
      
      loggerService.info('Time Traveled to State', {
        snapshotId: snapshot.id,
        action: snapshot.action,
        timestamp: snapshot.timestamp,
      });
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.travelTo(this.currentIndex - 1);
    }
  }

  redo() {
    if (this.currentIndex < this.snapshots.length - 1) {
      this.travelTo(this.currentIndex + 1);
    }
  }

  subscribe(callback: (state: any) => void) {
    this.stateSubscribers.add(callback);
    return () => {
      this.stateSubscribers.delete(callback);
    };
  }

  private notifySubscribers(state: any) {
    this.stateSubscribers.forEach(callback => callback(state));
  }

  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  getCurrentSnapshot(): StateSnapshot | null {
    return this.snapshots[this.currentIndex] || null;
  }

  clear() {
    this.snapshots = [];
    this.currentIndex = -1;
  }
}

export const stateTimeTravel = StateTimeTravel.getInstance();
