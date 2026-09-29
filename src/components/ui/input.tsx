import { forwardRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, containerStyle, style, secureTextEntry, ...props },
  ref,
) {
  const P = usePalette();
  // Campos "secureTextEntry" ganham botão de mostrar/ocultar (44dp de alvo).
  const withToggle = !!secureTextEntry;
  const [visible, setVisible] = useState(false);

  return (
    <>
      {label ? (
        <Text style={{ marginBottom: 6, fontSize: 13, fontWeight: '600', color: P.textMuted }}>
          {label}
        </Text>
      ) : null}
      <View style={{ position: 'relative' }}>
        <TextInput
          ref={ref}
          placeholderTextColor={P.textSubtle}
          secureTextEntry={withToggle ? !visible : secureTextEntry}
          style={[
            {
              height: 46,
              borderRadius: Radius.md,
              borderWidth: 1,
              borderColor: error ? P.red : P.border,
              backgroundColor: P.skeleton,
              paddingHorizontal: 14,
              fontSize: 15,
              color: P.text,
            },
            style,
            withToggle ? { paddingRight: 44 } : null,
          ]}
          {...props}
        />
        {withToggle ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visible ? <EyeOff size={18} color={P.textMuted} /> : <Eye size={18} color={P.textMuted} />}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={{ marginTop: 4, fontSize: 12, color: '#fca5a5' }}>{error}</Text>
      ) : null}
    </>
  );
});
