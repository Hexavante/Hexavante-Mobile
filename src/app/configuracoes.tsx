import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Save,
  Settings,
  Shield,
  User,
} from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { usersApi } from '@/lib/features';
import type { UserProfile } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Radius, Spacing, shadow } from '@/constants/theme';

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

function fromISODate(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}

export default function ConfiguracoesScreen() {
  const { signOut } = useAuth();
  const token = useToken();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    usersApi(token)
      .me()
      .then(({ user }) => {
        setProfile(user);
        setFullName(user.fullName);
        setUsername(user.username);
        setBirthDate(fromISODate(user.birthDate));
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível carregar seu perfil.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = useCallback(async () => {
    if (!token || !profile) return;

    if (!fullName.trim()) {
      Alert.alert('Erro', 'O nome completo é obrigatório.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Erro', 'O nome de usuário é obrigatório.');
      return;
    }

    let isoBirthDate: string | undefined;
    if (birthDate.trim()) {
      const iso = toISODate(birthDate);
      if (!iso) {
        Alert.alert('Erro', 'Data de nascimento inválida. Use DD/MM/AAAA.');
        return;
      }
      isoBirthDate = iso;
    }

    setSaving(true);
    try {
      const { user } = await usersApi(token).update({
        fullName: fullName.trim(),
        username: username.trim(),
        birthDate: isoBirthDate,
      });
      setBirthDate(fromISODate(user.birthDate));
      setProfile(user);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  }, [token, profile, fullName, username, birthDate]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  }, [signOut]);

  const formatMemberSince = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  if (loading) return <Loading label="Carregando configurações..." />;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ArrowLeft size={20} color={Palette.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Settings size={18} color={Palette.highlight} />
          <Text style={styles.title}>Configurações</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={16} color={Palette.highlight} />
          <Text style={styles.sectionTitle}>Dados pessoais</Text>
        </View>

        <View style={styles.field}>
          <Input
            label="Nome completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.field}>
          <Input
            label="Nome de usuário"
            value={username}
            onChangeText={setUsername}
            placeholder="@usuario"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.field}>
          <Input
            label="Data de nascimento"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="DD/MM/AAAA"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <Button
          variant="primary"
          size="md"
          label="Salvar alterações"
          loading={saving}
          onPress={() => void handleSave()}
          style={{ marginTop: Spacing.sm }}
        >
          <Save size={16} color="#062033" />
        </Button>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Mail size={16} color={Palette.sky} />
          <Text style={styles.sectionTitle}>Conta</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{profile?.email ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membro desde</Text>
          <Text style={styles.infoValue}>
            {profile?.createdAt ? formatMemberSince(profile.createdAt) : '—'}
          </Text>
        </View>
      </Card>

      {profile?.twoFactorEnabled && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={16} color={Palette.emerald} />
            <Text style={styles.sectionTitle}>Segurança</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Autenticação em duas etapas</Text>
            <Text style={[styles.infoValue, { color: Palette.emerald }]}>Ativada</Text>
          </View>
        </Card>
      )}

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={16} color={Palette.violet} />
          <Text style={styles.sectionTitle}>Plano e moedas</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Moedas</Text>
          <Text style={[styles.infoValue, { color: Palette.amber }]}>
            {profile?.coins ?? 0}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plano</Text>
          <Text style={styles.infoValue}>
            {profile?.isPremium ? 'Premium' : 'Gratuito'}
          </Text>
        </View>
      </Card>

      <Button
        variant="danger"
        size="lg"
        label="Sair da conta"
        onPress={handleSignOut}
        style={{ marginTop: Spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  field: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
});
