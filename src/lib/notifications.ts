import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type * as Notifications from 'expo-notifications';

type NotificationsModule = typeof Notifications;

// expo-notifications (push remoto) foi removido do Expo Go desde SDK 53.
// require() dispara a inicialização nativa e lança erro ANTES do try/catch
// pegar — por isso verificamos executionEnvironment antes de importar.
function isExpoGo(): boolean {
  return Constants?.executionEnvironment === 'storeClient';
}

let modPromise: Promise<NotificationsModule | null> | null = null;

function getModule(): Promise<NotificationsModule | null> {
  if (!modPromise) {
    if (isExpoGo()) {
      modPromise = Promise.resolve(null);
    } else {
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
        modPromise = Promise.resolve(mod);
      } catch {
        modPromise = Promise.resolve(null);
      }
    }
  }
  return modPromise;
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

// re-export Device so _layout.tsx não precisa de outro import
import * as Device from 'expo-device';
