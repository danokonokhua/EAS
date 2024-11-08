import { Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { navigationRef } from '../../navigation/RootNavigation';

class DeeplinkService {
  private static instance: DeeplinkService;
  private initialURL: string | null = null;

  private constructor() {}

  static getInstance(): DeeplinkService {
    if (!DeeplinkService.instance) {
      DeeplinkService.instance = new DeeplinkService();
    }
    return DeeplinkService.instance;
  }

  async initialize() {
    try {
      // Handle initial URL
      const url = await Linking.getInitialURL();
      if (url) {
        this.handleDeepLink(url);
      }

      // Handle dynamic links
      const dynamicLink = await dynamicLinks().getInitialLink();
      if (dynamicLink) {
        this.handleDynamicLink(dynamicLink);
      }

      // Listen for new links
      Linking.addEventListener('url', this.handleOpenURL);
      dynamicLinks().onLink(this.handleDynamicLink);
    } catch (error) {
      console.error('Failed to initialize deep linking:', error);
    }
  }

  private handleOpenURL = (event: { url: string }) => {
    this.handleDeepLink(event.url);
  };

  private handleDeepLink(url: string) {
    const route = this.parseUrl(url);
    if (route) {
      this.navigateToRoute(route);
    }
  }

  private handleDynamicLink = (link: any) => {
    if (link?.url) {
      this.handleDeepLink(link.url);
    }
  };

  private parseUrl(url: string): { screen: string; params?: any } | null {
    try {
      const pattern = /ubulance:\/\/([^\/]+)\/?(.+)?/;
      const matches = url.match(pattern);

      if (!matches) return null;

      const screen = matches[1];
      const params = matches[2] ? JSON.parse(decodeURIComponent(matches[2])) : {};

      return { screen, params };
    } catch (error) {
      console.error('Failed to parse deep link URL:', error);
      return null;
    }
  }

  private navigateToRoute({ screen, params }: { screen: string; params?: any }) {
    if (navigationRef.current) {
      navigationRef.current.navigate(screen, params);
    }
  }

  async createEmergencyLink(requestId: string): Promise<string> {
    try {
      const link = await dynamicLinks().buildShortLink({
        link: `ubulance://emergency/${requestId}`,
        domainUriPrefix: 'https://ubulance.page.link',
        android: {
          packageName: 'com.ubulance.app',
        },
        ios: {
          bundleId: 'com.ubulance.app',
          appStoreId: 'YOUR_APP_STORE_ID',
        },
        social: {
          title: 'Emergency Assistance Required',
          descriptionText: 'Someone needs immediate medical assistance',
        },
      });
      return link;
    } catch (error) {
      console.error('Failed to create dynamic link:', error);
      throw error;
    }
  }

  cleanup() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }
}

export const deeplinkService = DeeplinkService.getInstance();
