import { useEffect, useMemo, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as Linking from 'expo-linking';
import type { Notification } from 'expo-notifications';

import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider as AppThemeProvider, usePalette, useThemeChoice } from '@/lib/theme-context';
import {
  registerForPushNotifications,
  addNotificationListener,
} from '@/lib/notifications';

const LIGHT_THEMES = new Set(['snow', 'daylight', 'cream', 'pearl']);

function ThemedApp() {
  const P = usePalette();
  const { themeId } = useThemeChoice();

  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: P.bg,
        card: P.bg,
        border: P.border,
        text: P.text,
        primary: P.highlight,
      },
    }),
    [P],
  );

  return (
    <ThemeProvider value={navTheme}>
      <AuthProvider>
        <StatusBar style={LIGHT_THEMES.has(themeId) ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: P.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="ranking" />
          <Stack.Screen name="curso/[id]" />
          <Stack.Screen name="aula/[courseId]/[lessonId]" />
          <Stack.Screen name="exame/[id]" />
          <Stack.Screen name="historico" />
          <Stack.Screen name="estatisticas" />
          <Stack.Screen name="conquistas" />
          <Stack.Screen name="verificar" />
          <Stack.Screen name="configuracoes" />
          <Stack.Screen name="inventario" />
          <Stack.Screen name="certificados" />
          <Stack.Screen name="notificacoes" />
          <Stack.Screen name="tutorial" />
          <Stack.Screen name="tutoriais" />
          <Stack.Screen name="ao-vivo" />
          <Stack.Screen name="instrutor" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

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
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}
