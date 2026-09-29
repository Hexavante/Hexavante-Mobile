import { Text, View, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { SOCIAL_PROVIDERS, type SocialProvider } from '@/lib/api';
import { ProviderIcon } from '@/components/auth/social-provider-icon';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  discord: 'Discord',
};

type Props = {
  onPress: (provider: SocialProvider) => void;
  /** Provedor com fluxo em andamento (mostra spinner só nele). */
  loadingProvider?: SocialProvider | null;
  /** Desabilita todos os botões sociais (ex.: enquanto o form está enviando). */
  disabled?: boolean;
};

/** Botões de login social na ordem: Google, Microsoft, GitHub, Discord. */
export function SocialAuthButtons({ onPress, loadingProvider = null, disabled = false }: Props) {
  const P = usePalette();
  const styles = makeStyles(P);
  const busy = loadingProvider !== null;

  return (
    <View style={styles.wrap}>
      {SOCIAL_PROVIDERS.map((provider) => (
        <Button
          key={provider}
          variant="secondary"
          size="lg"
          disabled={disabled || busy}
          loading={loadingProvider === provider}
          onPress={() => onPress(provider)}
          accessibilityRole="button"
          accessibilityLabel={`Continuar com ${PROVIDER_LABELS[provider]}`}
        >
          <ProviderIcon provider={provider} size={20} />
          <Text style={styles.label}>Continuar com {PROVIDER_LABELS[provider]}</Text>
        </Button>
      ))}
    </View>
  );
}

/** Divisor "ou continue com email" — fica entre os botões sociais e o form. */
export function EmailDivider() {
  const P = usePalette();
  const styles = makeStyles(P);
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>ou continue com email</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    label: {
      color: P.text,
      fontSize: 15,
      fontWeight: '700',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: P.border,
    },
    dividerText: {
      fontSize: 12,
      color: P.textMuted,
    },
  });
}
