import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

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
              tintColor={Palette.highlight}
              colors={[Palette.highlight]}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.bg,
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
