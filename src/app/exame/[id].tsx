import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  FileCheck,
  Layers,
  Trophy,
} from 'lucide-react-native';

import { useToken } from '@/hooks/use-token';
import { api } from '@/lib/api';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing } from '@/constants/theme';

type Alternative = { id: string; text: string };
type Question = {
  id: string;
  statement: string;
  imageUrl?: string;
  orderNumber: number;
  points: number;
  type: string;
  subject: string;
  alternatives: Alternative[];
};
type Attempt = {
  attemptId: string;
  examId: string;
  title: string;
  timeLimit: number | null;
  startedAt: string;
  questions: Question[];
};
type Result = {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  finishedAt: string;
};

type ExamInfo = {
  title: string;
  description?: string | null;
  questionCount: number;
  timeLimit: number | null;
  examType: string;
};

type Mode = 'preview' | 'exam' | 'results';

export default function ExameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useToken();

  const [mode, setMode] = useState<Mode>('preview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // null = prova sem limite de tempo (timer oculto)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(0);
  const [result, setResult] = useState<Result | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id || mode !== 'preview') return;
    setLoading(true);
    api<{ exam: ExamInfo }>(`/api/v1/exams/${id}`, { token })
      .then((res) => {
        setExam(res.exam);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, token, mode]);

  useEffect(() => {
    if (mode !== 'exam' || secondsLeft === null || secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // timeout: envia direto, sem confirmação — via ref para evitar stale closure
          void submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, secondsLeft !== null && secondsLeft > 0]);

  const handleStart = useCallback(async () => {
    if (!id || !token) return;
    setStarting(true);
    try {
      const data = await api<Attempt>(`/api/v1/exams/${id}/start`, {
        method: 'POST',
        token,
      });
      setAttempt(data);
      setCurrentIndex(0);
      setAnswers({});
      setSecondsLeft(data.timeLimit != null ? data.timeLimit * 60 : null);
      setMode('exam');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao iniciar';
      Alert.alert('Erro', msg);
    } finally {
      setStarting(false);
    }
  }, [id, token]);

  // Envio direto, sem confirmação (usado no timeout do timer)
  const doSubmit = useCallback(async () => {
    if (!attempt || !token) return false;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const payload = {
        attemptId: attempt.attemptId,
        answers: attempt.questions.map((q) => ({
          questionId: q.id,
          alternativeId: answers[q.id] ?? undefined,
        })),
      };
      const res = await api<Result>('/api/v1/exams/submit', {
        method: 'POST',
        body: payload,
        token,
      });
      setResult(res);
      setMode('results');
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao enviar';
      Alert.alert('Erro', msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [attempt, answers, token]);

  // Ref sempre atualizada para o timer chamar o submit mais recente
  const submitRef = useRef(doSubmit);
  submitRef.current = doSubmit;

  const handleSubmit = useCallback(async () => {
    if (!attempt || submitting) return;
    const unanswered = attempt.questions.length - Object.keys(answers).length;
    const label =
      unanswered > 0
        ? `Você não respondeu ${unanswered} questão(ões). Enviar mesmo assim?`
        : 'Confirmar envio do simulado?';

    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert('Enviar simulado', label, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Enviar', onPress: () => resolve(true) },
      ]);
    });
    if (!confirmed) return;

    await doSubmit();
  }, [attempt, answers, submitting, doSubmit]);

  const selectAlternative = useCallback((questionId: string, altId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: altId }));
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon={FileCheck}
          title="Simulado não encontrado"
          description="Ele pode ter sido removido ou atualizado."
        />
      </Screen>
    );
  }

  if (loading) return <Loading label="Carregando simulado..." />;

  if (mode === 'results' && result) {
    return (
      <Screen contentContainerStyle={styles.centerContent}>
        <View style={styles.resultsIcon}>
          <Trophy size={36} color={Palette.amber} />
        </View>
        <Text style={styles.resultsTitle}>Resultado</Text>

        <Card style={styles.resultsCard}>
          <Text style={styles.percentage}>{result.percentage.toFixed(1)}%</Text>
          <Text style={styles.scoreLabel}>Pontuação: {result.score.toFixed(1)}</Text>

          <View style={styles.resultsRow}>
            <View style={styles.resultStat}>
              <CheckCircle size={18} color={Palette.emerald} />
              <Text style={styles.resultStatValue}>{result.correctAnswers}</Text>
              <Text style={styles.resultStatLabel}>acertos</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultStat}>
              <Circle size={18} color={Palette.textMuted} />
              <Text style={styles.resultStatValue}>{result.totalQuestions}</Text>
              <Text style={styles.resultStatLabel}>total</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultStat}>
              <FileCheck size={18} color={Palette.violet} />
              <Text style={styles.resultStatValue}>
                {result.totalQuestions - result.correctAnswers}
              </Text>
              <Text style={styles.resultStatLabel}>erros</Text>
            </View>
          </View>
        </Card>

        <Button
          label="Voltar"
          variant="secondary"
          size="lg"
          onPress={() => setMode('preview')}
          style={styles.backBtn}
        />
      </Screen>
    );
  }

  if (mode === 'exam' && attempt) {
    const q = attempt.questions[currentIndex];
    const total = attempt.questions.length;
    const timerColor =
      secondsLeft === null
        ? Palette.text
        : secondsLeft < 60
          ? Palette.red
          : secondsLeft < 300
            ? Palette.amber
            : Palette.text;

    return (
      <View style={styles.examRoot}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {attempt.title}
          </Text>
          {secondsLeft !== null ? (
            <View style={styles.timerBadge}>
              <Clock size={14} color={timerColor} />
              <Text style={[styles.timerText, { color: timerColor }]}>
                {formatTime(secondsLeft)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {currentIndex + 1}/{total}
        </Text>

        <Screen contentContainerStyle={styles.questionScroll}>
          {q.imageUrl ? (
            <Image source={{ uri: q.imageUrl }} style={styles.questionImage} resizeMode="contain" />
          ) : null}

          <Text style={styles.questionStatement}>{q.statement}</Text>

          <View style={styles.subjectRow}>
            <Text style={styles.subjectTag}>{q.subject}</Text>
            <Text style={styles.pointsTag}>{q.points} {q.points === 1 ? 'ponto' : 'pontos'}</Text>
          </View>

          <View style={styles.alternatives}>
            {q.alternatives.map((alt) => {
              const selected = answers[q.id] === alt.id;
              return (
                <Pressable
                  key={alt.id}
                  onPress={() => selectAlternative(q.id, alt.id)}
                  style={[styles.altBtn, selected && styles.altSelected]}
                >
                  {selected ? (
                    <CheckCircle size={20} color={Palette.highlight} />
                  ) : (
                    <Circle size={20} color={Palette.textMuted} />
                  )}
                  <Text style={[styles.altText, selected && styles.altTextSelected]}>
                    {alt.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Screen>

        <View style={styles.bottomBar}>
          <Button
            variant="ghost"
            size="md"
            label="Anterior"
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((i) => i - 1)}
            style={styles.navBtn}
          >
            <ArrowLeft size={16} color={Palette.textMuted} />
          </Button>

          {currentIndex === total - 1 ? (
            <Button
              variant="primary"
              size="md"
              label="Enviar"
              loading={submitting}
              onPress={() => void handleSubmit()}
              style={styles.navBtn}
            >
              <CheckCircle size={16} color="#062033" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              label="Próxima"
              onPress={() => setCurrentIndex((i) => i + 1)}
              style={styles.navBtn}
            >
              <ArrowRight size={16} color={Palette.text} />
            </Button>
          )}
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <FileCheck size={26} color={Palette.violet} />
        </View>
        <Text style={styles.title}>{exam?.title ?? 'Simulado'}</Text>
        <Text style={styles.subtitle}>
          {exam
            ? `${exam.questionCount} questões${exam.timeLimit != null ? ` · ${exam.timeLimit} min` : ' · sem limite de tempo'}`
            : 'Inicie para ver as questões'}
        </Text>
        {exam?.description ? (
          <Text style={styles.description} numberOfLines={4}>
            {exam.description}
          </Text>
        ) : null}
      </View>

      <Button
        label="Iniciar simulado"
        size="lg"
        loading={starting}
        onPress={() => void handleStart()}
        style={styles.startBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: Palette.textSubtle,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },
  startBtn: {
    marginTop: 4,
  },

  examRoot: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    marginRight: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressOuter: {
    height: 3,
    marginHorizontal: 16,
    borderRadius: 2,
    backgroundColor: Palette.skeleton,
  },
  progressInner: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Palette.highlight,
  },
  progressLabel: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  questionScroll: {
    paddingBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.md,
    marginBottom: 12,
    backgroundColor: Palette.skeleton,
  },
  questionStatement: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.violet,
    backgroundColor: 'rgba(167,139,250,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  pointsTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.highlight,
    backgroundColor: Palette.highlightSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  alternatives: {
    gap: 10,
  },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    padding: 14,
  },
  altSelected: {
    backgroundColor: Palette.highlightSoft,
    borderColor: Palette.highlightBorder,
  },
  altText: {
    flex: 1,
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 20,
  },
  altTextSelected: {
    color: Palette.text,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  navBtn: {
    minWidth: 120,
  },

  centerContent: {
    alignItems: 'center',
    paddingTop: 32,
  },
  resultsIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.28)',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
    marginBottom: 20,
  },
  resultsCard: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  percentage: {
    fontSize: 40,
    fontWeight: '900',
    color: Palette.highlight,
  },
  scoreLabel: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 4,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  resultStat: {
    alignItems: 'center',
    gap: 4,
  },
  resultStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  resultStatLabel: {
    fontSize: 11,
    color: Palette.textSubtle,
  },
  resultDivider: {
    width: 1,
    height: 32,
    backgroundColor: Palette.border,
  },
  backBtn: {
    marginTop: 20,
    width: '100%',
  },
});
