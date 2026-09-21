import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  BellOff,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Info,
  Award,
  MessageSquare,
  BookOpen,
} from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { notificationsApi } from '@/lib/features';
import type { Notification } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius, Spacing } from '@/constants/theme';

const TYPE_ICONS: Record<string, typeof Bell> = {
  system: Info,
  achievement: Award,
  message: MessageSquare,
  course: BookOpen,
  warning: CircleAlert,
  success: CircleCheck,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}sem`;
  const months = Math.floor(days / 30);
  return `${months}mes`;
}

export default function NotificacoesScreen() {
  const token = useToken();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNotifications = useCallback(() => {
    if (!token) return;
    setLoading(true);
    notificationsApi(token)
      .list()
      .then((res) => {
        setNotifications(res.notifications ?? []);
        setUnreadCount(res.unreadCount ?? 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await notificationsApi(token).markRead(id);
        setNotifications((prev) =>
          prev?.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) ?? null,
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    },
    [token],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationsApi(token).markAllRead();
      setNotifications((prev) =>
        prev?.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })) ?? null,
      );
      setUnreadCount(0);
    } catch {}
  }, [token]);

  const handlePress = useCallback(
    (item: Notification) => {
      if (!item.readAt) void handleMarkRead(item.id);
      if (item.link) {
        try {
          router.push(item.link as never);
        } catch {
          // deep-link inválido — ignora
        }
      }
    },
    [handleMarkRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const isUnread = !item.readAt;
      const Icon = TYPE_ICONS[item.type] ?? Bell;
      const iconColor = isUnread ? Palette.highlight : Palette.textMuted;

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handlePress(item)}
          style={[styles.item, isUnread && styles.itemUnread]}
        >
          <View style={[styles.iconBox, isUnread && styles.iconBoxUnread]}>
            <Icon size={18} color={iconColor} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
          {isUnread && <View style={styles.dot} />}
        </TouchableOpacity>
      );
    },
    [handlePress],
  );

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={CircleAlert}
          title="Não foi possível carregar notificações"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Notificações</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <CheckCheck size={16} color={Palette.highlight} />
            <Text style={styles.markAllText}>Marcar tudo como lido</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !notifications ? (
        <Loading label="Carregando notificações..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={BellOff}
              title="Nenhuma notificação"
              description="Você está em dia! Novas notificações aparecerão aqui."
            />
          }
          renderItem={renderItem}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: Palette.highlight,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
  },
  badge: {
    backgroundColor: Palette.red,
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  markAllText: {
    color: Palette.highlight,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    padding: Spacing.md,
  },
  itemUnread: {
    borderColor: Palette.highlightBorder,
    backgroundColor: Palette.highlightSoft,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconBoxUnread: {
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textMuted,
  },
  itemTitleUnread: {
    color: Palette.text,
  },
  message: {
    fontSize: 13,
    color: Palette.textMuted,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: Palette.textSubtle,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.highlight,
    marginTop: 6,
  },
});
