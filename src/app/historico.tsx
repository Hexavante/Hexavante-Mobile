import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CircleCheck, History } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { ExamHistoryEntry } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function scoreColor(P: AppPalette, score: number) {
  if (score >= 70) return P.emerald;
  if (score >= 50) return P.amber;
  return P.red;
}

export default function HistoricoScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const router = useRouter();
  const [attempts, setAttempts] = useState<ExamHistoryEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPage = useCallback(
    async (t: string, p: number, append: boolean) => {
      const res = await examsApi(t).history(p);
      setAttempts((prev) => (append ? [...(prev ?? []), ...(res.attempts ?? [])] : (res.attempts ?? [])));
      setPage(res.page ?? p);
      setTotalPages(res.totalPages ?? p);
    },
    [],
  );

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    loadPage(token, 1, false)
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token, loadPage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLoadMore = useCallback(() => {
    if (!token || loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    loadPage(token, page + 1, true)
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false));
  }, [token, loadingMore, page, totalPages, loadPage]);

  if (error) {
    return (
      <Screen>
        <PageHeader title="Histórico" subtitle="Seus simulados resolvidos" />
        <EmptyState
          icon={History}
          title="Não foi possível carregar o histórico"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!attempts) return <Loading label="Carregando histórico..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={attempts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: Spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <PageHeader title="Histórico" subtitle="Seus simulados resolvidos" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={History}
            title="Nenhum simulado ainda"
            description="Resolva um simulado e seu histórico aparecerá aqui."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => router.push(`/exame/${item.examId}`)}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.examTitle} numberOfLines={2}>
                  {item.examTitle}
                </Text>
                <Text style={styles.examType}>{item.examType}</Text>
              </View>
              <View style={[styles.scoreBadge, { borderColor: scoreColor(P, item.score) }]}>
                <Text style={[styles.score, { color: scoreColor(P, item.score) }]}>
                  {Math.round(item.score)}%
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <CircleCheck size={13} color={P.textSubtle} />
                <Text style={styles.meta}>
                  {item.correctAnswers}/{item.totalQuestions} acertos
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Calendar size={13} color={P.textSubtle} />
                <Text style={styles.meta}>{formatDate(item.finishedAt)}</Text>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={
          page < totalPages ? (
            <Button
              variant="secondary"
              label="Carregar mais"
              loading={loadingMore}
              onPress={handleLoadMore}
              style={{ marginTop: Spacing.sm }}
            />
          ) : null
        }
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
    lineHeight: 20,
  },
  examType: {
    fontSize: 12,
    color: P.textMuted,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  score: {
    fontSize: 14,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: P.border,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: P.textSubtle,
  },
  });
}
