import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, Layers } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { coursesApi } from '@/lib/features';
import type { Course } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius } from '@/constants/theme';

export default function CursosScreen() {
  const token = useToken();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    coursesApi(token)
      .list()
      .then((res) => setCourses(res.data))
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={BookOpen}
          title="Não foi possível carregar os cursos"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!courses) return <Loading label="Carregando cursos..." />;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Cursos</Text>
        <Text style={styles.subtitle}>{courses.length} disponíveis</Text>
      </View>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            icon={BookOpen}
            title="Nenhum curso disponível"
            description="Novos cursos serão adicionados em breve."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.navigate(`/curso/${item.id}` as never)}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card style={styles.card}>
              {item.thumbnailUrl ? null : (
                <View style={styles.thumb}>
                  <BookOpen size={28} color={Palette.highlight} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.shortDescription ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.shortDescription}
                  </Text>
                ) : null}
                <View style={styles.meta}>
                  <View style={styles.metaItem}>
                    <Layers size={12} color={Palette.textSubtle} />
                    <Text style={styles.metaText}>{item.totalModules} módulos</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <BookOpen size={12} color={Palette.textSubtle} />
                    <Text style={styles.metaText}>{item.totalLessons} aulas</Text>
                  </View>
                  {item.estimatedHours ? (
                    <View style={styles.metaItem}>
                      <Clock size={12} color={Palette.textSubtle} />
                      <Text style={styles.metaText}>{item.estimatedHours}h</Text>
                    </View>
                  ) : null}
                </View>
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
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  cardDesc: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 16,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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