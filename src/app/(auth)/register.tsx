import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { VerifyCodeForm } from '@/components/auth/verify-code';
import { Palette, Radius } from '@/constants/theme';

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
  const { signUp, pendingVerification } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !username.trim() || !birthDate.trim() || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      setError('Usuário: 3 a 30 caracteres, só letras, números e _.');
      return;
    }
    const iso = toISODate(birthDate);
    if (!iso) {
      setError('Data de nascimento inválida. Use DD/MM/AAAA.');
      return;
    }
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
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
          <Image
            source={require('@/assets/images/hexavante-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Comece a estudar na Hexavante</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <VerifyCodeForm />
          ) : (
            <>
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
            </>
          )}
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
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