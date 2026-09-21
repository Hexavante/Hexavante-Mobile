import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, TextInput, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Eye, MonitorPlay, Play, Search, User } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { tutorialsApi } from '@/lib/features';
import type { Tutorial } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius } from '@/constants/theme';

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TutoriaisScreen() {
  const token = useToken();
  const router = useRouter();
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    (query: string) => {
      if (!token) return;
      setRefreshing(true);
      tutorialsApi(token)
        .list(1, query.trim() ? query.trim() : undefined)
        .then((res) => {
          setTutorials(res.data ?? []);
          setError(false);
        })
        .catch(() => setError(true))
        .finally(() => setRefreshing(false));
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    if (!search) {
      load('');
      return;
    }
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [token, search, load]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={MonitorPlay}
          title="Não foi possível carregar os tutoriais"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!tutorials) return <Loading label="Carregando tutoriais..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={tutorials}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(search)} tintColor={Palette.highlight} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Tutoriais</Text>
              <Text style={styles.subtitle}>{tutorials.length} disponíveis</Text>
            </View>
            <View style={styles.searchContainer}>
              <Search size={18} color={Palette.textSubtle} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar tutoriais..."
                placeholderTextColor={Palette.textSubtle}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon={MonitorPlay}
            title="Nenhum tutorial encontrado"
            description={
              search.trim()
                ? 'Tente outro termo de busca.'
                : 'Novos tutoriais serão adicionados em breve.'
            }
          />
        }
        renderItem={({ item }) => {
          const title = item.title ?? 'Tutorial';
          const author = item.authorName ?? null;
          const duration = formatDuration(item.duration ?? null);
          const views = item.viewCount ?? 0;
          return (
            <Pressable
              onPress={() => router.navigate(`/tutorial/${item.id}` as never)}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card style={styles.card}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumb}>
                    <Play size={28} color={Palette.highlight} />
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={styles.meta}>
                    {author ? (
                      <View style={styles.metaItem}>
                        <User size={12} color={Palette.textSubtle} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {author}
                        </Text>
                      </View>
                    ) : null}
                    {duration ? (
                      <View style={styles.metaItem}>
                        <Clock size={12} color={Palette.textSubtle} />
                        <Text style={styles.metaText}>{duration}</Text>
                      </View>
                    ) : null}
                    <View style={styles.metaItem}>
                      <Eye size={12} color={Palette.textSubtle} />
                      <Text style={styles.metaText}>{views} views</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Palette.text,
    fontSize: 14,
    paddingVertical: 0,
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
    flexWrap: 'wrap',
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
