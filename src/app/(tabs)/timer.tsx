import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { useNow } from '@/hooks/useNow';
import { getTimerSeconds } from '@/services/progress';
import { formatClock, formatDuration } from '@/utils/time';

export default function TimerScreen() {
  const { ready, busy, error, topics, timer, begin, pause, resume, finish, discard, saveSession, dismissError } = useStudy();
  const now = useNow();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string | undefined>();
  const [exerciseCount, setExerciseCount] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
  const [notes, setNotes] = useState('');
  const [validation, setValidation] = useState<string | null>(null);


  if (!ready) return <View style={styles.page}><Text style={styles.muted}>Cargando cronómetro…</Text></View>;
  if (timer?.mode === 'mock') return <View style={[styles.page, styles.mockRedirect]}><Text style={styles.prompt}>Simulacro en curso</Text><Text style={styles.muted}>El cronómetro del simulacro se controla desde su pantalla.</Text><PrimaryButton label="VER SIMULACRO" onPress={() => router.push('/mocks')} /></View>;
  const selectedTopic = topics.find((topic) => topic.id === topicId);
  const activeTopic = topics.find((topic) => topic.id === timer?.topicId);
  const activeSubtopic = activeTopic?.subtopics.find((subtopic) => subtopic.id === timer?.subtopicId);

  const submit = async () => {
    const exercises = exerciseCount.trim() === '' ? undefined : Number(exerciseCount);
    const correct = correctCount.trim() === '' ? undefined : Number(correctCount);
    if ((exercises !== undefined && (!Number.isInteger(exercises) || exercises < 0)) ||
      (correct !== undefined && (!Number.isInteger(correct) || correct < 0 || exercises === undefined || correct > exercises))) {
      setValidation('Revisá los ejercicios: los correctos deben estar entre 0 y el total.');
      return;
    }
    setValidation(null);
    await saveSession({ exerciseCount: exercises, correctExerciseCount: correct, difficulty, notes: notes.trim() || undefined });
  };

  const confirmDiscard = () => {
    Alert.alert('Descartar sesión', 'Se perderá solo el cronómetro actual. No se modificará el historial.', [
      { text: 'Conservar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => { void discard(); } },
    ]);
  };

  const confirmFinish = () => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm('¿Terminar esta sesión?')) void finish();
    } else {
      Alert.alert('Terminar sesión', 'Se detendrá el tiempo y podrás añadir tus resultados.', [
        { text: 'Seguir estudiando', style: 'cancel' },
        { text: 'Terminar', onPress: () => { void finish(); } },
      ]);
    }
  };

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.heading}>{timer?.finishedAt ? 'SESIÓN COMPLETADA' : timer ? 'EN ESTUDIO' : 'INICIAR ESTUDIO'}</Text>
    {error && <Text onPress={dismissError} style={styles.error}>{error} · Tocar para cerrar</Text>}
    {!timer && <>
      <Text style={styles.prompt}>¿Qué vas a estudiar?</Text>
      <Text style={styles.muted}>Elegí un tema. El subtema es opcional.</Text>
      <View style={styles.choices}>{topics.map((topic) => <Pressable key={topic.id} onPress={() => { setTopicId(topic.id); setSubtopicId(undefined); }} style={[styles.choice, topicId === topic.id && styles.selected]}>
        <Text style={[styles.choiceText, topicId === topic.id && styles.selectedText]}>{topic.name}</Text>
        <Text style={styles.choiceMeta}>{topic.targetMinutes / 60} h de objetivo</Text>
      </Pressable>)}</View>
      {selectedTopic && <StudyCard>
        <Text style={styles.sectionTitle}>SUBTEMA</Text>
        <View style={styles.chips}>{selectedTopic.subtopics.map((subtopic) => <Pressable key={subtopic.id} onPress={() => setSubtopicId(subtopicId === subtopic.id ? undefined : subtopic.id)} style={[styles.chip, subtopicId === subtopic.id && styles.chipSelected]}><Text style={[styles.chipText, subtopicId === subtopic.id && styles.chipTextSelected]}>{subtopic.name}</Text></Pressable>)}</View>
      </StudyCard>}
      <PrimaryButton label="▶ EMPEZAR" disabled={!topicId || busy} onPress={() => { if (topicId) { setExerciseCount(''); setCorrectCount(''); setDifficulty(undefined); setNotes(''); setValidation(null); void begin(topicId, subtopicId); } }} />
    </>}
    {timer && !timer.finishedAt && <>
      <StudyCard>
        <Text style={styles.topic}>{activeTopic?.name.toUpperCase() ?? 'ESTUDIO'}</Text>
        {activeSubtopic && <Text style={styles.subtopic}>{activeSubtopic.name}</Text>}
        <Text style={styles.clock}>{formatClock(getTimerSeconds(timer, now.getTime()))}</Text>
        <Text style={styles.status}>{timer.runningSince ? 'CONTANDO' : 'EN PAUSA'}</Text>
      </StudyCard>
      <PrimaryButton label={timer.runningSince ? 'Ⅱ PAUSAR' : '▶ REANUDAR'} disabled={busy} onPress={() => { void (timer.runningSince ? pause() : resume()); }} />
      <PrimaryButton label="TERMINAR SESIÓN" secondary disabled={busy} onPress={confirmFinish} />
      <Text onPress={confirmDiscard} style={styles.discard}>Descartar inicio accidental</Text>
      <Text style={styles.hint}>Podés bloquear el teléfono o cambiar de aplicación. Al volver, el tiempo se calcula desde la hora guardada.</Text>
    </>}
    {timer?.finishedAt && <>
      <StudyCard>
        <Text style={styles.sectionTitle}>DURACIÓN</Text><Text style={styles.completedTime}>{formatDuration(timer.accumulatedSeconds)}</Text>
        <Text style={styles.muted}>Tema: {activeTopic?.name}</Text>
        {activeSubtopic && <Text style={styles.muted}>Subtema: {activeSubtopic.name}</Text>}
      </StudyCard>
      <StudyCard>
        <Text style={styles.sectionTitle}>RESULTADOS OPCIONALES</Text>
        <Text style={styles.fieldLabel}>Ejercicios realizados</Text>
        <TextInput value={exerciseCount} onChangeText={setExerciseCount} keyboardType="number-pad" placeholder="0" placeholderTextColor={palette.muted} style={styles.input} />
        <Text style={styles.fieldLabel}>Correctos sin ayuda</Text>
        <TextInput value={correctCount} onChangeText={setCorrectCount} keyboardType="number-pad" placeholder="0" placeholderTextColor={palette.muted} style={styles.input} />
        <Text style={styles.fieldLabel}>Dificultad percibida</Text>
        <View style={styles.difficultyRow}>{([1, 2, 3, 4, 5] as const).map((value) => <Pressable key={value} onPress={() => setDifficulty(value === difficulty ? undefined : value)} style={[styles.difficulty, difficulty === value && styles.difficultySelected]}><Text style={[styles.difficultyText, difficulty === value && styles.difficultyTextSelected]}>{value}</Text></Pressable>)}</View>
        <Text style={styles.fieldLabel}>Nota</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline placeholder="¿Qué resolviste o qué quedó difícil?" placeholderTextColor={palette.muted} style={[styles.input, styles.note]} />
        {validation && <Text style={styles.error}>{validation}</Text>}
      </StudyCard>
      <PrimaryButton label="GUARDAR SESIÓN" disabled={busy} onPress={() => { void submit(); }} />
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 34, paddingBottom: 42, gap: 16 },
  heading: { color: palette.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  prompt: { color: palette.text, fontSize: 29, fontWeight: '800', marginTop: 12 },
  muted: { color: palette.muted, fontSize: 14 },
  choices: { gap: 10, marginTop: 12 },
  choice: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 18, padding: 17 },
  selected: { borderColor: palette.accent, backgroundColor: palette.surfaceRaised },
  choiceText: { color: palette.text, fontWeight: '800', fontSize: 17 },
  selectedText: { color: palette.accent },
  choiceMeta: { color: palette.muted, marginTop: 4, fontSize: 12 },
  sectionTitle: { color: palette.muted, fontWeight: '800', letterSpacing: 1.2, fontSize: 12, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 99, backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 12, paddingVertical: 9 },
  chipSelected: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.text, fontSize: 12 },
  chipTextSelected: { color: palette.accentText, fontWeight: '800' },
  topic: { color: palette.accent, fontSize: 15, fontWeight: '900', letterSpacing: 1.2, textAlign: 'center' },
  subtopic: { color: palette.muted, textAlign: 'center', marginTop: 7 },
  clock: { color: palette.text, fontSize: 56, fontVariant: ['tabular-nums'], fontWeight: '800', textAlign: 'center', marginVertical: 44, letterSpacing: -2 },
  status: { color: palette.muted, textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  hint: { color: palette.muted, textAlign: 'center', lineHeight: 20, fontSize: 13 },
  discard: { color: palette.muted, textAlign: 'center', paddingVertical: 8, fontSize: 13, textDecorationLine: 'underline' },
  completedTime: { color: palette.text, fontSize: 38, fontWeight: '800', marginBottom: 10 },
  fieldLabel: { color: palette.text, fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  input: { backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border, borderRadius: 12, color: palette.text, fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
  note: { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 },
  difficultyRow: { flexDirection: 'row', gap: 8 },
  difficulty: { flex: 1, backgroundColor: palette.surfaceRaised, borderColor: palette.border, borderWidth: 1, borderRadius: 12, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  difficultySelected: { backgroundColor: palette.accent, borderColor: palette.accent },
  difficultyText: { color: palette.text, fontWeight: '800' },
  difficultyTextSelected: { color: palette.accentText },
  error: { color: palette.danger, backgroundColor: palette.surfaceRaised, padding: 12, borderRadius: 10 },
  mockRedirect: { padding: 20, paddingTop: 38, gap: 20 },
});
