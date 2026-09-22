import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, LogIn, LogOut, MessageCircle, Radio, Send, Users } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { liveApi } from '@/lib/features';
import { tapLight, success } from '@/lib/haptics';
import type { LiveMessage, LiveRoomDetail } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

function parseRoom(res: unknown): LiveRoomDetail | null {
  if (!res || typeof res !== 'object') return null;
  const r = res as { liveRoom?: LiveRoomDetail; data?: LiveRoomDetail; room?: LiveRoomDetail } & Record<string, unknown>;
  const candidate = r.liveRoom ?? r.data ?? r.room ?? (typeof r.title === 'string' ? (r as unknown as LiveRoomDetail) : null);
  if (!candidate) return null;
  return { ...candidate, messages: candidate.messages ?? [] };
}

export default function AoVivoDetailScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useToken();

  const [room, setRoom] = useState<LiveRoomDetail | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fetchDetail = useCallback(
    async (silent = false) => {
      if (!token || !id) return;
      if (!silent) setRefreshing(true);
      try {
        const res = await liveApi(token).detail(String(id));
        const parsed = parseRoom(res);
        if (!parsed) {
          if (!silent) setError(true);
          return;
        }
        setRoom(parsed);
        setError(false);
      } catch {
        if (!silent) setError(true);
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [token, id],
  );

  useEffect(() => {
    void fetchDetail(false);
  }, [fetchDetail]);

  useEffect(() => {
    if (!token || !id) return;
    const timer = setInterval(() => {
      void fetchDetail(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [token, id, fetchDetail]);

  const handleJoin = useCallback(() => {
    if (!token || !id || joining) return;
    setJoining(true);
    void tapLight();
    liveApi(token)
      .join(String(id))
      .then(() => {
        void success();
        void fetchDetail(true);
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível entrar na sala. Tente novamente.');
      })
      .finally(() => setJoining(false));
  }, [token, id, joining, fetchDetail]);

  const handleLeave = useCallback(() => {
    if (!token || !id || leaving) return;
    setLeaving(true);
    void tapLight();
    liveApi(token)
      .leave(String(id))
      .then(() => {
        void fetchDetail(true);
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível sair da sala. Tente novamente.');
      })
      .finally(() => setLeaving(false));
  }, [token, id, leaving, fetchDetail]);

  const handleSend = useCallback(() => {
    const text = content.trim();
    if (!token || !id || !text || sending) return;
    setSending(true);
    liveApi(token)
      .sendMessage(String(id), text)
      .then((res) => {
        const r = res as unknown as { message?: LiveMessage; data?: LiveMessage } | LiveMessage | null;
        const incoming =
          (r && typeof r === 'object' && 'message' in (r as object)
            ? (r as { message?: LiveMessage }).message
            : null) ??
          (r && typeof r === 'object' && 'data' in (r as object)
            ? (r as { data?: LiveMessage }).data
            : null) ??
          (r && typeof r === 'object' && 'content' in (r as object) ? (r as LiveMessage) : null);
        if (incoming?.id) {
          setRoom((prev) =>
            prev ? { ...prev, messages: [...(prev.messages ?? []), incoming] } : prev,
          );
        } else {
          void fetchDetail(true);
        }
        setContent('');
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
      })
      .finally(() => setSending(false));
  }, [token, id, content, sending, fetchDetail]);

  if (error && !room) {
    return (
      <Screen>
        <EmptyState
          icon={Radio}
          title="Sala não encontrada"
          description="Ela pode ter sido encerrada ou removida."
        />
      </Screen>
    );
  }

  if (!room) return <Loading label="Carregando sala..." />;

  const messages: LiveMessage[] = room.messages ?? [];

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <View style={styles.root}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchDetail(false)}
              tintColor={P.highlight}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerGap}>
              <Card style={styles.infoCard}>
                <Text style={styles.title}>{room.title}</Text>
                {room.description ? (
                  <Text style={styles.description}>{room.description}</Text>
                ) : null}
                <View style={styles.metaRow}>
                  {room.status ? <Text style={styles.statusChip}>{room.status}</Text> : null}
                  {room.scheduledAt ? (
                    <View style={styles.metaItem}>
                      <Calendar size={12} color={P.textSubtle} />
                      <Text style={styles.metaText}>{formatDate(room.scheduledAt)}</Text>
                    </View>
                  ) : null}
                  {room.instructorName ? (
                    <View style={styles.metaItem}>
                      <Users size={12} color={P.textSubtle} />
                      <Text style={styles.metaText}>{room.instructorName}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.actionsRow}>
                  <Button
                    size="sm"
                    label="Entrar"
                    loading={joining}
                    onPress={handleJoin}
                    style={styles.actionBtn}
                  >
                    {!joining ? <LogIn size={16} color="#062033" /> : null}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    label="Sair"
                    loading={leaving}
                    onPress={handleLeave}
                    style={styles.actionBtn}
                  >
                    {!leaving ? <LogOut size={16} color={P.text} /> : null}
                  </Button>
                </View>
              </Card>
              <View style={styles.chatTitleRow}>
                <MessageCircle size={14} color={P.textMuted} />
                <Text style={styles.chatTitle}>Chat ({messages.length})</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={MessageCircle}
              title="Nenhuma mensagem ainda"
              description="Seja a primeira pessoa a enviar uma mensagem."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.msgBubble}>
              {item.userName ? <Text style={styles.msgUser}>{item.userName}</Text> : null}
              <Text style={styles.msgContent}>{item.content}</Text>
              {item.createdAt ? (
                <Text style={styles.msgTime}>{formatDate(item.createdAt)}</Text>
              ) : null}
            </View>
          )}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor={P.textSubtle}
            value={content}
            onChangeText={setContent}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Button
            size="sm"
            label="Enviar"
            loading={sending}
            onPress={handleSend}
            style={styles.sendBtn}
          >
            {!sending ? <Send size={16} color="#062033" /> : null}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    headerGap: {
      paddingTop: 16,
      gap: 12,
      marginBottom: 8,
    },
    infoCard: {
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: P.text,
    },
    description: {
      fontSize: 13,
      color: P.textMuted,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    statusChip: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: P.red,
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.3)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.full,
      overflow: 'hidden',
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
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    actionBtn: {
      flex: 1,
    },
    chatTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    chatTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: P.textMuted,
    },
    msgBubble: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderWidth: 1,
      borderColor: P.border,
      borderRadius: Radius.md,
      padding: 12,
      gap: 2,
    },
    msgUser: {
      fontSize: 12,
      fontWeight: '800',
      color: P.highlight,
    },
    msgContent: {
      fontSize: 14,
      color: P.text,
      lineHeight: 20,
    },
    msgTime: {
      fontSize: 10,
      color: P.textSubtle,
      marginTop: 2,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: P.border,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: P.border,
      backgroundColor: 'rgba(255,255,255,0.04)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: P.text,
      fontSize: 14,
    },
    sendBtn: {
      minWidth: 100,
    },
  });
}
