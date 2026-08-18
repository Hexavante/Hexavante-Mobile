import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Backpack, ChevronRight, LogOut, Medal } from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { gamificationApi } from '@/lib/features';
import type { XpProfile } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { XpBar } from '@/components/gamification/xp-bar';
import { Palette, Radius, shadow } from '@/constants/theme';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const token = useToken();
  const router = useRouter();
  const [profile, setProfile] = useState<XpProfile | null>(null);

  useEffect(() => {
    if (!token) return;
    gamificationApi(token)
      .xpProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, [token]);

  return (
    <Screen>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'H'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.username ? <Text style={styles.username}>@{user.username}</Text> : null}
      </Card>

      {!profile ? (
        <Loading label="Carregando progresso..." />
      ) : (
        <Card style={styles.xpCard}>
          <XpBar profile={profile} />
        </Card>
      )}

      <View style={styles.menu}>
        <Pressable
          onPress={() => router.navigate('/loja' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.menuIcon}>
            <Backpack size={18} color={Palette.sky} />
          </View>
          <Text style={styles.menuLabel}>Inventário</Text>
          <ChevronRight size={16} color={Palette.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/simulados' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.menuIcon}>
            <Medal size={18} color={Palette.amber} />
          </View>
          <Text style={styles.menuLabel}>Ranking</Text>
          <ChevronRight size={16} color={Palette.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <LogOut size={18} color={Palette.red} />
          </View>
          <Text style={[styles.menuLabel, { color: '#fca5a5' }]}>Sair da conta</Text>
          <ChevronRight size={16} color={Palette.textSubtle} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    paddingVertical: 24,
    ...shadow,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlightSoft,
    borderWidth: 2,
    borderColor: Palette.highlightBorder,
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '900',
    color: Palette.highlight,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  email: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  username: {
    fontSize: 13,
    color: Palette.highlight,
    fontWeight: '600',
  },
  xpCard: {
    marginBottom: 16,
  },
  menu: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    padding: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56,189,248,0.1)',
  },
  menuLabel: {
    flex: 1,
    color: Palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
});