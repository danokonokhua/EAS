export default {
  expo: {
    name: "EmergenSeek",
    slug: "emergen-seek",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "ios.eas",
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: [
          "remote-notification"
        ]
      }
    },
    android: {
      package: "android.eas",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["NOTIFICATIONS"]
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: [] // Remove the sound configuration for now
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id" // Replace with your actual project ID
      }
    }
  }
};
