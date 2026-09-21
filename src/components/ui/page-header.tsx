import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function PageHeader({ title, subtitle, onBack }: PageHeaderProps) {
  const P = usePalette();
  const styles = makeStyles(P);
  const router = useRouter();
  const goBack = onBack ?? (() => router.back());

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={goBack}
          accessibilityLabel="Voltar"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ArrowLeft size={20} color={P.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: P.surface,
      borderWidth: 1,
      borderColor: P.border,
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: '900',
      color: P.text,
    },
    subtitle: {
      fontSize: 13,
      color: P.textMuted,
      marginTop: Spacing.xs,
    },
  });
}
