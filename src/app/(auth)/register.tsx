import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius } from '@/constants/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao cadastrar. Tente novamente.');
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
          <View style={styles.logoBox}>
            <Text style={styles.logo}>H</Text>
          </View>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Comece a estudar na Hexavante</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoComplete="name"
            textContentType="name"
          />
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
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Criar conta" loading={loading} onPress={() => void handleSubmit()} size="lg" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Link href="/login" style={styles.footerLink}>
            Entrar
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    gap: 28,
  },
  brandBox: {
    alignItems: 'center',
    gap: 6,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.highlightSoft,
    borderWidth: 1,
    borderColor: Palette.highlightBorder,
    marginBottom: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.highlight,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    color: Palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
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
    color: Palette.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: Palette.highlight,
    fontSize: 14,
    fontWeight: '700',
  },
});