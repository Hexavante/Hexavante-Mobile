import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type * as Notifications from 'expo-notifications';

type NotificationsModule = typeof Notifications;

// expo-notifications foi removido do Expo Go (SDK 53+).
// Import estático quebraria o app inteiro — por isso o carregamento é lazy
// e todas as funções viram no-op quando o módulo nativo não existe
// (Expo Go) ou quando não há projectId configurado (dev build).
function loadModule(): Promise<NotificationsModule | null> {
  try {
    const mod = require('expo-notifications') as NotificationsModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Promise.resolve(mod);
  } catch {
    return Promise.resolve(null);
  }
}

let cached: Promise<NotificationsModule | null> | null = null;
function getModule(): Promise<NotificationsModule | null> {
  if (!cached) cached = loadModule();
  return cached;
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    const N = await getModule();
    if (!N) return null;

    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId || projectId === 'your-project-id') return null;

    const token = await N.getExpoPushTokenAsync({ projectId });

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', {
        name: 'default',
        importance: N.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return token.data;
  } catch {
    return null;
  }
}

export function addNotificationListener(handlers: {
  onReceive?: (notification: Notifications.Notification) => void;
  onTap?: (response: Notifications.NotificationResponse) => void;
}) {
  let cleanup: (() => void) | null = null;
  let cancelled = false;

  void getModule().then((N) => {
    if (!N || cancelled) return;
    const receiveSub = N.addNotificationReceivedListener(handlers.onReceive ?? (() => {}));
    const responseSub = N.addNotificationResponseReceivedListener(
      handlers.onTap ?? (() => {}),
    );
    cleanup = () => {
      receiveSub.remove();
      responseSub.remove();
    };
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}
