import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { useThemeChoice } from '@/lib/theme-context';

const LIGHT_THEMES = new Set(['snow', 'daylight', 'cream', 'pearl']);

// Logo da marca com variante clara nos temas claros.
export function BrandLogo({ style }: { style?: StyleProp<ImageStyle> }) {
  const { themeId } = useThemeChoice();
  return (
    <Image
      source={
        LIGHT_THEMES.has(themeId)
          ? require('@/assets/images/hexavante-logo-light.webp')
          : require('@/assets/images/hexavante-logo.webp')
      }
      style={style}
      resizeMode="contain"
    />
  );
}
