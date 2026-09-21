import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { useAuth } from '@/lib/auth-context';
import { errorFeedback } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { VerifyCodeForm } from '@/components/auth/verify-code';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export default function LoginScreen() {
  const P = usePalette();
  const styles = makeStyles(P);
  const { signIn, pendingVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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

  return (
    <Screen contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.brandBox}>
          <Image
            source={require('@/assets/images/hexavante-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>HEXAVANTE</Text>
          <Text style={styles.subtitle}>Plataforma de estudos</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <VerifyCodeForm />
          ) : (
            <>
              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="voce@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button label="Entrar" loading={loading} onPress={() => void handleSubmit()} size="lg" />
              <Link href="/recuperar-senha" style={styles.forgotLink}>
                Esqueci minha senha
              </Link>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta?</Text>
          <Link href="/register" style={styles.footerLink}>
            Criar conta
          </Link>
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
      gap: 32,
    },
    brandBox: {
      alignItems: 'center',
      gap: 6,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      letterSpacing: 2,
      color: P.text,
    },
    subtitle: {
      fontSize: 14,
      color: P.textMuted,
    },
    form: {
      gap: 14,
    },
    error: {
      color: '#fca5a5',
      fontSize: 13,
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
    forgotLink: {
      color: P.highlight,
      fontSize: 13,
      textAlign: 'center',
    },
    footerLink: {
      color: P.highlight,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}