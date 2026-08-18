import { Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Palette, Radius } from '@/constants/theme';

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon: Icon, title, description, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {Icon ? (
        <View style={styles.iconBox}>
          <Icon size={28} color={Palette.highlight} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 32,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
  },
  title: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: Palette.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});