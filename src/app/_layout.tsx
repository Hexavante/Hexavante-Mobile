import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import type { Notification } from 'expo-notifications';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider as AppThemeProvider, usePalette, useThemeChoice } from '@/lib/theme-context';
import { useServerThemeSync } from '@/hooks/use-server-theme-sync';
import { Loading } from '@/components/ui/loading';
import {
  addNotificationListener,
} from '@/lib/notifications';

const LIGHT_THEMES = new Set(['snow', 'daylight', 'cream', 'pearl']);

// Rotas acessíveis sem sessão: grupo de autenticação + verificação pública
// de certificado. Todo o resto passa pelo gate abaixo.
const PUBLIC_SEGMENTS = new Set(['(auth)', 'verificar']);

/**
 * Gate global: sem sessão, qualquer rota fora de (auth)/verificar cai no login.
 * Nunca redireciona dentro de (auth) (evita loop). O <Stack> fica sempre
 * montado (senão o router.replace não teria navigator para tratar a ação) —
 * enquanto a sessão é restaurada ou o redirect está pendente, cobrimos tudo
 * com a tela de carregamento.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Segments vazios = navegação ainda não hidratou.
  const hydrated = segments.length > 0;
  const isPublic = hydrated && PUBLIC_SEGMENTS.has(segments[0]);
  const blocked = !loading && !user && (!hydrated || !isPublic);
  const cover = loading || blocked;

  useEffect(() => {
    // Nunca redireciona dentro de (auth) nem antes da navegação estar pronta.
    if (loading || user || !hydrated || isPublic) return;
    router.replace('/login');
  }, [loading, user, hydrated, isPublic, router]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {cover ? (
        <View style={styles.cover}>
          <Loading />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

function ThemedApp() {
  const P = usePalette();
  const { themeId } = useThemeChoice();
  useServerThemeSync();

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
        <AuthGate>
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
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const notificationListener = useRef<ReturnType<typeof addNotificationListener> | null>(null);

  useEffect(() => {
    // Push token é registrado com sessão em useServerThemeSync (pós-login).
    // Aqui só mantemos os listeners de recebimento/toque.
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
