import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius, shadow } from '@/constants/theme';

export type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}>;

export function Card({ children, style, onPress }: CardProps) {
  return (
    <View
      onTouchEnd={onPress}
      style={[
        {
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: Palette.border,
          backgroundColor: Palette.card,
          padding: 16,
          ...shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}