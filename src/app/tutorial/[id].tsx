import { useEffect, useState } from 'react';
import { Text, View, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Play, Eye, Clock, User, Tag, AlertCircle } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { tutorialsApi } from '@/lib/features';
import type { Tutorial } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius, Spacing, shadow } from '@/constants/theme';

export default function TutorialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useToken();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    tutorialsApi(token ?? undefined)
      .detail(id)
      .then((res) => setTutorial(res.tutorial))
      .catch(() => setError(true));
  }, [token, id]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={AlertCircle}
          title="Tutorial não encontrado"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!tutorial) return <Loading label="Carregando tutorial..." />;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          {tutorial.videoUrl && playing ? (
            <TutorialVideo
              videoUrl={tutorial.videoUrl}
              onFinish={() => setPlaying(false)}
            />
          ) : (
            <Pressable style={styles.thumbnailContainer} onPress={() => setPlaying(true)}>
              {tutorial.thumbnailUrl ? (
                <Image source={{ uri: tutorial.thumbnailUrl }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Play size={40} color={Palette.highlight} />
                </View>
              )}
              <View style={styles.playOverlay}>
                <View style={styles.playButton}>
                  <Play size={28} color={Palette.white} fill={Palette.white} />
                </View>
              </View>
            </Pressable>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{tutorial.title}</Text>

          <View style={styles.authorRow}>
            {tutorial.authorAvatarUrl ? (
              <Image source={{ uri: tutorial.authorAvatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={14} color={Palette.textMuted} />
              </View>
            )}
            <Text style={styles.authorName}>{tutorial.authorName}</Text>
            <Text style={styles.authorUsername}>@{tutorial.authorUsername}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Eye size={14} color={Palette.textMuted} />
              <Text style={styles.metaText}>{tutorial.viewCount} visualizações</Text>
            </View>
            {tutorial.duration ? (
              <View style={styles.metaItem}>
                <Clock size={14} color={Palette.textMuted} />
                <Text style={styles.metaText}>{formatDuration(tutorial.duration)}</Text>
              </View>
            ) : null}
            {tutorial.categoryName ? (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{tutorial.categoryName}</Text>
              </View>
            ) : null}
          </View>

          {tutorial.description ? (
            <Text style={styles.description}>{tutorial.description}</Text>
          ) : null}

          {tutorial.tags.length > 0 ? (
            <View style={styles.tagsSection}>
              <View style={styles.tagsHeader}>
                <Tag size={14} color={Palette.textMuted} />
                <Text style={styles.tagsTitle}>Tags</Text>
              </View>
              <View style={styles.tagsList}>
                {tutorial.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <Card style={styles.dateCard}>
            <Text style={styles.dateText}>
              Publicado em{' '}
              {new Date(tutorial.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

function TutorialVideo({ videoUrl, onFinish }: { videoUrl: string; onFinish: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('playToEnd', onFinish);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="contain"
      nativeControls
    />
  );
}

const styles = StyleSheet.create({
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
  thumbnailContainer: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlight,
  },
  info: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
    lineHeight: 28,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text,
  },
  authorUsername: {
    fontSize: 12,
    color: Palette.textSubtle,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flexWrap: 'wrap',
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
  categoryChip: {
    borderRadius: Radius.full,
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    color: Palette.highlight,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 21,
  },
  tagsSection: {
    gap: Spacing.sm,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textMuted,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagChip: {
    borderRadius: Radius.sm,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  dateCard: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    ...shadow,
  },
  dateText: {
    fontSize: 12,
    color: Palette.textSubtle,
  },
});
