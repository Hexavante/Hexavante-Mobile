import { useEffect, useRef } from 'react';
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib/auth-context';
import { usePalette, useThemeChoice } from '@/lib/theme-context';

// Telas públicas de auth sempre usam o tema padrão (igual ao desktop).
// Restaura o tema do usuário ao sair (login bem-sucedido).
function useForceDefaultTheme() {
  const { themeId, setThemeId } = useThemeChoice();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    previous.current = themeId;
    if (themeId !== 'default') void setThemeId('default');
    return () => {
      if (previous.current && previous.current !== 'default') {
        void setThemeId(previous.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const P = usePalette();
  useForceDefaultTheme();

  if (loading) return null;
  if (user) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: P.bg },
      }}
    />
  );
}
