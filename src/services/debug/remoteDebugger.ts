import { Platform, NativeModules } from 'react-native';
import WebSocket from 'react-native-websocket';
import { loggerService } from './loggerService';
import { performanceProfiler } from './performanceProfiler';
import { networkMocker } from './networkMocker';

interface RemoteDebugConfig {
  host: string;
  port: number;
  secure: boolean;
  reconnectInterval: number;
  maxRetries: number;
}

class RemoteDebugger {
  private static instance: RemoteDebugger;
  private ws: WebSocket | null = null;
  private retryCount: number = 0;
  private isConnected: boolean = false;
  private messageQueue: any[] = [];
  private debugListeners: Set<(data: any) => void> = new Set();

  private config: RemoteDebugConfig = {
    host: 'localhost',
    port: 8081,
    secure: false,
    reconnectInterval: 3000,
    maxRetries: 5
  };

  private constructor() {
    if (__DEV__) {
      this.setupEventListeners();
    }
  }

  static getInstance(): RemoteDebugger {
    if (!RemoteDebugger.instance) {
      RemoteDebugger.instance = new RemoteDebugger();
    }
    return RemoteDebugger.instance;
  }

  private setupEventListeners() {
    // Setup native event listeners for debug bridge
    if (Platform.OS === 'ios') {
      NativeModules.DebuggerBridge.enableDebugging();
    }
  }

  async connect(config?: Partial<RemoteDebugConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      const wsUrl = `${this.config.secure ? 'wss' : 'ws'}://${this.config.host}:${this.config.port}/debugger-proxy`;
      
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
      
      loggerService.info('Remote debugger connecting...', { host: this.config.host, port: this.config.port });
    } catch (error) {
      loggerService.error('Failed to connect remote debugger', error as Error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnected = true;
      this.retryCount = 0;
      this.flushMessageQueue();
      loggerService.info('Remote debugger connected');
      this.notifyListeners({ type: 'connection', status: 'connected' });
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      loggerService.warn('Remote debugger disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      loggerService.error('Remote debugger error', error as Error);
      this.handleReconnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        loggerService.error('Failed to parse debug message', error as Error);
      }
    };
  }

  private handleMessage(message: any) {
    try {
      switch (message.type) {
        case 'eval':
          this.handleEval(message.payload);
          break;
        case 'profile':
          this.handleProfile(message.payload);
          break;
        case 'network':
          this.handleNetwork(message.payload);
          break;
        default:
          this.notifyListeners(message);
      }
    } catch (error) {
      loggerService.error('Failed to handle debug message', error as Error);
    }
  }

  private handleReconnect() {
    if (this.retryCount >= this.config.maxRetries) {
      loggerService.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, this.config.reconnectInterval);
  }

  sendMessage(message: any) {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws?.send(JSON.stringify(message));
    } catch (error) {
      loggerService.error('Failed to send debug message', error as Error);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  addDebugListener(listener: (data: any) => void) {
    this.debugListeners.add(listener);
    return () => {
      this.debugListeners.delete(listener);
    };
  }

  private notifyListeners(data: any) {
    this.debugListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        loggerService.error('Debug listener error', error as Error);
      }
    });
  }

  disconnect() {
    this.ws?.close();
    this.isConnected = false;
    this.messageQueue = [];
    this.debugListeners.clear();
  }
}

export const remoteDebugger = RemoteDebugger.getInstance();
