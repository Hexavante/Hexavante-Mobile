import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Lock, Trophy } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { gamificationApi } from '@/lib/features';
import type { Achievement } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ConquistasScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    gamificationApi(token)
      .achievements()
      .then((res) => setAchievements(res.achievements ?? []))
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <PageHeader title="Conquistas" subtitle="Suas medalhas e marcos" />
        <EmptyState
          icon={Trophy}
          title="Não foi possível carregar as conquistas"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!achievements) return <Loading label="Carregando conquistas..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.key}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: Spacing.sm }}
        columnWrapperStyle={{ gap: Spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <PageHeader title="Conquistas" subtitle="Suas medalhas e marcos" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Trophy}
            title="Nenhuma conquista ainda"
            description="Continue estudando para desbloquear conquistas."
          />
        }
        renderItem={({ item }) => {
          const unlocked = item.unlocked;
          const unlockedAt = formatDate(item.unlockedAt);
          return (
            <Card
              style={[
                styles.card,
                unlocked ? styles.cardUnlocked : styles.cardLocked,
                { opacity: unlocked ? 1 : 0.5 },
              ]}
            >
              <View style={[styles.iconBox, unlocked ? styles.iconBoxUnlocked : null]}>
                {unlocked ? (
                  <Trophy size={22} color={P.gold} />
                ) : (
                  <Lock size={22} color={P.textSubtle} />
                )}
              </View>
              <Text style={styles.achTitle} numberOfLines={2}>
                {item.title ?? item.key}
              </Text>
              {item.description ? (
                <Text style={styles.achDesc} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
              {item.tier ? (
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>{item.tier}</Text>
                </View>
              ) : null}
              {unlocked && unlockedAt ? <Text style={styles.date}>{unlockedAt}</Text> : null}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  cardUnlocked: {
    borderColor: P.highlightBorder,
  },
  cardLocked: {},
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: P.border,
  },
  iconBoxUnlocked: {
    backgroundColor: 'rgba(252,211,77,0.1)',
    borderColor: 'rgba(252,211,77,0.3)',
  },
  achTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: P.text,
    textAlign: 'center',
    lineHeight: 17,
  },
  achDesc: {
    fontSize: 11,
    color: P.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: P.highlightSoft,
    borderWidth: 1,
    borderColor: P.highlightBorder,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: P.highlight,
  },
  date: {
    fontSize: 10,
    color: P.textSubtle,
  },
  });
}
