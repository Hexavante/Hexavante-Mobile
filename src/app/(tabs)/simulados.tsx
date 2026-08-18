import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, FileCheck, Layers } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { Exam } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius } from '@/constants/theme';

export default function SimuladosScreen() {
  const token = useToken();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    examsApi(token)
      .list()
      .then((data) => setExams(data))
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={FileCheck}
          title="Não foi possível carregar os simulados"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!exams) return <Loading label="Carregando simulados..." />;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Simulados</Text>
        <Text style={styles.subtitle}>Teste seus conhecimentos</Text>
      </View>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            icon={FileCheck}
            title="Nenhum simulado disponível"
            description="Novos simulados serão adicionados em breve."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.navigate(`/exame/${item.id}` as never)}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <FileCheck size={20} color={Palette.violet} />
                </View>
                <View style={styles.subjectChip}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Layers size={12} color={Palette.textSubtle} />
                  <Text style={styles.metaText}>{item.questionCount} questões</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={Palette.textSubtle} />
                  <Text style={styles.metaText}>{item.durationMinutes} min</Text>
                </View>
                {item.difficulty ? (
                  <Text style={[styles.metaText, { color: Palette.amber }]}>{item.difficulty}</Text>
                ) : null}
              </View>
            </Card>
          </Pressable>
        )}
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
  card: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  subjectChip: {
    borderRadius: Radius.full,
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subjectText: {
    color: Palette.violet,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  cardDesc: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 17,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Palette.textSubtle,
  },
});