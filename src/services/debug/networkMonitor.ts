import { networkMocker } from './networkMocker';
import { loggerService } from './loggerService';
import { performanceProfiler } from './performanceProfiler';

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
}

interface NetworkResponse {
  id: string;
  status: number;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  duration: number;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private requests: Map<string, NetworkRequest> = new Map();
  private responses: Map<string, NetworkResponse> = new Map();
  private isMonitoring: boolean = false;
  private networkListeners: Set<(data: any) => void> = new Set();

  private constructor() {
    this.setupNetworkInterceptor();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private setupNetworkInterceptor() {
    if (global.XMLHttpRequest) {
      const originalXHR = global.XMLHttpRequest;
      // @ts-ignore
      global.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        this.monitorXHR(xhr);
        return xhr;
      };
    }

    if (global.fetch) {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = async (...args) => {
        const request = this.createRequestFromFetch(args);
        this.trackRequest(request);

        try {
          const response = await originalFetch(...args);
          this.trackResponse(request.id, response);
          return response;
        } catch (error) {
          this.trackError(request.id, error as Error);
          throw error;
        }
      };
    }
  }

  private monitorXHR(xhr: XMLHttpRequest) {
    const request = this.createRequestFromXHR(xhr);
    
    xhr.addEventListener('load', () => {
      this.trackResponse(request.id, {
        status: xhr.status,
        headers: this.parseHeaders(xhr.getAllResponseHeaders()),
        body: xhr.response,
        timestamp: Date.now(),
        duration: performanceProfiler.getCurrentTime() - request.timestamp
      });
    });

    xhr.addEventListener('error', (error) => {
      this.trackError(request.id, error as Error);
    });
  }

  private createRequestFromFetch(args: any[]): NetworkRequest {
    const [url, options = {}] = args;
    return {
      id: Math.random().toString(36).substr(2, 9),
      url: url.toString(),
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
      timestamp: Date.now()
    };
  }

  private createRequestFromXHR(xhr: XMLHttpRequest): NetworkRequest {
    return {
      id: Math.random().toString(36).substr(2, 9),
      url: xhr.responseURL,
      method: xhr.method || 'GET',
      headers: {},
      timestamp: Date.now()
    };
  }

  private parseHeaders(headerStr: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!headerStr) return headers;

    headerStr.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      const header = parts.shift();
      const value = parts.join(': ');
      if (header) headers[header] = value;
    });

    return headers;
  }

  startMonitoring() {
    this.isMonitoring = true;
    loggerService.info('Network monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.clearHistory();
    loggerService.info('Network monitoring stopped');
  }

  private trackRequest(request: NetworkRequest) {
    if (!this.isMonitoring) return;
    
    this.requests.set(request.id, request);
    this.notifyListeners({
      type: 'request',
      data: request
    });
  }

  private trackResponse(requestId: string, response: NetworkResponse) {
    if (!this.isMonitoring) return;
    
    this.responses.set(requestId, response);
    this.notifyListeners({
      type: 'response',
      data: {
        requestId,
        response
      }
    });
  }

  private trackError(requestId: string, error: Error) {
    if (!this.isMonitoring) return;
    
    loggerService.error(`Network request failed for ${requestId}`, error);
    this.notifyListeners({
      type: 'error',
      data: {
        requestId,
        error
      }
    });
  }

  addNetworkListener(listener: (data: any) => void) {
    this.networkListeners.add(listener);
    return () => {
      this.networkListeners.delete(listener);
    };
  }

  private notifyListeners(data: any) {
    this.networkListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        loggerService.error('Network listener error', error as Error);
      }
    });
  }

  getRequests(): NetworkRequest[] {
    return Array.from(this.requests.values());
  }

  getResponses(): NetworkResponse[] {
    return Array.from(this.responses.values());
  }

  clearHistory() {
    this.requests.clear();
    this.responses.clear();
  }
}

export const networkMonitor = NetworkMonitor.getInstance();
