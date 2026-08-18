import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, ClipboardList, LogOut, TrendingUp } from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { gamificationApi } from '@/lib/features';
import type { XpProfile } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { XpBar } from '@/components/gamification/xp-bar';
import { Palette, Radius, shadow } from '@/constants/theme';

const QUICK_LINKS = [
  { label: 'Cursos', icon: BookOpen, href: '/cursos', color: Palette.sky },
  { label: 'Simulados', icon: ClipboardList, href: '/simulados', color: Palette.violet },
  { label: 'Ranking', icon: TrendingUp, href: '/ranking', color: Palette.amber },
] as const;

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const token = useToken();
  const router = useRouter();
  const [profile, setProfile] = useState<XpProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    gamificationApi(token)
      .xpProfile()
      .then(setProfile)
      .catch(() => setError(true));
  }, [token]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'estudante'}</Text>
          <Text style={styles.subtitle}>Vamos continuar evoluindo?</Text>
        </View>
        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Sair da conta"
        >
          <LogOut size={18} color={Palette.textMuted} />
        </Pressable>
      </View>

      <Card style={styles.hudCard}>
        {!profile && !error ? <Loading label="Carregando progresso..." /> : null}
        {error ? (
          <EmptyState
            title="Não foi possível carregar seu progresso"
            description="Verifique sua conexão e tente novamente."
          />
        ) : null}
        {profile ? <XpBar profile={profile} /> : null}
      </Card>

      <Text style={styles.sectionTitle}>Continue estudando</Text>
      <View style={styles.grid}>
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Pressable
              key={link.href}
              onPress={() => router.navigate(link.href as never)}
              style={({ pressed }) => [
                styles.quickCard,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${link.color}1f`, borderColor: `${link.color}40` }]}>
                <Icon size={22} color={link.color} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Sua jornada</Text>
      <Card>
        <View style={styles.journeyRow}>
          <BookOpen size={18} color={Palette.highlight} />
          <Text style={styles.journeyText}>
            Complete cursos e simulados para ganhar XP e subir no ranking.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    gap: 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  logout: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  hudCard: {
    marginBottom: 24,
    ...shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickLabel: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  journeyText: {
    flex: 1,
    color: Palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});