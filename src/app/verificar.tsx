import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Hash, Search, ShieldCheck, XCircle } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { api } from '@/lib/api';
import type { VerifiedCertificate } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Radius, Spacing } from '@/constants/theme';

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function VerificarScreen() {
  const token = useToken();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setErrorMsg('Informe o código do certificado.');
      setResult(null);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    try {
      const res = await api<{ success: boolean; certificate: VerifiedCertificate }>(
        `/api/v1/certificates/verify/${encodeURIComponent(trimmed)}`,
        { token },
      );
      if (res.success && res.certificate) {
        setResult(res.certificate);
      } else {
        setErrorMsg('Código inválido ou não encontrado');
      }
    } catch {
      setErrorMsg('Código inválido ou não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const issuedAt = formatDate(result?.issuedAt);
  const holderName = result?.fullName ?? result?.userName ?? null;

  return (
    <Screen contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <ArrowLeft size={20} color={Palette.text} />
          </Pressable>
          <Text style={styles.title}>Verificar</Text>
        </View>
        <Text style={styles.subtitle}>Valide a autenticidade de um certificado</Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.formCard}>
          <Input
            label="Código do certificado"
            placeholder="HXV-XXXXXX"
            autoCapitalize="characters"
            autoCorrect={false}
            value={code}
            onChangeText={setCode}
            onSubmitEditing={handleVerify}
            returnKeyType="search"
          />
          <Button label="Verificar" loading={loading} onPress={handleVerify}>
            {!loading ? <Search size={18} color="#062033" /> : null}
          </Button>
        </Card>

        {result ? (
          <Card style={styles.successCard}>
            <View style={styles.successHeader}>
              <View style={styles.successIcon}>
                <ShieldCheck size={22} color={Palette.emerald} />
              </View>
              <Text style={styles.successTitle}>Certificado válido</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.certTitle}>{result.title}</Text>
            {holderName ? <Text style={styles.certName}>{holderName}</Text> : null}
            <View style={styles.certMeta}>
              {issuedAt ? (
                <View style={styles.metaRow}>
                  <Calendar size={13} color={Palette.textSubtle} />
                  <Text style={styles.meta}>{issuedAt}</Text>
                </View>
              ) : null}
              {result.code ?? code.trim() ? (
                <View style={styles.codeBadge}>
                  <Hash size={12} color={Palette.emerald} />
                  <Text style={styles.code}>{result.code ?? code.trim()}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <XCircle size={18} color={Palette.red} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: Spacing.xs,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  formCard: {
    gap: Spacing.md,
  },
  successCard: {
    gap: Spacing.md,
    borderColor: 'rgba(52,211,153,0.4)',
    backgroundColor: 'rgba(52,211,153,0.06)',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.emerald,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 20,
  },
  certName: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  certMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: Palette.textSubtle,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.emerald,
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#fca5a5',
  },
});
