import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export type ScreenProps = Omit<ScrollViewProps, 'refreshControl'> & {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({
  children,
  contentContainerStyle,
  scrollable = true,
  refreshing,
  onRefresh,
  ...props
}: ScreenProps) {
  const P = usePalette();
  const styles = makeStyles(P);
  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.content, styles.noScroll, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, contentContainerStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={P.highlight}
              colors={[P.highlight]}
            />
          ) : undefined
        }
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: P.bg,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    noScroll: {
      flex: 1,
      padding: 0,
    },
  });
}
