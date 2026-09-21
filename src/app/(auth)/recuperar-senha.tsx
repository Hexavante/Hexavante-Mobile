import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { requestPasswordReset, resetPassword } from '@/lib/api';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export default function RecuperarSenhaScreen() {
  const P = usePalette();
  const styles = makeStyles(P);
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Digite seu e-mail.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const id = await requestPasswordReset(email.trim());
      if (!id) {
        setInfo('Se o e-mail estiver cadastrado, enviamos um código.');
        return;
      }
      setVerificationId(id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (code.trim().length < 6) {
      setError('Digite o código de 6 dígitos.');
      return;
    }
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (!verificationId) {
      setError('Sessão expirada. Reenvie o código.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(verificationId, code.trim(), password);
      Alert.alert('Senha redefinida!', 'Use sua nova senha para entrar.');
      router.replace('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const id = await requestPasswordReset(email.trim());
      if (!id) {
        setInfo('Se o e-mail estiver cadastrado, enviamos um código.');
        return;
      }
      setVerificationId(id);
      setInfo('Código reenviado. Confira seu e-mail.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reenviar. Tente novamente.');
    } finally {
      setResending(false);
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
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Digite seu e-mail para receber o código.'
              : `Enviamos um código para ${email.trim()}.`}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <Input
                label="E-mail"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setInfo(null);
                }}
                placeholder="voce@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {info ? <Text style={styles.sent}>{info}</Text> : null}

              <Button label="Enviar código" loading={loading} onPress={() => void handleSendCode()} size="lg" />
            </>
          ) : (
            <>
              <Input
                label="Código de 6 dígitos"
                value={code}
                onChangeText={(t) => {
                  setCode(t.replace(/[^0-9]/g, '').slice(0, 6));
                  setInfo(null);
                }}
                placeholder="000000"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
              />
              <Input
                label="Nova senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {info ? <Text style={styles.sent}>{info}</Text> : null}

              <Button label="Redefinir senha" loading={loading} onPress={() => void handleReset()} size="lg" />
              <Button
                label="Reenviar código"
                variant="ghost"
                loading={resending}
                onPress={() => void handleResend()}
              />
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Lembrou a senha?</Text>
          <Link href="/login" style={styles.footerLink}>
            Entrar
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
    error: {
      color: '#fca5a5',
      fontSize: 13,
      textAlign: 'center',
    },
    sent: {
      color: P.emerald,
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
    footerLink: {
      color: P.highlight,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
