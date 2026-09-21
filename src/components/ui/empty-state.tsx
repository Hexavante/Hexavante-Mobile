import { Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon: Icon, title, description, style }: EmptyStateProps) {
  const P = usePalette();
  const styles = makeStyles(P);
  return (
    <View style={[styles.container, style]}>
      {Icon ? (
        <View style={styles.iconBox}>
          <Icon size={28} color={P.highlight} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 32,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: P.border,
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: P.highlightSoft,
      borderWidth: 1,
      borderColor: P.highlightBorder,
    },
    title: {
      color: P.text,
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center',
    },
    description: {
      color: P.textMuted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
}