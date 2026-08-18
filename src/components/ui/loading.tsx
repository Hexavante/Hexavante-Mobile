import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Palette.highlight} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
    backgroundColor: Palette.bg,
  },
  label: {
    color: Palette.textMuted,
    fontSize: 14,
  },
});