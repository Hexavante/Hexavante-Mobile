import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, Text, View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ban, BarChart3, Coins, Crown, ShoppingCart, Sparkles } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { shopApi } from '@/lib/features';
import { success } from '@/lib/haptics';
import { getThemeIdOf, isThemeUsable } from '@/lib/theme-shop';
import type { CoinHistoryEntry, ShopItem } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, useThemeChoice } from '@/lib/theme-context';
import { PALETTES, THEME_META } from '@/constants/palettes';
import type { AppPalette } from '@/constants/palettes';

const PREMIUM_BENEFITS = [
  { icon: Sparkles, label: 'Simulados exclusivos' },
  { icon: Ban, label: 'Sem anúncios' },
  { icon: Coins, label: 'x2 moedas' },
  { icon: BarChart3, label: 'Estatísticas avançadas' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  TITLE: 'Títulos',
  AVATAR_BORDER: 'Bordas',
  THEME: 'Temas',
  COSMETIC: 'Cosméticos',
  BOOSTER: 'Boosters',
  PASS: 'Passes',
  REVIEW_PACK: 'Revisão',
  PET: 'Pets',
  BADGE: 'Emblemas',
  FRAME: 'Molduras',
  EMOJI_PACK: 'Emojis',
  PROFILE_BACKGROUND: 'Fundos',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function isOwned(item: ShopItem): boolean {
  return item.ownershipStatus === 'owned_permanent' || item.ownershipStatus === 'active_temporary';
}

function formatPremiumDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function LojaScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const { themeId: currentThemeId, setThemeId } = useThemeChoice();
  const token = useToken();
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [coins, setCoins] = useState<number | null>(null);
  const [premium, setPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [coinHistory, setCoinHistory] = useState<CoinHistoryEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    };
  }, []);

  const triggerCelebrate = useCallback(() => {
    setCelebrate(true);
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    celebrateTimer.current = setTimeout(() => setCelebrate(false), 2500);
  }, []);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    shopApi(token)
      .state()
      .then((state) => {
        setItems(state.items);
        setCoins(state.coins);
        setPremium(state.premium ?? false);
        setPremiumExpiresAt(state.premiumExpiresAt ?? null);
        setCoinHistory(state.coinHistory ?? null);
      })
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const buy = (item: ShopItem) => {
    if (!token) return;
    Alert.alert('Comprar item', `Comprar "${item.name}" por ${item.cost} moedas?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Comprar',
        onPress: () => {
          void shopApi(token)
            .purchase(item.id)
            .then(() => {
              void success();
              triggerCelebrate();
              Alert.alert('Sucesso', 'Item comprado!');
              load();
            })
            .catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : 'Falha na compra.'));
        },
      },
    ]);
  };

  const applyTheme = useCallback(
    async (themeId: string) => {
      try {
        await setThemeId(themeId);
        await success();
      } catch {
        // haptics/storage indisponível — segue com o feedback visual
      }
      Alert.alert('Tema aplicado!', 'Seu novo visual já está ativo.');
    },
    [setThemeId],
  );

  const activateTrial = () => {
    if (!token || trialLoading) return;
    setTrialLoading(true);
    shopApi(token)
      .premiumTrial()
      .then(() => {
        void success();
        triggerCelebrate();
        Alert.alert('Sucesso', 'Trial Premium ativado por 30 dias!');
        load();
      })
      .catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível ativar o trial.'))
      .finally(() => setTrialLoading(false));
  };

  const availableCategories = useMemo(() => {
    if (!items) return [];
    const seen = new Set<string>();
    for (const item of items) {
      if (item.category) seen.add(item.category);
    }
    return Array.from(seen);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) return null;
    if (selectedCategory === 'ALL') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={ShoppingCart}
          title="Não foi possível carregar a loja"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!items || coins === null || !filteredItems) return <Loading label="Carregando loja..." />;

  const premiumDateLabel = formatPremiumDate(premiumExpiresAt);

  return (
    <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
      {celebrate ? (
        <View pointerEvents="none" style={styles.celebrateOverlay}>
          <ConfettiCannon count={80} origin={{ x: 200, y: 0 }} fadeOut autoStart />
        </View>
      ) : null}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.column}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
        }
        ListHeaderComponent={
          <>
            <Card style={styles.premiumCard}>
              <View style={styles.premiumChip}>
                <Crown size={12} color={P.gold} />
                <Text style={styles.premiumChipText}>HEXAVANTE PREMIUM</Text>
              </View>
              <Text style={styles.premiumTitle}>
                {premium ? 'Você é Premium' : 'Desbloqueie o estudo completo'}
              </Text>
              <View style={styles.benefitsList}>
                {PREMIUM_BENEFITS.map(({ icon: Icon, label }) => (
                  <View key={label} style={styles.benefitRow}>
                    <Icon size={14} color={P.gold} />
                    <Text style={styles.benefitText}>{label}</Text>
                  </View>
                ))}
              </View>
              {premium && premiumDateLabel ? (
                <Text style={styles.premiumExpiry}>Válido até {premiumDateLabel}</Text>
              ) : null}
              {!premium ? (
                <Button
                  size="sm"
                  label="Ativar trial Premium (30 dias)"
                  loading={trialLoading}
                  onPress={activateTrial}
                  style={styles.trialBtn}
                />
              ) : null}
            </Card>
            <View style={styles.header}>
              <Text style={styles.title}>Loja</Text>
              <View style={styles.coinsBadge}>
                <Coins size={16} color={P.gold} />
                <Text style={styles.coinsText}>{coins}</Text>
              </View>
            </View>
            {availableCategories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContent}
                style={styles.chipsScroll}
              >
                <Pressable
                  onPress={() => setSelectedCategory('ALL')}
                  style={[
                    styles.chip,
                    selectedCategory === 'ALL' ? styles.chipActive : styles.chipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === 'ALL' ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    Todos
                  </Text>
                </Pressable>
                {availableCategories.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {categoryLabel(category)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </>
        }
        ListEmptyComponent={
          selectedCategory === 'ALL' ? (
            <EmptyState icon={ShoppingCart} title="Loja vazia" description="Novos itens chegarão em breve." />
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="Nada nesta categoria"
              description="Tente outra categoria."
            />
          )
        }
        ListFooterComponent={
          coinHistory && coinHistory.length > 0 ? (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Últimas movimentações</Text>
              {coinHistory.slice(0, 5).map((entry) => {
                const amount = entry.amount ?? 0;
                const positive = amount >= 0;
                const date = formatShortDate(entry.createdAt ?? null);
                return (
                  <View key={entry.id} style={styles.historyRow}>
                    <Text style={[styles.historyAmount, positive ? styles.positive : styles.negative]}>
                      {positive ? `+${amount}` : amount}
                    </Text>
                    <Text style={styles.historyDesc} numberOfLines={1}>
                      {entry.description ?? 'Movimentação'}
                    </Text>
                    {date ? <Text style={styles.historyDate}>{date}</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const owned = isOwned(item);
          const equipped = item.isEquipped === true;
          const themeIdOf = getThemeIdOf(item);
          const themeUsable = isThemeUsable(item);
          const isThemeCard = item.category === 'THEME' && themeIdOf;
          const themeHighlight = themeIdOf ? (PALETTES[themeIdOf]?.highlight ?? P.highlight) : null;
          const themeLabel = themeIdOf ? (THEME_META[themeIdOf]?.label ?? item.name) : null;
          const isCurrentTheme = !!themeIdOf && currentThemeId === themeIdOf;

          return (
            <Card style={styles.itemCard}>
              <View style={styles.itemIcon}>
                <Coins size={22} color={P.highlight} />
              </View>
              <View style={styles.itemNameRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.isPremiumOnly ? (
                  <View style={styles.proChip}>
                    <Crown size={10} color={P.gold} />
                    <Text style={styles.proChipText}>PRO</Text>
                  </View>
                ) : null}
              </View>
              {owned || equipped ? (
                <View style={styles.ownershipRow}>
                  {owned ? (
                    <View style={styles.ownedChip}>
                      <Text style={styles.ownedChipText}>SEU</Text>
                    </View>
                  ) : null}
                  {equipped ? (
                    <View style={styles.inUseChip}>
                      <Text style={styles.inUseChipText}>EM USO</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.description ?? item.category}
              </Text>
              {isThemeCard && themeHighlight && themeLabel ? (
                <View style={styles.themePreviewRow}>
                  <View style={[styles.themeDot, { backgroundColor: themeHighlight }]} />
                  <Text style={styles.themePreviewLabel} numberOfLines={1}>
                    {themeLabel}
                  </Text>
                </View>
              ) : null}
              {themeUsable && themeIdOf ? (
                isCurrentTheme ? (
                  <Text style={styles.inUseText}>Em uso</Text>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    label="Usar tema"
                    onPress={() => void applyTheme(themeIdOf)}
                    style={styles.buyBtn}
                  />
                )
              ) : owned ? (
                <Text style={styles.ownedText}>Adquirido</Text>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  label={String(item.cost)}
                  disabled={coins < item.cost}
                  onPress={() => buy(item)}
                  style={styles.buyBtn}
                >
                  <Coins size={14} color={P.gold} />
                </Button>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
  premiumCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    gap: Spacing.sm,
    borderColor: 'rgba(252,211,77,0.35)',
    backgroundColor: 'rgba(252,211,77,0.06)',
  },
  premiumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.4)',
    backgroundColor: 'rgba(252,211,77,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumChipText: {
    color: P.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: P.text,
  },
  benefitsList: {
    gap: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: P.textMuted,
  },
  premiumExpiry: {
    fontSize: 12,
    fontWeight: '700',
    color: P.gold,
  },
  trialBtn: {
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: P.text,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.3)',
    backgroundColor: 'rgba(252,211,77,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinsText: {
    color: P.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  chipsScroll: {
    marginBottom: 12,
  },
  chipsContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: P.highlight,
    backgroundColor: P.highlightSoft,
  },
  chipInactive: {
    borderColor: P.border,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: P.highlight,
  },
  chipTextInactive: {
    color: P.textMuted,
  },
  column: {
    gap: 12,
  },
  itemCard: {
    flex: 1,
    gap: 6,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.highlightSoft,
    borderWidth: 1,
    borderColor: P.highlightBorder,
    marginBottom: 4,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: P.text,
  },
  proChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.4)',
    backgroundColor: 'rgba(252,211,77,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proChipText: {
    color: P.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ownershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownedChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: P.emerald,
    backgroundColor: 'rgba(52,211,153,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ownedChipText: {
    color: P.emerald,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inUseChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: P.highlight,
    backgroundColor: P.highlightSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inUseChipText: {
    color: P.highlight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemDesc: {
    fontSize: 12,
    color: P.textMuted,
    lineHeight: 16,
    minHeight: 32,
  },
  themePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: P.border,
  },
  themePreviewLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: P.textMuted,
  },
  ownedText: {
    fontSize: 13,
    fontWeight: '700',
    color: P.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingVertical: 8,
  },
  inUseText: {
    fontSize: 13,
    fontWeight: '700',
    color: P.highlight,
    textAlign: 'center',
    marginTop: 4,
    paddingVertical: 8,
  },
  buyBtn: {
    marginTop: 4,
  },
  historySection: {
    marginTop: 4,
    gap: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: P.text,
    paddingHorizontal: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: P.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 48,
  },
  positive: {
    color: P.emerald,
  },
  negative: {
    color: P.red,
  },
  historyDesc: {
    flex: 1,
    fontSize: 13,
    color: P.textMuted,
  },
  historyDate: {
    fontSize: 11,
    color: P.textSubtle,
  },
  celebrateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  });
}
