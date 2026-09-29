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

function toISODate(br: string): string | null {
  const m = br.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = Number(dd);
  const mo = Number(mm);
  const y = Number(yyyy);
  if (d < 1 || d > 31 || mo < 1 || mo > 12 || y < 1900 || y > new Date().getFullYear()) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export default function RegisterScreen() {
  const P = usePalette();
  const styles = makeStyles(P);
  const router = useRouter();
  const { signUp, signInWithSocial, pendingVerification } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || socialLoading !== null;

  const handleSubmit = async () => {
    if (busy) return;
    if (!name.trim() || !username.trim() || !birthDate.trim() || !email || !password) {
      setError('Preencha todos os campos.');
      void errorFeedback();
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      setError('Usuário: 3 a 30 caracteres, só letras, números e _.');
      void errorFeedback();
      return;
    }
    const iso = toISODate(birthDate);
    if (!iso) {
      setError('Data de nascimento inválida. Use DD/MM/AAAA.');
      void errorFeedback();
      return;
    }
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      void errorFeedback();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp({
        username: username.trim(),
        fullName: name.trim(),
        email: email.trim(),
        password,
        birthDate: iso,
      });
    } catch (e) {
      void errorFeedback();
      setError(e instanceof Error ? e.message : 'Falha ao cadastrar. Tente novamente.');
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
      // Conta criada/encontrada no provider → (auth)/_layout redireciona para /.
    } catch (e) {
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
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Junte-se à plataforma Hexavante</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <VerifyCodeForm />
          ) : (
            <>
              <SocialAuthButtons onPress={(p) => void handleSocial(p)} loadingProvider={socialLoading} />
              <EmailDivider />

              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                autoComplete="name"
                textContentType="name"
              />
              <Input
                label="Nome de usuário"
                value={username}
                onChangeText={(t) => setUsername(t.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))}
                placeholder="seu_usuario"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Input
                label="Nascimento"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="DD/MM/AAAA"
                keyboardType="number-pad"
                maxLength={10}
              />
              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="voce@email.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <Button
                label="Criar conta"
                loading={loading}
                disabled={socialLoading !== null}
                onPress={() => void handleSubmit()}
                size="lg"
              />
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Pressable
            onPress={() => router.push('/login')}
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="Entrar"
          >
            <Text style={styles.footerLink}>Entrar</Text>
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
      letterSpacing: 1,
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
    footerLink: {
      color: P.highlight,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
