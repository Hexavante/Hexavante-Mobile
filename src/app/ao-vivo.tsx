import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Radio, Users } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { liveApi } from '@/lib/features';
import type { LiveRoom } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export default function AoVivoScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const router = useRouter();
  const [rooms, setRooms] = useState<LiveRoom[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    liveApi(token)
      .list()
      .then((res) => {
        const raw = res as unknown as LiveRoom[] | { data?: LiveRoom[] };
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setRooms(list);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={Radio}
          title="Não foi possível carregar as salas"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!rooms) return <Loading label="Carregando salas ao vivo..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Ao vivo</Text>
            <Text style={styles.subtitle}>
              {rooms.length === 0
                ? 'Nenhuma sala no momento'
                : `${rooms.length} ${rooms.length === 1 ? 'sala' : 'salas'}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Radio}
            title="Nenhuma sala ao vivo"
            description="Novas transmissões aparecerão aqui."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.navigate(`/ao-vivo/${item.id}` as never)}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card style={styles.card}>
              <View style={styles.cardTop}>
                <StatusChip status={item.status} />
                {item.scheduledAt ? (
                  <View style={styles.metaItem}>
                    <Calendar size={12} color={P.textSubtle} />
                    <Text style={styles.metaText}>{formatDate(item.scheduledAt)}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.instructorName ? (
                <View style={styles.metaItem}>
                  <Users size={12} color={P.textSubtle} />
                  <Text style={styles.metaText}>{item.instructorName}</Text>
                </View>
              ) : null}
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

function StatusChip({ status }: { status?: string | null }) {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const key = (status ?? '').toLowerCase();
  const isLive = key.includes('live') || key.includes('vivo') || key === 'open';
  const isEnded = key.includes('end') || key.includes('encer') || key.includes('closed');
  const label = status?.trim() || 'Sala';
  return (
    <View
      style={[
        styles.chip,
        isLive ? styles.chipLive : isEnded ? styles.chipEnded : styles.chipScheduled,
      ]}
    >
      {isLive ? <View style={styles.liveDot} /> : null}
      <Text
        style={[
          styles.chipText,
          { color: isLive ? P.red : isEnded ? P.textSubtle : P.amber },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
    card: {
      gap: 8,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    chipLive: {
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.35)',
    },
    chipScheduled: {
      backgroundColor: 'rgba(251,191,36,0.12)',
      borderColor: 'rgba(251,191,36,0.3)',
    },
    chipEnded: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderColor: P.border,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: Radius.full,
      backgroundColor: P.red,
    },
    chipText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: P.text,
    },
    cardDesc: {
      fontSize: 12,
      color: P.textMuted,
      lineHeight: 16,
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
