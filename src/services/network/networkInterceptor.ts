import axios, { 
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse, 
  AxiosError,
  AxiosHeaders
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { loggerService } from '../debug/loggerService';

// ... other imports ...

const requestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  try {
    // Set headers
    config.headers = new AxiosHeaders({
      'Content-Type': 'application/json',
      // Add other headers as needed
    });

    return config;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Add the interceptor
axios.interceptors.request.use(requestInterceptor);


class NetworkInterceptor {
  private static instance: NetworkInterceptor;
  private axiosInstance: AxiosInstance;
  private isDebugMode: boolean = false;

  private constructor() {
    this.axiosInstance = axios.create();
    this.setupInterceptors();
  }

  static getInstance(): NetworkInterceptor {
    if (!NetworkInterceptor.instance) {
      NetworkInterceptor.instance = new NetworkInterceptor();
    }
    return NetworkInterceptor.instance;
  }

  private setupInterceptors() {
    const requestInterceptor = async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        if (this.isDebugMode) {
          loggerService.debug('API Request', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers,
          });
        }

        config.headers = new AxiosHeaders({
          'Content-Type': 'application/json',
          // Add other headers as needed
        });

        return config;
      } catch (error) {
        if (this.isDebugMode) {
          loggerService.error('API Request Error', error as Error);
        }
        return Promise.reject(error);
      }
    };

    this.axiosInstance.interceptors.request.use(requestInterceptor);

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.isDebugMode) {
          loggerService.debug('API Response', {
            status: response.status,
            data: response.data,
            headers: response.headers,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        if (this.isDebugMode) {
          loggerService.error('API Response Error', error as Error);
        }
        return Promise.reject(error);
      }
    );
  }

  enableDebugMode() {
    this.isDebugMode = true;
  }

  disableDebugMode() {
    this.isDebugMode = false;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const networkInterceptor = NetworkInterceptor.getInstance();
