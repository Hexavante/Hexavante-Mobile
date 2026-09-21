import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BarChart3, ListChecks, Medal, Target } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { ExamStats } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius, Spacing } from '@/constants/theme';

type SubjectStat = { subject: string; correct: number; total: number };
type EvolutionPoint = { date: string; score: number };

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function EstatisticasScreen() {
  const token = useToken();
  const router = useRouter();
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([examsApi(token).stats(), examsApi(token).subjectStats(), examsApi(token).evolution()])
      .then(([s, subj, evo]) => {
        setStats(s);
        setSubjects(Array.isArray(subj) ? subj : []);
        setEvolution(Array.isArray(evo) ? evo : []);
      })
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <Screen>
        <Header onBack={() => router.back()} />
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
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <Header onBack={() => router.back()} />

      <View style={styles.body}>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <ListChecks size={18} color={Palette.highlight} />
            <Text style={styles.summaryValue}>{stats.totalAttempts ?? 0}</Text>
            <Text style={styles.summaryLabel}>Tentativas</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Target size={18} color={Palette.amber} />
            <Text style={styles.summaryValue}>{Math.round(stats.averageScore ?? 0)}%</Text>
            <Text style={styles.summaryLabel}>Média</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Medal size={18} color={Palette.emerald} />
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

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.backBtn} onTouchEnd={onBack}>
          <ArrowLeft size={20} color={Palette.text} />
        </View>
        <Text style={styles.title}>Estatísticas</Text>
      </View>
      <Text style={styles.subtitle}>Seu desempenho nos estudos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: Spacing.xs,
  },
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
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.text,
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
    color: Palette.text,
  },
  barPct: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.highlight,
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
    backgroundColor: Palette.highlight,
  },
  evoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evoDate: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  evoScore: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
});
