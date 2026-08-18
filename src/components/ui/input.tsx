import { forwardRef } from 'react';
import {
  Text,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Palette, Radius } from '@/constants/theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, containerStyle, style, ...props },
  ref,
) {
  return (
    <>
      {label ? (
        <Text style={{ marginBottom: 6, fontSize: 13, fontWeight: '600', color: Palette.textMuted }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={Palette.textSubtle}
        style={[
          {
            height: 46,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: error ? Palette.red : Palette.border,
            backgroundColor: 'rgba(255,255,255,0.04)',
            paddingHorizontal: 14,
            fontSize: 15,
            color: Palette.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={{ marginTop: 4, fontSize: 12, color: '#fca5a5' }}>{error}</Text>
      ) : null}
    </>
  );
});