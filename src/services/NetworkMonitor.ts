import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkMonitorListener {
  onNetworkStateChange: (state: NetInfoState) => void;
}

export class NetworkMonitor {
  private listeners: NetworkMonitorListener[] = [];
  private unsubscribe: (() => void) | null = null;

  start() {
    if (!this.unsubscribe) {
      this.unsubscribe = NetInfo.addEventListener((state) => {
        this.notifyListeners(state);
      });
    }
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  addListener(listener: NetworkMonitorListener) {
    this.listeners.push(listener);
    // Start monitoring if this is the first listener
    if (this.listeners.length === 1) {
      this.start();
    }
  }

  removeListener(listener: NetworkMonitorListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
    // Stop monitoring if no listeners remain
    if (this.listeners.length === 0) {
      this.stop();
    }
  }

  private notifyListeners(state: NetInfoState) {
    this.listeners.forEach(listener => {
      listener.onNetworkStateChange(state);
    });
  }

  async getCurrentState(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }
}
