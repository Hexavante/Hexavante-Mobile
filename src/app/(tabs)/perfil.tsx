import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Award, Backpack, BarChart3, Bell, CalendarDays, ChevronRight, Flame, GraduationCap, History, LogOut, Medal, Radio, Settings, ShieldCheck, Star, Trophy, Zap } from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { gamificationApi, shopApi } from '@/lib/features';
import type { XpProfile } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { XpBar } from '@/components/gamification/xp-bar';
import { Radius, shadow } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

const BORDER_COLORS: Record<string, string> = {
  'border-cyan': '#22d3ee',
  'border-aurora': '#a78bfa',
  'border-gold': '#fcd34d',
  'border-crystal': '#bae6fd',
};

export default function PerfilScreen() {
  const P = usePalette();
  const styles = makeStyles(P);
  const { user, signOut } = useAuth();
  const token = useToken();
  const router = useRouter();
  const [profile, setProfile] = useState<XpProfile | null>(null);
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [equippedBadge, setEquippedBadge] = useState<string | null>(null);
  const [avatarBorderColor, setAvatarBorderColor] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    gamificationApi(token)
      .xpProfile()
      .then(setProfile)
      .catch(() => undefined);
    shopApi(token)
      .inventory()
      .then(({ items }) => {
        const titleEntry = items.find(
          (e) => e.isEquipped && e.item.category === 'TITLE' && e.item.metadata?.titleText,
        );
        if (titleEntry?.item.metadata?.titleText) setEquippedTitle(titleEntry.item.metadata.titleText);
        const badgeEntry = items.find((e) => e.isEquipped && e.item.category === 'BADGE');
        if (badgeEntry) setEquippedBadge(badgeEntry.item.name);
        const borderEntry = items.find(
          (e) => e.isEquipped && e.item.category === 'AVATAR_BORDER' && e.item.metadata?.borderId,
        );
        const borderId = borderEntry?.item.metadata?.borderId;
        if (borderId) setAvatarBorderColor(BORDER_COLORS[borderId] ?? P.highlightBorder);
      })
      .catch(() => undefined);
  }, [token, P.highlightBorder]);

  return (
    <Screen>
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, avatarBorderColor ? { borderColor: avatarBorderColor, borderWidth: 3 } : null]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'H'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.username ? <Text style={styles.username}>@{user.username}</Text> : null}
        {equippedTitle || equippedBadge ? (
          <View style={styles.chipsRow}>
            {equippedTitle ? (
              <View style={styles.titleChip}>
                <Award size={12} color={P.gold} />
                <Text style={styles.titleChipText}>{equippedTitle}</Text>
              </View>
            ) : null}
            {equippedBadge ? (
              <View style={styles.titleChip}>
                <Medal size={12} color={P.amber} />
                <Text style={styles.titleChipText}>{equippedBadge}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </Card>

      {!profile ? (
        <Loading label="Carregando progresso..." />
      ) : (
        <>
          <Card style={styles.xpCard}>
            <XpBar profile={profile} />
          </Card>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Star size={14} color={P.amber} />
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>Nível</Text>
              </View>
              <View style={styles.statCol}>
                <Medal size={14} color={P.violet} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {profile.league}
                </Text>
                <Text style={styles.statLabel}>Liga</Text>
              </View>
              <View style={styles.statCol}>
                <Flame size={14} color={P.orange} />
                <Text style={styles.statValue}>{profile.streakDays ?? 0} dias</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statCol}>
                <Zap size={14} color={P.sky} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {profile.totalXp.toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.statLabel}>XP total</Text>
              </View>
            </View>
          </Card>
        </>
      )}

      <View style={styles.menu}>
        <Pressable
          onPress={() => router.navigate('/inventario' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.menuIcon}>
            <Backpack size={18} color={P.sky} />
          </View>
          <Text style={styles.menuLabel}>Inventário</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/ranking' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.menuIcon}>
            <Medal size={18} color={P.amber} />
          </View>
          <Text style={styles.menuLabel}>Ranking</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/certificados' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(252,211,77,0.1)' }]}>
            <Award size={18} color={P.gold} />
          </View>
          <Text style={styles.menuLabel}>Certificados</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/conquistas' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
            <Trophy size={18} color={P.amber} />
          </View>
          <Text style={styles.menuLabel}>Conquistas</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/historico' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
            <History size={18} color={P.emerald} />
          </View>
          <Text style={styles.menuLabel}>Histórico de simulados</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/estatisticas' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(56,189,248,0.1)' }]}>
            <BarChart3 size={18} color={P.sky} />
          </View>
          <Text style={styles.menuLabel}>Estatísticas</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/verificar' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
            <ShieldCheck size={18} color={P.emerald} />
          </View>
          <Text style={styles.menuLabel}>Verificar certificado</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/ao-vivo' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(248,113,113,0.1)' }]}>
            <Radio size={18} color="#f87171" />
          </View>
          <Text style={styles.menuLabel}>Ao vivo</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/instrutor' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(56,189,248,0.1)' }]}>
            <GraduationCap size={18} color={P.sky} />
          </View>
          <Text style={styles.menuLabel}>Seja instrutor</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/notificacoes' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
            <Bell size={18} color={P.violet} />
          </View>
          <Text style={styles.menuLabel}>Notificações</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/configuracoes' as never)}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(248,250,252,0.08)' }]}>
            <Settings size={18} color={P.textMuted} />
          </View>
          <Text style={styles.menuLabel}>Configurações</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <LogOut size={18} color={P.red} />
          </View>
          <Text style={[styles.menuLabel, { color: '#fca5a5' }]}>Sair da conta</Text>
          <ChevronRight size={16} color={P.textSubtle} />
        </Pressable>
      </View>
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
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
      backgroundColor: P.highlightSoft,
      borderWidth: 2,
      borderColor: P.highlightBorder,
      marginBottom: 8,
    },
    avatarText: {
      fontSize: 30,
      fontWeight: '900',
      color: P.highlight,
    },
    name: {
      fontSize: 18,
      fontWeight: '800',
      color: P.text,
    },
    email: {
      fontSize: 13,
      color: P.textMuted,
    },
    username: {
      fontSize: 13,
      color: P.highlight,
      fontWeight: '600',
    },
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    titleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: P.gold,
      backgroundColor: 'rgba(252,211,77,0.1)',
    },
    titleChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: P.gold,
    },
    xpCard: {
      marginBottom: 16,
    },
    statsCard: {
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    statCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      color: P.text,
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'center',
    },
    statLabel: {
      color: P.textSubtle,
      fontSize: 11,
      textAlign: 'center',
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
      borderColor: P.border,
      backgroundColor: P.card,
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
      color: P.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
