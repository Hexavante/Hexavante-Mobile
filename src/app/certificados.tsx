import { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Award, ArrowLeft, Calendar, Hash, Tag } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { certificatesApi } from '@/lib/features';
import type { Certificate } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Radius, Spacing } from '@/constants/theme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CertificadosScreen() {
  const token = useToken();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    certificatesApi(token)
      .list()
      .then((res) => setCertificates(res.certificates ?? []))
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <Screen>
        <Header onBack={() => router.back()} />
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
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <Header onBack={() => router.back()} />

      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
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
                <Award size={20} color={Palette.gold} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {item.course.title}
                </Text>
                <View style={styles.tagRow}>
                  <Tag size={12} color={Palette.textMuted} />
                  <Text style={styles.category}>{item.course.categoryName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <Calendar size={13} color={Palette.textSubtle} />
                <Text style={styles.date}>{formatDate(item.issuedAt)}</Text>
              </View>
              <View style={styles.codeBadge}>
                <Hash size={12} color={Palette.highlight} />
                <Text style={styles.code}>{item.code}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.backBtn} onTouchEnd={onBack}>
          <ArrowLeft size={20} color={Palette.text} />
        </View>
        <Text style={styles.title}>Certificados</Text>
      </View>
      <Text style={styles.subtitle}>Seus certificados conquistados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: Spacing.xs,
  },
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
    color: Palette.text,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  category: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
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
    color: Palette.textSubtle,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.highlight,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});
