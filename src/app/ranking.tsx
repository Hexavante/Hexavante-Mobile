import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Medal, TrendingUp } from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { api } from '@/lib/api';
import { gamificationApi, type MyRank } from '@/lib/features';
import type { RankingEntry } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius } from '@/constants/theme';

const MEDAL_COLORS: Record<number, string> = {
  1: Palette.amber,
  2: '#cbd5e1',
  3: '#fb923c',
};

export default function RankingScreen() {
  const token = useToken();
  const { user } = useAuth();
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    gamificationApi(token)
      .ranking()
      .then((ranking) => {
        setEntries(ranking.data ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
    api<MyRank | null>('/api/v1/rankings/me', { token })
      .then((me) => setMyRank(me ?? null))
      .catch(() => setMyRank(null));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={TrendingUp}
          title="Não foi possível carregar o ranking"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!entries) return <Loading label="Carregando ranking..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={Palette.highlight} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Ranking</Text>
              <Text style={styles.subtitle}>Os melhores da plataforma</Text>
            </View>

            {myRank?.rank != null ? (
              <View style={styles.meCard}>
                <Text style={styles.meText}>
                  Sua posição: #{myRank.rank}
                  {myRank.totalXp != null ? ` · ${myRank.totalXp} XP` : ''}
                  {myRank.league ? ` · ${myRank.league}` : ''}
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <EmptyState icon={Medal} title="Ranking vazio" description="Seja o primeiro a aparecer aqui." />
        }
        renderItem={({ item }) => {
          const isMe = user?.id === item.userId;
          const medal = MEDAL_COLORS[item.rank];
          return (
            <View style={[styles.row, isMe && styles.rowMe]}>
              <View style={styles.posBox}>
                {medal ? <Medal size={18} color={medal} /> : <Text style={styles.posText}>{item.rank}</Text>}
              </View>
              <View style={styles.userBox}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.fullName ?? item.name ?? item.username)?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <Text style={styles.username} numberOfLines={1}>
                  {item.fullName ?? item.username}
                </Text>
              </View>
              <Text style={styles.xp}>{item.totalXp} XP</Text>
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 2,
  },
  meCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
    backgroundColor: Palette.highlightSoft,
    padding: 12,
  },
  meText: {
    color: Palette.highlight,
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    padding: 10,
  },
  rowMe: {
    borderColor: Palette.highlightBorder,
    backgroundColor: Palette.highlightSoft,
  },
  posBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  posText: {
    color: Palette.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  userBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarText: {
    color: Palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  username: {
    flex: 1,
    color: Palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  xp: {
    color: Palette.amber,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
