import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BookOpen, CheckCircle2, ChevronRight, Layers, Play } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { coursesApi } from '@/lib/features';
import type { CourseDetail } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Palette, Radius, shadow } from '@/constants/theme';

export default function CursoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useToken();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    coursesApi(token)
      .detail(id)
      .then((res) => setCourse(res.course))
      .catch(() => setError(true));
  }, [token, id]);

  const enroll = () => {
    if (!token || !id) return;
    setEnrolling(true);
    coursesApi(token)
      .enroll(id)
      .then(() => setCourse((c) => (c ? { ...c, enrolled: true } : c)))
      .catch(() => undefined)
      .finally(() => setEnrolling(false));
  };

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={BookOpen}
          title="Não foi possível carregar o curso"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!course) return <Loading label="Carregando curso..." />;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{course.title}</Text>
          {course.instructorName ? (
            <Text style={styles.instructor}>Instrutor: {course.instructorName}</Text>
          ) : null}
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Layers size={13} color={Palette.textMuted} />
              <Text style={styles.heroMetaText}>{course.totalModules} módulos</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <BookOpen size={13} color={Palette.textMuted} />
              <Text style={styles.heroMetaText}>{course.totalLessons} aulas</Text>
            </View>
            {course.level ? (
              <View style={styles.levelChip}>
                <Text style={styles.levelText}>{course.level}</Text>
              </View>
            ) : null}
          </View>
          {course.shortDescription || course.description ? (
            <Text style={styles.description}>
              {course.description || course.shortDescription}
            </Text>
          ) : null}
          <Button
            label={course.progress ? 'Continuar curso' : 'Matricular-se'}
            loading={enrolling}
            onPress={enroll}
            style={styles.enrollBtn}
          />
        </View>

        <View style={styles.sections}>
          <Text style={styles.sectionTitle}>Conteúdo</Text>
          {course.modules.map((module) => (
            <Card key={module.id} style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <View style={styles.lessonList}>
                {module.lessons.map((lesson) => (
                  <View key={lesson.id} style={styles.lessonRow}>
                    {lesson.isCompleted ? (
                      <CheckCircle2 size={16} color={Palette.emerald} />
                    ) : (
                      <View style={styles.playIcon}>
                        <Play size={12} color={Palette.highlight} />
                      </View>
                    )}
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    {lesson.durationMinutes ? (
                      <Text style={styles.lessonDuration}>{lesson.durationMinutes} min</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 20,
    gap: 10,
    backgroundColor: Palette.highlightSoft,
    borderBottomWidth: 1,
    borderBottomColor: Palette.highlightBorder,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
    lineHeight: 30,
  },
  instructor: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  levelChip: {
    borderRadius: Radius.full,
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelText: {
    color: Palette.highlight,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 20,
  },
  enrollBtn: {
    marginTop: 6,
  },
  sections: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.text,
  },
  moduleCard: {
    gap: 10,
    ...shadow,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  lessonList: {
    gap: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playIcon: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlightSoft,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 13,
    color: Palette.textMuted,
  },
  lessonDuration: {
    fontSize: 11,
    color: Palette.textSubtle,
  },
});