import { Stack } from 'expo-router';

import { usePalette } from '@/lib/theme-context';

export default function TutorialLayout() {
  const P = usePalette();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: P.bg },
      }}
    />
  );
}
