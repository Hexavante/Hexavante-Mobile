import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Palette, Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; color: string; border?: string }> = {
  primary: { bg: Palette.highlight, color: '#062033' },
  secondary: {
    bg: 'rgba(255,255,255,0.06)',
    color: Palette.text,
    border: Palette.border,
  },
  ghost: { bg: 'transparent', color: Palette.textMuted },
  danger: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.35)' },
};

const SIZES: Record<Size, { height: number; padding: number; fontSize: number }> = {
  sm: { height: 36, padding: 14, fontSize: 13 },
  md: { height: 44, padding: 18, fontSize: 14 },
  lg: { height: 52, padding: 22, fontSize: 16 },
};

export const Button = forwardRef<ViewStyle, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, label, children, style, ...props },
  ref,
) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <Pressable
      ref={ref as never}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: s.height,
          paddingHorizontal: s.padding,
          borderRadius: Radius.md,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled || loading ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.color} />
      ) : (
        <>
          {children}
          {label ? (
            <Text style={{ color: v.color, fontSize: s.fontSize, fontWeight: '700' }}>{label}</Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
});