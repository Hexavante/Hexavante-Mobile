import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BrandLogo } from '@/components/brand-logo';
import { useAuth } from '@/lib/auth-context';
import { errorFeedback } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { VerifyCodeForm } from '@/components/auth/verify-code';
import { EmailDivider, SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { isSocialAuthCancelled } from '@/lib/social-auth';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';
import type { SocialProvider } from '@/lib/api';

export default function LoginScreen() {
  const P = usePalette();
  const styles = makeStyles(P);
  const router = useRouter();
  const { signIn, signInWithSocial, pendingVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || socialLoading !== null;

  const handleSubmit = async () => {
    if (busy) return;
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      void errorFeedback();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      void errorFeedback();
      setError(e instanceof Error ? e.message : 'Falha ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: SocialProvider) => {
    if (busy) return;
    setSocialLoading(provider);
    setError(null);
    try {
      await signInWithSocial(provider);
      // Sessão criada → (auth)/_layout redireciona para /.
    } catch (e) {
      // Usuário fechou o navegador: não mostra nada.
      if (isSocialAuthCancelled(e)) return;
      void errorFeedback();
      setError(e instanceof Error && e.message ? e.message : 'Não foi possível entrar com a conta social.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.brandBox}>
          <BrandLogo style={styles.logo} />
          <Text style={styles.title}>HEXAVANTE</Text>
          <Text style={styles.subtitle}>Entre para continuar estudando</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <VerifyCodeForm />
          ) : (
            <>
              <SocialAuthButtons onPress={(p) => void handleSocial(p)} loadingProvider={socialLoading} />
              <EmailDivider />

              <Input
                label="E-mail"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                placeholder="voce@email.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <Input
                label="Senha"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError(null);
                }}
                placeholder="Sua senha"
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => void handleSubmit()}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <Button
                label="Entrar"
                loading={loading}
                disabled={socialLoading !== null}
                onPress={() => void handleSubmit()}
                size="lg"
              />

              <Pressable
                onPress={() => router.push('/recuperar-senha')}
                hitSlop={14}
                style={styles.linkHit}
                accessibilityRole="link"
                accessibilityLabel="Esqueci minha senha"
              >
                <Text style={styles.forgotLink}>Esqueci minha senha</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta?</Text>
          <Pressable
            onPress={() => router.push('/register')}
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="Criar conta"
          >
            <Text style={styles.footerLink}>Criar conta</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    content: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    inner: {
      gap: 24,
    },
    brandBox: {
      alignItems: 'center',
      gap: 6,
    },
    logo: {
      width: 96,
      height: 96,
      marginBottom: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: 2,
      color: P.text,
    },
    subtitle: {
      fontSize: 14,
      color: P.textMuted,
      textAlign: 'center',
    },
    form: {
      gap: 14,
    },
    errorBox: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
      backgroundColor: 'rgba(239,68,68,0.12)',
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    error: {
      color: P.red,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      alignItems: 'center',
    },
    footerText: {
      color: P.textMuted,
      fontSize: 14,
    },
    linkHit: {
      alignSelf: 'center',
    },
    forgotLink: {
      color: P.highlight,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    footerLink: {
      color: P.highlight,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
