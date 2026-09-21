import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { BookOpen, CheckCircle2, Clock, AlertCircle, Heart } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { coursesApi } from '@/lib/features';
import { tapLight, success } from '@/lib/haptics';
import type { LessonDetail } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

type LessonResponse = {
  lesson: LessonDetail & { isFavorite?: boolean; note?: string | null };
  isFavorite?: boolean;
  note?: string | null;
};

export default function AulaPlayerScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const token = useToken();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    if (!token || !courseId || !lessonId) return;
    coursesApi(token)
      .lesson(String(courseId), String(lessonId))
      .then((res) => {
        const data = res as LessonResponse;
        setLesson(data.lesson);
        const fav =
          data.isFavorite ?? data.lesson?.isFavorite ?? false;
        setIsFavorite(fav);
        const lessonNote = data.note ?? data.lesson?.note ?? null;
        setNote(typeof lessonNote === 'string' ? lessonNote : '');
      })
      .catch(() => setError(true));
  }, [token, courseId, lessonId]);

  const handleToggleFavorite = () => {
    if (!token || !courseId || !lessonId || favoriting) return;
    const previous = isFavorite;
    setIsFavorite(!previous);
    setFavoriting(true);
    void tapLight();
    coursesApi(token)
      .toggleFavorite(String(courseId), String(lessonId))
      .then((res) => {
        if (typeof res?.isFavorite === 'boolean') setIsFavorite(res.isFavorite);
      })
      .catch(() => {
        setIsFavorite(previous);
        Alert.alert('Erro', 'Não foi possível favoritar a aula. Tente novamente.');
      })
      .finally(() => setFavoriting(false));
  };

  const handleSaveNote = () => {
    if (!token || !courseId || !lessonId || savingNote) return;
    setSavingNote(true);
    coursesApi(token)
      .saveNote(String(courseId), String(lessonId), note)
      .then((res) => {
        if (typeof res?.note === 'string') setNote(res.note);
        Alert.alert('Sucesso', 'Anotação salva!');
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível salvar a anotação. Tente novamente.');
      })
      .finally(() => setSavingNote(false));
  };

  const handleComplete = () => {
    if (!token || !courseId || !lessonId || completing) return;
    setCompleting(true);
    coursesApi(token)
      .completeLesson(String(courseId), String(lessonId))
      .then(() => {
        void success();
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
        <View style={styles.topBar}>
          <View style={styles.topBarHeader}>
            <PageHeader
              title={title}
              subtitle={orderNumber != null ? `Aula ${orderNumber}` : undefined}
            />
          </View>
          <Pressable
            onPress={handleToggleFavorite}
            accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Favoritar aula'}
            style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.7 }]}
          >
            <Heart
              size={20}
              color={isFavorite ? P.red : P.textMuted}
              fill={isFavorite ? P.red : 'transparent'}
            />
          </Pressable>
        </View>

        {videoUrl ? (
          <View style={styles.videoContainer}>
            <LessonVideo videoUrl={videoUrl} />
          </View>
        ) : null}

        <View style={styles.noteWrapper}>
          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>Suas anotações</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Escreva suas anotações da aula..."
              placeholderTextColor={P.textSubtle}
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
            <Button
              size="sm"
              label="Salvar anotação"
              loading={savingNote}
              onPress={handleSaveNote}
            />
          </Card>
        </View>

        <View style={styles.info}>
          {orderNumber != null ? <Text style={styles.order}>Aula {orderNumber}</Text> : null}
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            {duration != null ? (
              <View style={styles.metaItem}>
                <Clock size={14} color={P.textMuted} />
                <Text style={styles.metaText}>{duration} min</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <BookOpen size={14} color={P.textMuted} />
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
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const player = useVideoPlayer(videoUrl, (p) => {
    p.play();
  });

  return <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />;
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topBarHeader: {
    flex: 1,
  },
  favBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    marginTop: Spacing.sm,
    marginRight: Spacing.lg,
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
  noteWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  noteCard: {
    gap: Spacing.sm,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: P.text,
    marginBottom: 6,
  },
  noteInput: {
    minHeight: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    color: P.text,
    fontSize: 14,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  info: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  order: {
    fontSize: 12,
    fontWeight: '800',
    color: P.highlight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: P.text,
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
    color: P.textMuted,
  },
  description: {
    fontSize: 14,
    color: P.textMuted,
    lineHeight: 21,
  },
  content: {
    fontSize: 14,
    color: P.text,
    lineHeight: 21,
  },
  });
}
