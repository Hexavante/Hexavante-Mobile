import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Award, Calendar, Hash, Tag } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { certificatesApi } from '@/lib/features';
import type { Certificate } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CertificadosScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    certificatesApi(token)
      .list()
      .then((res) => setCertificates(res.certificates ?? []))
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <PageHeader title="Certificados" subtitle="Seus certificados conquistados" />
        <EmptyState
          icon={Award}
          title="Não foi possível carregar os certificados"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!certificates) return <Loading label="Carregando certificados..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: Spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <PageHeader title="Certificados" subtitle="Seus certificados conquistados" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Award}
            title="Nenhum certificado ainda"
            description="Complete cursos para ganhar seus certificados."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Award size={20} color={P.gold} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {item.course.title}
                </Text>
                <View style={styles.tagRow}>
                  <Tag size={12} color={P.textMuted} />
                  <Text style={styles.category}>{item.course.categoryName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <Calendar size={13} color={P.textSubtle} />
                <Text style={styles.date}>{formatDate(item.issuedAt)}</Text>
              </View>
              <View style={styles.codeBadge}>
                <Hash size={12} color={P.highlight} />
                <Text style={styles.code}>{item.code}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252,211,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.25)',
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  category: {
    fontSize: 12,
    color: P.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: P.border,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  date: {
    fontSize: 12,
    color: P.textSubtle,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: P.highlightSoft,
    borderWidth: 1,
    borderColor: P.highlightBorder,
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: P.highlight,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  });
}
