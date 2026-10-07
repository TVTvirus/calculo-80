import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { useNow } from '@/hooks/useNow';
import { getTimerSeconds } from '@/services/progress';
import { formatClock, formatDuration } from '@/utils/time';

export default function MocksScreen() {
  const { ready, busy, error, timer, mockExams, topics, startMock, pause, resume, finish, discard, saveMockExam, dismissError } = useStudy();
  const now = useNow();
  const [score, setScore] = useState('');
  const [maximumScore, setMaximumScore] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [mainErrors, setMainErrors] = useState('');
  const [notes, setNotes] = useState('');
  const [failedTopicIds, setFailedTopicIds] = useState<string[]>([]);
  const [validation, setValidation] = useState<string | null>(null);
  const activeMock = timer?.mode === 'mock' ? timer : null;
  const elapsed = activeMock ? getTimerSeconds(activeMock, now.getTime()) : 0;
  const target = activeMock?.targetSeconds ?? 7200;

  useEffect(() => {
    if (activeMock?.runningSince && !activeMock.finishedAt && elapsed >= target) void finish();
  }, [activeMock, elapsed, target, finish]);

  const submit = async () => {
    const gotScore = score.trim() ? Number(score.replace(',', '.')) : undefined;
    const maximum = maximumScore.trim() ? Number(maximumScore.replace(',', '.')) : undefined;
    const count = exerciseCount.trim() ? Number(exerciseCount) : undefined;
    if ((gotScore !== undefined && (!Number.isFinite(gotScore) || gotScore < 0)) ||
      (maximum !== undefined && (!Number.isFinite(maximum) || maximum <= 0)) ||
      (gotScore === undefined) !== (maximum === undefined) ||
      (gotScore !== undefined && maximum !== undefined && gotScore > maximum) ||
      (count !== undefined && (!Number.isInteger(count) || count < 0))) {
      setValidation('Revisá la nota, el máximo y la cantidad de ejercicios.');
      return;
    }
    setValidation(null);
    await saveMockExam({ score: gotScore, maximumScore: maximum, exerciseCount: count, failedTopicIds, mainErrors: mainErrors.trim() || undefined, notes: notes.trim() || undefined });
  };
  const confirmFinish = () => Alert.alert('Terminar simulacro', 'Se guardará el tiempo practicado y podrás anotar la puntuación.', [
    { text: 'Continuar', style: 'cancel' },
    { text: 'Terminar', onPress: () => { void finish(); } },
  ]);
  const confirmDiscard = () => Alert.alert('Descartar simulacro', 'Se perderá solo el cronómetro actual.', [
    { text: 'Conservar', style: 'cancel' },
    { text: 'Descartar', style: 'destructive', onPress: () => { void discard(); } },
  ]);

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← MÁS</Text></Pressable>
    <Text style={styles.heading}>SIMULACROS</Text>
    {error && <Text onPress={dismissError} style={styles.error}>{error}</Text>}
    {!ready && <Text style={styles.muted}>Cargando…</Text>}
    {ready && !timer && <StudyCard>
      <Text style={styles.kicker}>PRÁCTICA CRONOMETRADA</Text>
      <Text style={styles.bigNumber}>120 min</Text>
      <Text style={styles.muted}>Cuenta regresiva. Podés pausar; el tiempo se recupera al reabrir la app. Al terminar, anotá tu puntuación y los temas que fallaron.</Text>
      <View style={styles.button}><PrimaryButton label="▶ INICIAR SIMULACRO" disabled={busy} onPress={() => { void startMock(); }} /></View>
    </StudyCard>}
    {ready && timer && !activeMock && <StudyCard><Text style={styles.muted}>Hay una sesión de estudio en curso. Terminála o pausála antes de iniciar un simulacro.</Text><View style={styles.button}><PrimaryButton label="IR AL TIMER" onPress={() => router.push('/(tabs)/timer')} /></View></StudyCard>}
    {activeMock && !activeMock.finishedAt && <>
      <StudyCard><Text style={styles.kicker}>TIEMPO RESTANTE</Text><Text style={styles.clock}>{formatClock(Math.max(0, target - elapsed))}</Text><Text style={styles.status}>{activeMock.runningSince ? 'EN CURSO' : 'EN PAUSA'}</Text></StudyCard>
      <PrimaryButton label={activeMock.runningSince ? 'Ⅱ PAUSAR' : '▶ REANUDAR'} disabled={busy} onPress={() => { void (activeMock.runningSince ? pause() : resume()); }} />
      <PrimaryButton label="TERMINAR ANTES" secondary disabled={busy} onPress={confirmFinish} />
      <Pressable onPress={confirmDiscard}><Text style={styles.discard}>Descartar inicio accidental</Text></Pressable>
    </>}
    {activeMock?.finishedAt && <>
      <StudyCard><Text style={styles.kicker}>SIMULACRO TERMINADO</Text><Text style={styles.bigNumber}>{formatDuration(activeMock.accumulatedSeconds)}</Text><Text style={styles.muted}>Registrá tus resultados. Este tiempo también contará en las 80 horas.</Text></StudyCard>
      <StudyCard>
        <Text style={styles.label}>PUNTUACIÓN OBTENIDA</Text><TextInput value={score} onChangeText={setScore} keyboardType="decimal-pad" placeholder="Ej. 72" placeholderTextColor={palette.muted} style={styles.input} />
        <Text style={styles.label}>PUNTUACIÓN MÁXIMA</Text><TextInput value={maximumScore} onChangeText={setMaximumScore} keyboardType="decimal-pad" placeholder="Ej. 100" placeholderTextColor={palette.muted} style={styles.input} />
        <Text style={styles.label}>EJERCICIOS</Text><TextInput value={exerciseCount} onChangeText={setExerciseCount} keyboardType="number-pad" placeholder="Opcional" placeholderTextColor={palette.muted} style={styles.input} />
        <Text style={styles.label}>ERRORES PRINCIPALES</Text><TextInput value={mainErrors} onChangeText={setMainErrors} multiline placeholder="¿Dónde te trabaste?" placeholderTextColor={palette.muted} style={[styles.input, styles.notes]} />
        <Text style={styles.label}>TEMAS QUE FALLARON</Text><View style={styles.chips}>{topics.filter((topic) => topic.id !== 'simulacros').map((topic) => <Pressable key={topic.id} onPress={() => setFailedTopicIds((current) => current.includes(topic.id) ? current.filter((id) => id !== topic.id) : [...current, topic.id])} style={[styles.chip, failedTopicIds.includes(topic.id) && styles.selected]}><Text style={[styles.chipText, failedTopicIds.includes(topic.id) && styles.selectedText]}>{topic.name}</Text></Pressable>)}</View>
        <Text style={styles.label}>NOTA</Text><TextInput value={notes} onChangeText={setNotes} multiline placeholder="Qué repetirías en el próximo" placeholderTextColor={palette.muted} style={[styles.input, styles.notes]} />
        {validation && <Text style={styles.error}>{validation}</Text>}
      </StudyCard>
      <PrimaryButton label="GUARDAR SIMULACRO" disabled={busy} onPress={() => { void submit(); }} />
    </>}
    <Text style={styles.section}>EVOLUCIÓN</Text>
    {mockExams.length === 0 && <Text style={styles.muted}>Todavía no hay simulacros guardados.</Text>}
    {[...mockExams].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map((exam) => <StudyCard key={exam.id}>
      <Text style={styles.examDate}>{new Date(exam.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <Text style={styles.examScore}>{exam.score !== undefined && exam.maximumScore !== undefined ? `${exam.score} / ${exam.maximumScore}` : 'Sin puntuación'} · {formatDuration(exam.durationSeconds)}</Text>
      {exam.score !== undefined && exam.maximumScore ? <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, exam.score / exam.maximumScore * 100)}%` }]} /></View> : null}
      {exam.mainErrors && <Text style={styles.muted}>{exam.mainErrors}</Text>}
    </StudyCard>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 60, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 30, fontWeight: '900' },
  kicker: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  bigNumber: { color: palette.text, fontSize: 48, fontWeight: '900', marginVertical: 12 },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  button: { marginTop: 18 },
  clock: { color: palette.text, fontSize: 56, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center', marginVertical: 30 },
  status: { color: palette.muted, textAlign: 'center', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  discard: { color: palette.muted, textAlign: 'center', padding: 12, textDecorationLine: 'underline' },
  label: { color: palette.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 15, marginBottom: 8 },
  input: { color: palette.text, backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border, borderRadius: 12, minHeight: 48, paddingHorizontal: 12, fontSize: 16 },
  notes: { minHeight: 92, textAlignVertical: 'top', paddingTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  selected: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.text, fontSize: 12 },
  selectedText: { color: palette.accentText, fontWeight: '800' },
  error: { color: palette.danger, padding: 12, backgroundColor: palette.surfaceRaised, borderRadius: 10 },
  section: { color: palette.text, fontSize: 18, fontWeight: '900', marginTop: 10 },
  examDate: { color: palette.accent, fontSize: 12, fontWeight: '900' },
  examScore: { color: palette.text, fontSize: 20, fontWeight: '800', marginTop: 10 },
  track: { backgroundColor: palette.surfaceRaised, borderRadius: 8, height: 8, marginTop: 12, overflow: 'hidden' },
  fill: { backgroundColor: palette.accent, height: '100%' },
});
