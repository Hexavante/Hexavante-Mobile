import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  const P = usePalette();
  const styles = makeStyles(P);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={P.highlight} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 32,
      backgroundColor: P.bg,
    },
    label: {
      color: P.textMuted,
      fontSize: 14,
    },
  });
}