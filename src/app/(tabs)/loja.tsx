import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { Coins, ShoppingCart } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { shopApi } from '@/lib/features';
import type { ShopItem } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Palette, Radius } from '@/constants/theme';

export default function LojaScreen() {
  const token = useToken();
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [coins, setCoins] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    if (!token) return;
    shopApi(token)
      .state()
      .then((state) => {
        setItems(state.items);
        setCoins(state.coins);
      })
      .catch(() => setError(true));
  };

  useEffect(load, [token]);

  const buy = (item: ShopItem) => {
    if (!token) return;
    Alert.alert('Comprar item', `Comprar "${item.name}" por ${item.price} moedas?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Comprar',
        onPress: () => {
          void shopApi(token)
            .purchase(item.id)
            .then(() => {
              Alert.alert('Sucesso', 'Item comprado!');
              load();
            })
            .catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : 'Falha na compra.'));
        },
      },
    ]);
  };

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

  if (!items || coins === null) return <Loading label="Carregando loja..." />;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Loja</Text>
        <View style={styles.coinsBadge}>
          <Coins size={16} color={Palette.gold} />
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.column}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState icon={ShoppingCart} title="Loja vazia" description="Novos itens chegarão em breve." />
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemIcon}>
              <Coins size={22} color={Palette.highlight} />
            </View>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemDesc} numberOfLines={2}>
              {item.description ?? item.type}
            </Text>
            <Button
              size="sm"
              variant="secondary"
              label={String(item.price)}
              disabled={coins < item.price}
              onPress={() => buy(item)}
              style={styles.buyBtn}
            >
              <Coins size={14} color={Palette.gold} />
            </Button>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: Palette.text,
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
    color: Palette.gold,
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
  },
  itemDesc: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 16,
    minHeight: 32,
  },
  buyBtn: {
    marginTop: 4,
  },
});