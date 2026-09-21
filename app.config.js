/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'Hexavante',
  slug: 'hexavante',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'hexavante',
  userInterfaceStyle: 'dark',
  backgroundColor: '#06080f',
  ios: {
    icon: './assets/images/icon.png',
    supportsTablet: true,
    bundleIdentifier: 'br.com.hexavante.app',
  },
  android: {
    package: 'br.com.hexavante.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#06080f',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#06080f',
        image: './assets/images/hexavante-logo.png',
        imageWidth: 160,
      },
    ],
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/images/android-icon-monochrome.png',
        color: '#06080f',
      },
    ],
  ],
  extra: {
    apiUrl: process.env.API_URL || 'https://api.hexavante.com.br',
    appUrl: process.env.APP_URL || 'https://hexavante.com.br',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
    },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};
