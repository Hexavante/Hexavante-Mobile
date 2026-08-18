import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Clock, FileCheck, Layers } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { Exam } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Palette, Radius } from '@/constants/theme';

export default function ExameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useToken();
  const [exam, setExam] = useState<Exam | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    examsApi(token)
      .list()
      .then((exams) => {
        const found = exams.find((e) => e.id === id);
        if (found) setExam(found);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [token, id]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={FileCheck}
          title="Simulado não encontrado"
          description="Ele pode ter sido removido ou atualizado."
        />
      </Screen>
    );
  }

  if (!exam) return <Loading label="Carregando simulado..." />;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <FileCheck size={26} color={Palette.violet} />
        </View>
        <Text style={styles.title}>{exam.title}</Text>
        {exam.description ? <Text style={styles.desc}>{exam.description}</Text> : null}
      </View>

      <Card style={styles.stats}>
        <View style={styles.stat}>
          <Layers size={16} color={Palette.textMuted} />
          <Text style={styles.statValue}>{exam.questionCount}</Text>
          <Text style={styles.statLabel}>questões</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Clock size={16} color={Palette.textMuted} />
          <Text style={styles.statValue}>{exam.durationMinutes}</Text>
          <Text style={styles.statLabel}>minutos</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <FileCheck size={16} color={Palette.textMuted} />
          <Text style={styles.statValue}>{exam.subject}</Text>
          <Text style={styles.statLabel}>matéria</Text>
        </View>
      </Card>

      {exam.bestScore !== null && exam.bestScore !== undefined ? (
        <Card style={styles.bestCard}>
          <Text style={styles.bestText}>Melhor nota: {exam.bestScore}%</Text>
          <Text style={styles.bestHint}>{exam.attemptsCount ?? 0} tentativa(s)</Text>
        </Card>
      ) : null}

      <Button label="Iniciar simulado" size="lg" onPress={() => undefined} style={styles.startBtn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    color: Palette.textSubtle,
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Palette.border,
  },
  bestCard: {
    alignItems: 'center',
    gap: 2,
    marginBottom: 16,
    borderColor: Palette.highlightBorder,
  },
  bestText: {
    color: Palette.highlight,
    fontSize: 15,
    fontWeight: '700',
  },
  bestHint: {
    color: Palette.textMuted,
    fontSize: 12,
  },
  startBtn: {
    marginTop: 4,
  },
});