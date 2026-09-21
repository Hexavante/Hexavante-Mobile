import type { PropsWithChildren } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, shadow } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';

export type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}>;

export function Card({ children, style, onPress }: CardProps) {
  const P = usePalette();
  const cardStyle: StyleProp<ViewStyle> = [
    {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: P.border,
      backgroundColor: P.card,
      padding: 16,
      ...shadow,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
