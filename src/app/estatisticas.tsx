import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarChart3, ListChecks, Medal, Target } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { ExamStats } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

type SubjectStat = { subject: string; correct: number; total: number };
type EvolutionPoint = { date: string; score: number };

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function EstatisticasScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    Promise.all([examsApi(token).stats(), examsApi(token).subjectStats(), examsApi(token).evolution()])
      .then(([s, subj, evo]) => {
        setStats(s);
        setSubjects(Array.isArray(subj) ? subj : []);
        setEvolution(Array.isArray(evo) ? evo : []);
      })
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <PageHeader title="Estatísticas" subtitle="Seu desempenho nos estudos" />
        <EmptyState
          icon={BarChart3}
          title="Não foi possível carregar as estatísticas"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!stats) return <Loading label="Carregando estatísticas..." />;

  const lastFive = [...evolution].slice(-5).reverse();

  return (
    <Screen
      contentContainerStyle={{ padding: 0, paddingBottom: 32 }}
      refreshing={refreshing}
      onRefresh={load}
    >
      <PageHeader title="Estatísticas" subtitle="Seu desempenho nos estudos" />

      <View style={styles.body}>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <ListChecks size={18} color={P.highlight} />
            <Text style={styles.summaryValue}>{stats.totalAttempts ?? 0}</Text>
            <Text style={styles.summaryLabel}>Tentativas</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Target size={18} color={P.amber} />
            <Text style={styles.summaryValue}>{Math.round(stats.averageScore ?? 0)}%</Text>
            <Text style={styles.summaryLabel}>Média</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Medal size={18} color={P.emerald} />
            <Text style={styles.summaryValue}>{Math.round(stats.bestScore ?? 0)}%</Text>
            <Text style={styles.summaryLabel}>Melhor</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Desempenho por matéria</Text>
        {subjects.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sem dados por matéria"
            description="Resolva simulados para ver seu desempenho por matéria."
          />
        ) : (
          <Card style={styles.listCard}>
            {subjects.map((s) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <View key={s.subject} style={styles.barRow}>
                  <View style={styles.barHeader}>
                    <Text style={styles.barName} numberOfLines={1}>
                      {s.subject}
                    </Text>
                    <Text style={styles.barPct}>{pct}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        <Text style={styles.sectionTitle}>Evolução recente</Text>
        {lastFive.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sem evolução registrada"
            description="Suas últimas notas aparecerão aqui."
          />
        ) : (
          <Card style={styles.listCard}>
            {lastFive.map((p, i) => (
              <View key={`${p.date}-${i}`} style={styles.evoRow}>
                <Text style={styles.evoDate}>{formatDate(p.date)}</Text>
                <Text style={styles.evoScore}>{Math.round(p.score)}%</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.md,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: P.text,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    color: P.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: P.text,
    marginTop: Spacing.sm,
  },
  listCard: {
    gap: Spacing.md,
  },
  barRow: {
    gap: 6,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  barName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: P.text,
  },
  barPct: {
    fontSize: 12,
    fontWeight: '800',
    color: P.highlight,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: P.highlight,
  },
  evoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evoDate: {
    fontSize: 13,
    color: P.textMuted,
  },
  evoScore: {
    fontSize: 14,
    fontWeight: '800',
    color: P.text,
    fontVariant: ['tabular-nums'],
  },
  });
}
