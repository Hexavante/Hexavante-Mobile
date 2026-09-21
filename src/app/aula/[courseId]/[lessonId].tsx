import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { coursesApi } from '@/lib/features';
import type { LessonDetail } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius, Spacing } from '@/constants/theme';

export default function AulaPlayerScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const token = useToken();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!token || !courseId || !lessonId) return;
    coursesApi(token)
      .lesson(String(courseId), String(lessonId))
      .then((res) => setLesson(res.lesson))
      .catch(() => setError(true));
  }, [token, courseId, lessonId]);

  const handleComplete = () => {
    if (!token || !courseId || !lessonId || completing) return;
    setCompleting(true);
    coursesApi(token)
      .completeLesson(String(courseId), String(lessonId))
      .then(() => {
        Alert.alert('Aula concluída', 'Progresso salvo com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível marcar a aula como concluída. Tente novamente.');
      })
      .finally(() => setCompleting(false));
  };

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={AlertCircle}
          title="Aula não encontrada"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!lesson) return <Loading label="Carregando aula..." />;

  const title = lesson.title ?? 'Aula';
  const description = lesson.description ?? null;
  const content = lesson.content ?? null;
  const videoUrl = lesson.videoUrl ?? null;
  const duration = lesson.duration ?? null;
  const orderNumber = lesson.orderNumber ?? null;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <ArrowLeft size={20} color={Palette.text} />
          </Pressable>
        </View>

        {videoUrl ? (
          <View style={styles.videoContainer}>
            <LessonVideo videoUrl={videoUrl} />
          </View>
        ) : null}

        <View style={styles.info}>
          {orderNumber != null ? <Text style={styles.order}>Aula {orderNumber}</Text> : null}
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            {duration != null ? (
              <View style={styles.metaItem}>
                <Clock size={14} color={Palette.textMuted} />
                <Text style={styles.metaText}>{duration} min</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <BookOpen size={14} color={Palette.textMuted} />
              <Text style={styles.metaText}>Aula</Text>
            </View>
          </View>

          {description ? <Text style={styles.description}>{description}</Text> : null}

          {content ? (
            <Card>
              <Text style={styles.content}>{content}</Text>
            </Card>
          ) : null}

          <Button
            label="Marcar como concluída"
            loading={completing}
            onPress={handleComplete}
            style={{ marginTop: Spacing.sm }}
          >
            {!completing ? <CheckCircle2 size={18} color="#062033" /> : null}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

function LessonVideo({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.play();
  });

  return <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  order: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.highlight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  description: {
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 21,
  },
  content: {
    fontSize: 14,
    color: Palette.text,
    lineHeight: 21,
  },
});
