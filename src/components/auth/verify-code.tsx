import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette } from '@/constants/theme';

export function VerifyCodeForm() {
  const { pendingVerification, verifyCode, resendCode, cancelVerification } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleVerify = async () => {
    if (code.trim().length < 4) {
      setError('Digite o código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyCode(code);
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
      await resendCode();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reenviar. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Verifique seu e-mail</Text>
      <Text style={styles.subtitle}>
        {pendingVerification?.reason === 'EMAIL_VERIFY'
          ? 'Enviamos um código de confirmação para o seu e-mail.'
          : 'Detectamos um dispositivo novo. Enviamos um código de verificação para o seu e-mail.'}
      </Text>

      <Input
        label="Código de 6 dígitos"
        value={code}
        onChangeText={(t) => {
          setCode(t.replace(/[^0-9]/g, '').slice(0, 6));
          setSent(false);
        }}
        placeholder="000000"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {sent ? <Text style={styles.sent}>Código reenviado. Confira seu e-mail.</Text> : null}

      <Button label="Verificar" loading={loading} onPress={() => void handleVerify()} size="lg" />
      <Button
        label="Reenviar código"
        variant="ghost"
        loading={resending}
        onPress={() => void handleResend()}
      />
      <Button label="Voltar" variant="ghost" onPress={cancelVerification} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  error: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  sent: {
    color: Palette.emerald,
    fontSize: 13,
    textAlign: 'center',
  },
});
