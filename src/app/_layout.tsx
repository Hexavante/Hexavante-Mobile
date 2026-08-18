import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from 'expo-router';

import { AuthProvider } from '@/lib/auth-context';
import { Palette } from '@/constants/theme';

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
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}