import { networkInterceptor } from '../network/networkInterceptor';
import { loggerService } from './loggerService';

interface MockResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
  delay?: number;
}

interface MockRequest {
  method: string;
  url: string;
  response: MockResponse;
  enabled: boolean;
}

class NetworkMocker {
  private static instance: NetworkMocker;
  private mocks: Map<string, MockRequest> = new Map();
  private isMockingEnabled: boolean = false;

  private constructor() {
    this.setupMockInterceptor();
  }

  static getInstance(): NetworkMocker {
    if (!NetworkMocker.instance) {
      NetworkMocker.instance = new NetworkMocker();
    }
    return NetworkMocker.instance;
  }

  private setupMockInterceptor() {
    networkInterceptor.getAxiosInstance().interceptors.request.use(
      async (config) => {
        if (this.isMockingEnabled) {
          const mockKey = this.getMockKey(config.method!, config.url!);
          const mock = this.mocks.get(mockKey);

          if (mock?.enabled) {
            loggerService.debug('Network Mock Intercepted', {
              method: config.method,
              url: config.url,
              mock: mock,
            });

            if (mock.response.delay) {
              await new Promise(resolve => 
                setTimeout(resolve, mock.response.delay)
              );
            }

            return Promise.reject({
              config,
              response: {
                status: mock.response.status,
                data: mock.response.data,
                headers: mock.response.headers || {},
              },
            });
          }
        }
        return config;
      }
    );
  }

  private getMockKey(method: string, url: string): string {
    return `${method.toUpperCase()}:${url}`;
  }

  enableMocking() {
    this.isMockingEnabled = true;
    loggerService.info('Network Mocking Enabled');
  }

  disableMocking() {
    this.isMockingEnabled = false;
    loggerService.info('Network Mocking Disabled');
  }

  addMock(
    method: string,
    url: string,
    response: MockResponse,
    enabled: boolean = true
  ) {
    const mockKey = this.getMockKey(method, url);
    this.mocks.set(mockKey, {
      method,
      url,
      response,
      enabled,
    });
  }

  removeMock(method: string, url: string) {
    const mockKey = this.getMockKey(method, url);
    this.mocks.delete(mockKey);
  }

  clearMocks() {
    this.mocks.clear();
  }

  toggleMock(method: string, url: string) {
    const mockKey = this.getMockKey(method, url);
    const mock = this.mocks.get(mockKey);
    if (mock) {
      mock.enabled = !mock.enabled;
    }
  }

  getMocks(): MockRequest[] {
    return Array.from(this.mocks.values());
  }
}

export const networkMocker = NetworkMocker.getInstance();
