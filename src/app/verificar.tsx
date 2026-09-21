import { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Calendar, Hash, Search, ShieldCheck, XCircle } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { api } from '@/lib/api';
import type { VerifiedCertificate } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function VerificarScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();
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
      <PageHeader title="Verificar" subtitle="Valide a autenticidade de um certificado" />

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
                <ShieldCheck size={22} color={P.emerald} />
              </View>
              <Text style={styles.successTitle}>Certificado válido</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.certTitle}>{result.title}</Text>
            {holderName ? <Text style={styles.certName}>{holderName}</Text> : null}
            <View style={styles.certMeta}>
              {issuedAt ? (
                <View style={styles.metaRow}>
                  <Calendar size={13} color={P.textSubtle} />
                  <Text style={styles.meta}>{issuedAt}</Text>
                </View>
              ) : null}
              {result.code ?? code.trim() ? (
                <View style={styles.codeBadge}>
                  <Hash size={12} color={P.emerald} />
                  <Text style={styles.code}>{result.code ?? code.trim()}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <XCircle size={18} color={P.red} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
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
    color: P.emerald,
  },
  divider: {
    height: 1,
    backgroundColor: P.border,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
    lineHeight: 20,
  },
  certName: {
    fontSize: 13,
    color: P.textMuted,
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
    color: P.textSubtle,
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
    color: P.emerald,
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
}
