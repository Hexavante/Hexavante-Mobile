import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, FileCheck, Layers, Search } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { examsApi } from '@/lib/features';
import type { Exam } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export default function SimuladosScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    examsApi(token)
      .list()
      .then((res) => setExams(res.data))
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!exams) return null;
    if (!search.trim()) return exams;
    const q = search.trim().toLowerCase();
    return exams.filter((e) => e.title.toLowerCase().includes(q));
  }, [exams, search]);

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
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Simulados</Text>
              <Text style={styles.subtitle}>Teste seus conhecimentos</Text>
            </View>
            <View style={styles.searchContainer}>
              <Search size={18} color={P.textSubtle} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar simulados..."
                placeholderTextColor={P.textSubtle}
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
            icon={FileCheck}
            title="Nenhum simulado encontrado"
            description={
              search.trim()
                ? 'Tente outro termo de busca.'
                : 'Novos simulados serão adicionados em breve.'
            }
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
                    <FileCheck size={20} color={P.violet} />
                </View>
                <View style={styles.subjectChip}>
                  <Text style={styles.subjectText}>{item.examType}</Text>
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
                    <Layers size={12} color={P.textSubtle} />
                  <Text style={styles.metaText}>{item.questionCount} questões</Text>
                </View>
                <View style={styles.metaItem}>
                    <Clock size={12} color={P.textSubtle} />
                  <Text style={styles.metaText}>{item.timeLimit} min</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: P.text,
    },
    subtitle: {
      fontSize: 13,
      color: P.textMuted,
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: P.surface,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: P.border,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      color: P.text,
      fontSize: 14,
      paddingVertical: 0,
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
      color: P.violet,
      fontSize: 11,
      fontWeight: '700',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: P.text,
    },
    cardDesc: {
      fontSize: 12,
      color: P.textMuted,
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
      color: P.textSubtle,
    },
  });
}
