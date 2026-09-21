import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Backpack, Shield, Shirt } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { shopApi } from '@/lib/features';
import type { InventoryEntry } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  title: Shield,
  badge: Shield,
  avatar_frame: Shirt,
  trail: Shield,
};

export default function InventarioScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
  const router = useRouter();
  const [items, setItems] = useState<InventoryEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    shopApi(token)
      .inventory()
      .then((res) => setItems(res.items))
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEquip = (entry: InventoryEntry) => {
    if (!token || equippingId) return;
    setEquippingId(entry.id);
    shopApi(token)
      .equip(entry.id)
      .then(() => {
        setItems((prev) =>
          prev?.map((e) =>
            e.id === entry.id ? { ...e, isEquipped: !e.isEquipped } : e,
          ) ?? prev,
        );
      })
      .catch(() => Alert.alert('Erro', 'Falha ao equipar item.'))
      .finally(() => setEquippingId(null));
  };

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={Backpack}
          title="Não foi possível carregar o inventário"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!items) return <Loading label="Carregando inventário..." />;

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={20} color={P.text} />
              </Pressable>
              <Text style={styles.title}>Inventário</Text>
              <View style={styles.backBtn} />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Backpack}
            title="Inventário vazio"
            description="Compre itens na loja para aparecer aqui."
          />
        }
        renderItem={({ item: entry }) => {
          const catIcon = CATEGORY_ICONS[entry.item.category] ?? Shield;
          const CatIcon = catIcon;
          const isBusy = equippingId === entry.id;

          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                {entry.item.imageUrl ? (
                  <Image source={{ uri: entry.item.imageUrl }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <CatIcon size={20} color={P.highlight} />
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {entry.item.name}
                  </Text>
                  <Text style={styles.category}>{entry.item.category}</Text>
                </View>

                <Pressable
                  disabled={isBusy}
                  onPress={() => toggleEquip(entry)}
                  style={[
                    styles.equipBtn,
                    entry.isEquipped && styles.equipBtnActive,
                    isBusy && { opacity: 0.5 },
                  ]}
                >
                  <Text
                    style={[
                      styles.equipText,
                      entry.isEquipped && styles.equipTextActive,
                    ]}
                  >
                    {entry.isEquipped ? 'Equipado' : 'Equipar'}
                  </Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: P.text,
  },
  card: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: P.skeleton,
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.highlightSoft,
    borderWidth: 1,
    borderColor: P.highlightBorder,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: P.text,
  },
  category: {
    fontSize: 12,
    color: P.textMuted,
    textTransform: 'capitalize',
  },
  equipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  equipBtnActive: {
    borderColor: P.highlightBorder,
    backgroundColor: P.highlightSoft,
  },
  equipText: {
    fontSize: 12,
    fontWeight: '700',
    color: P.textMuted,
  },
  equipTextActive: {
    color: P.highlight,
  },
  });
}
