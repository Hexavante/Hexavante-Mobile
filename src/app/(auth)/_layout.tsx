import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib/auth-context';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#06080f' },
      }}
    />
  );
}