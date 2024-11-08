export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
  priority?: 'default' | 'high' | 'max';
  channelId?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: number;
  enableVibration?: boolean;
  enableLights?: boolean;
  showBadge?: boolean;
  soundFile?: string;
}

export interface NotificationPermissions {
  alert?: boolean;
  badge?: boolean;
  sound?: boolean;
}

export interface NotificationToken {
  token: string;
  type: 'fcm' | 'apns';
  deviceId: string;
}
