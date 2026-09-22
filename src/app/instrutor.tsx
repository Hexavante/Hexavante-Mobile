import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { BookOpen, Clock, GraduationCap, Send } from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { instructorApi } from '@/lib/features';
import { success } from '@/lib/haptics';
import type { InstructorCourse } from '@/lib/types';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';

export default function InstrutorScreen() {
  const P = usePalette();
  const styles = useMemo(() => makeStyles(P), [P]);
  const token = useToken();

  const [isInstructor, setIsInstructor] = useState(false);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    instructorApi(token)
      .status()
      .then((res) => {
        const instructor = !!res?.isInstructor;
        const isPending = !!res?.pending;
        setIsInstructor(instructor);
        setPending(isPending);
        setError(false);
        if (instructor) {
          return instructorApi(token)
            .courses()
            .then((cres) => {
              const raw = cres as unknown as InstructorCourse[] | { data?: InstructorCourse[] };
              setCourses(Array.isArray(raw) ? raw : (raw?.data ?? []));
            });
        }
        return undefined;
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoaded(true);
        setRefreshing(false);
      });
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = useCallback(() => {
    if (!token || submitting) return;
    setSubmitting(true);
    instructorApi(token)
      .apply(motivation.trim() || undefined)
      .then(() => {
        void success();
        setPending(true);
        Alert.alert('Sucesso', 'Solicitação enviada! Avisaremos quando for analisada.');
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível enviar a solicitação. Tente novamente.');
      })
      .finally(() => setSubmitting(false));
  }, [token, motivation, submitting]);

  if (error && !loaded) {
    return (
      <Screen>
        <EmptyState
          icon={GraduationCap}
          title="Não foi possível carregar"
          description="Verifique sua conexão e tente novamente."
        />
      </Screen>
    );
  }

  if (!loaded) return <Loading label="Carregando área do instrutor..." />;

  if (pending && !isInstructor) {
    return (
      <Screen refreshing={refreshing} onRefresh={load}>
        <EmptyState
          icon={Clock}
          title="Solicitação em análise"
          description="Seu pedido para ser instrutor está sendo avaliado. Avisaremos em breve."
        />
      </Screen>
    );
  }

  if (isInstructor) {
    return (
      <Screen scrollable={false} contentContainerStyle={{ padding: 0 }}>
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={P.highlight} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Meus cursos</Text>
              <Text style={styles.subtitle}>
                {courses.length === 0
                  ? 'Nenhum curso vinculado'
                  : `${courses.length} ${courses.length === 1 ? 'curso' : 'cursos'}`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={BookOpen}
              title="Nenhum curso vinculado"
              description="Quando você tiver cursos como instrutor, eles aparecerão aqui."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.courseCard}>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.status ? (
                <View style={styles.statusChip}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              ) : null}
            </Card>
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={load}>
      <View style={styles.header}>
        <Text style={styles.title}>Seja instrutor</Text>
        <Text style={styles.subtitle}>Compartilhe seu conhecimento com a comunidade</Text>
      </View>
      <Card style={styles.applyCard}>
        <View style={styles.iconBox}>
          <GraduationCap size={26} color={P.highlight} />
        </View>
        <Text style={styles.applyTitle}>Ensine na Hexavante</Text>
        <Text style={styles.applyDesc}>
          Conte um pouco sobre sua experiência e motivação. Nossa equipe vai analisar seu pedido e
          retornar em breve.
        </Text>
        <TextInput
          style={styles.textarea}
          placeholder="Por que você quer ser instrutor? (opcional)"
          placeholderTextColor={P.textSubtle}
          value={motivation}
          onChangeText={setMotivation}
          multiline
          textAlignVertical="top"
        />
        <Button size="lg" label="Solicitar" loading={submitting} onPress={handleApply}>
          {!submitting ? <Send size={16} color="#062033" /> : null}
        </Button>
      </Card>
    </Screen>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingTop: 8,
      paddingBottom: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: P.text,
    },
    subtitle: {
      fontSize: 13,
      color: P.textMuted,
      marginTop: 2,
    },
    applyCard: {
      gap: 12,
      alignItems: 'stretch',
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: P.highlightSoft,
      borderWidth: 1,
      borderColor: P.highlightBorder,
    },
    applyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: P.text,
    },
    applyDesc: {
      fontSize: 13,
      color: P.textMuted,
      lineHeight: 19,
    },
    textarea: {
      minHeight: 120,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: P.border,
      backgroundColor: 'rgba(255,255,255,0.04)',
      padding: 12,
      color: P.text,
      fontSize: 14,
      lineHeight: 21,
      textAlignVertical: 'top',
    },
    courseCard: {
      gap: 8,
    },
    courseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: P.text,
    },
    statusChip: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: P.highlightBorder,
      backgroundColor: P.highlightSoft,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      color: P.highlight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}
