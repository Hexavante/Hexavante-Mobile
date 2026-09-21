import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as Linking from 'expo-linking';
import type { Notification } from 'expo-notifications';

import { AuthProvider } from '@/lib/auth-context';
import { Palette } from '@/constants/theme';
import {
  registerForPushNotifications,
  addNotificationListener,
} from '@/lib/notifications';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Palette.bg,
    card: Palette.bg,
    border: Palette.border,
    text: Palette.text,
    primary: Palette.highlight,
  },
};

export default function RootLayout() {
  const notificationListener = useRef<ReturnType<typeof addNotificationListener> | null>(null);

  useEffect(() => {
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          // TODO: send token to backend POST /api/v1/notifications/register
        }
      })
      .catch(() => {
        // push indisponível (Expo Go sem projectId, emulador, etc.)
      });

    notificationListener.current = addNotificationListener({
      onReceive: (notification: Notification) => {
        // handle foreground notification (e.g. in-app banner)
      },
      onTap: (response) => {
        const data = response.notification.request.content.data;
        if (data?.url) {
          Linking.openURL(data.url as string);
        }
      },
    });

    return () => {
      notificationListener.current?.();
    };
  }, []);

  return (
    <ThemeProvider value={navTheme}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Palette.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="ranking" />
          <Stack.Screen name="curso/[id]" />
          <Stack.Screen name="exame/[id]" />
          <Stack.Screen name="configuracoes" />
          <Stack.Screen name="inventario" />
          <Stack.Screen name="certificados" />
          <Stack.Screen name="notificacoes" />
          <Stack.Screen name="tutorial/[id]" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}