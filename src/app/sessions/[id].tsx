import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { parseSessionForm, type SessionFormValues } from '@/services/sessionEditing';
import { localDateKey } from '@/utils/time';

function initialForm(): SessionFormValues {
  const start = new Date(Date.now() - 60 * 60000);
  return { topicId: '', date: localDateKey(start), startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`, durationMinutes: '60', exerciseCount: '', correctExerciseCount: '', notes: '' };
}

export default function SessionEditorScreen() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const { ready, busy, error, topics, sessions, mockExams, addManualSession, editSession, deleteSession, dismissError } = useStudy();
  const original = sessions.find((session) => session.id === id);
  const isMock = mockExams.some((exam) => exam.id === id);
  const [draft, setDraft] = useState<{ id: string; values: SessionFormValues } | null>(null);
  const [showSubtopics, setShowSubtopics] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const start = original ? new Date(original.startTime) : null;
  const blankForm = initialForm();
  const form = draft?.id === id ? draft.values : original && start ? { topicId: original.topicId, subtopicId: original.subtopicId, date: localDateKey(start), startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`, durationMinutes: String(Math.max(1, Math.round(original.durationSeconds / 60))), exerciseCount: original.exerciseCount?.toString() ?? '', correctExerciseCount: original.correctExerciseCount?.toString() ?? '', difficulty: original.difficulty, notes: original.notes ?? '' } : { ...blankForm, topicId: topics[0]?.id ?? '', date: date ?? blankForm.date };
  const update = <K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) => setDraft({ id, values: { ...form, [key]: value } });
  const selectedTopic = topics.find((topic) => topic.id === form.topicId);
  const save = async () => {
    if (!selectedTopic) { setValidation('Elegí un tema.'); return; }
    try {
      const session = parseSessionForm(form, original);
      setValidation(null);
      const saved = original ? await editSession(session) : await addManualSession(session);
      if (saved) router.back();
    } catch (cause) { setValidation(cause instanceof Error ? cause.message : String(cause)); }
  };
  const confirmDelete = () => Alert.alert('Eliminar sesión', `Se restarán sus minutos y ejercicios del progreso.${isMock ? ' También se eliminará la puntuación del simulacro.' : ''} Esta acción no se puede deshacer.`, [
    { text: 'Conservar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => { if (original) void deleteSession(original.id).then((deleted) => { if (deleted) router.back(); }); } },
  ]);

  if (id !== 'new' && ready && !original) return <View style={styles.page}><Text style={styles.heading}>Sesión no encontrada</Text></View>;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← HISTORIAL</Text></Pressable>
    <Text style={styles.heading}>{original ? 'EDITAR SESIÓN' : 'SESIÓN MANUAL'}</Text>
    <Text style={styles.hint}>Si cambiás la hora o la duración, la sesión se guardará como un tramo continuo. Los ejercicios y las notas son opcionales.</Text>
    <StudyCard>
      <Text style={styles.label}>TEMA</Text>
      {isMock && <Text style={styles.hint}>Los simulacros permanecen en su propio tema.</Text>}
      <View style={styles.chips}>{topics.filter((topic) => !isMock || topic.id === 'simulacros').map((topic) => <Pressable key={topic.id} onPress={() => setDraft({ id, values: { ...form, topicId: topic.id, subtopicId: undefined } })} style={[styles.chip, form.topicId === topic.id && styles.selected]}><Text style={[styles.chipText, form.topicId === topic.id && styles.selectedText]}>{topic.name}</Text></Pressable>)}</View>
      {selectedTopic && <><Pressable onPress={() => setShowSubtopics((shown) => !shown)}><Text style={styles.subtopicToggle}>{showSubtopics ? 'OCULTAR SUBTEMAS' : `SUBTEMA OPCIONAL${form.subtopicId ? ` · ${selectedTopic.subtopics.find((subtopic) => subtopic.id === form.subtopicId)?.name ?? ''}` : ''}  ▾`}</Text></Pressable>{showSubtopics && <View style={styles.chips}>{selectedTopic.subtopics.map((subtopic) => <Pressable key={subtopic.id} onPress={() => update('subtopicId', form.subtopicId === subtopic.id ? undefined : subtopic.id)} style={[styles.chip, form.subtopicId === subtopic.id && styles.selected]}><Text style={[styles.chipText, form.subtopicId === subtopic.id && styles.selectedText]}>{subtopic.name}</Text></Pressable>)}</View>}</>}
    </StudyCard>
    <StudyCard>
      <Text style={styles.label}>FECHA · AAAA-MM-DD</Text><TextInput value={form.date} onChangeText={(value) => update('date', value)} placeholder="2026-10-06" placeholderTextColor={palette.muted} style={styles.input} />
      <Text style={styles.label}>HORA DE INICIO · HH:MM</Text><TextInput value={form.startTime} onChangeText={(value) => update('startTime', value)} placeholder="15:30" placeholderTextColor={palette.muted} style={styles.input} />
      <Text style={styles.label}>DURACIÓN EN MINUTOS</Text><TextInput value={form.durationMinutes} onChangeText={(value) => update('durationMinutes', value)} keyboardType="number-pad" placeholder="60" placeholderTextColor={palette.muted} style={styles.input} />
      <Text style={styles.label}>EJERCICIOS REALIZADOS</Text><TextInput value={form.exerciseCount} onChangeText={(value) => update('exerciseCount', value)} keyboardType="number-pad" placeholder="Opcional" placeholderTextColor={palette.muted} style={styles.input} />
      <Text style={styles.label}>CORRECTOS SIN AYUDA</Text><TextInput value={form.correctExerciseCount} onChangeText={(value) => update('correctExerciseCount', value)} keyboardType="number-pad" placeholder="Opcional" placeholderTextColor={palette.muted} style={styles.input} />
      <Text style={styles.label}>DIFICULTAD</Text><View style={styles.chips}>{([1, 2, 3, 4, 5] as const).map((level) => <Pressable key={level} onPress={() => update('difficulty', form.difficulty === level ? undefined : level)} style={[styles.level, form.difficulty === level && styles.selected]}><Text style={[styles.chipText, form.difficulty === level && styles.selectedText]}>{level}</Text></Pressable>)}</View>
      <Text style={styles.label}>NOTA</Text><TextInput multiline value={form.notes} onChangeText={(value) => update('notes', value)} placeholder="Qué resolviste o qué querés repasar" placeholderTextColor={palette.muted} style={[styles.input, styles.note]} />
    </StudyCard>
    {(validation || error) && <Text onPress={dismissError} style={styles.error}>{validation || error}</Text>}
    <PrimaryButton label={original ? 'GUARDAR CAMBIOS' : 'AGREGAR SESIÓN'} disabled={busy || !ready} onPress={() => { void save(); }} />
    {original && <Pressable onPress={confirmDelete}><Text style={styles.delete}>Eliminar sesión</Text></Pressable>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 60, gap: 15 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 28, fontWeight: '900' },
  hint: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  label: { color: palette.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 14, marginBottom: 8 },
  subtopicToggle: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: palette.surfaceRaised, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 12, paddingVertical: 10 },
  selected: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.text, fontSize: 12 },
  selectedText: { color: palette.accentText, fontWeight: '800' },
  level: { minWidth: 45, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: palette.surfaceRaised },
  input: { color: palette.text, backgroundColor: palette.surfaceRaised, borderColor: palette.border, borderWidth: 1, borderRadius: 12, minHeight: 48, fontSize: 16, paddingHorizontal: 12 },
  note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  error: { color: palette.danger, padding: 12, backgroundColor: palette.surfaceRaised, borderRadius: 10 },
  delete: { color: palette.danger, textAlign: 'center', marginTop: 8, padding: 12 },
});
