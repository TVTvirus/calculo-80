import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';

export default function SettingsScreen() {
  const { settings, topics, busy, error, updateSettings, updateTopicTarget, dismissError } = useStudy();
  const [targetDraft, setTargetDraft] = useState<string | null>(null);
  const [topicValues, setTopicValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const saveGeneral = async () => {
    if (!settings) return;
    const hours = Number((targetDraft ?? String(settings.targetHours)).replace(',', '.'));
    if (!Number.isFinite(hours) || hours <= 0 || hours > 1000) { setMessage('Indicá un objetivo mayor que 0 horas.'); return; }
    if (await updateSettings({ ...settings, targetHours: hours })) setMessage('Objetivo general guardado.');
  };
  const saveTopic = async (id: string) => {
    const topic = topics.find((item) => item.id === id);
    const hours = Number((topicValues[id] ?? String((topic?.targetMinutes ?? 0) / 60)).replace(',', '.'));
    const minutes = Math.round(hours * 60);
    if (!Number.isFinite(hours) || hours < 0 || hours > 1000 || !Number.isInteger(minutes)) { setMessage('Indicá horas válidas para el tema.'); return; }
    if (await updateTopicTarget(id, minutes)) setMessage('Objetivo del tema guardado.');
  };

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← MÁS</Text></Pressable>
    <Text style={styles.heading}>CONFIGURACIÓN</Text>
    {settings && <StudyCard>
      <Text style={styles.label}>OBJETIVO GENERAL · HORAS</Text>
      <TextInput value={targetDraft ?? String(settings.targetHours)} onChangeText={setTargetDraft} keyboardType="decimal-pad" style={styles.input} />
      <View style={styles.button}><PrimaryButton label="GUARDAR OBJETIVO" disabled={busy} onPress={() => { void saveGeneral(); }} /></View>
      <Text style={styles.muted}>Inicio: {settings.startDate} · Último día de estudio: {settings.lastStudyDate} · Examen: {settings.examDate}, 8 a. m.</Text>
    </StudyCard>}
    <Text style={styles.section}>OBJETIVOS POR TEMA</Text>
    <Text style={styles.muted}>Podés ajustarlos después de practicar. El objetivo general se cambia arriba por separado.</Text>
    {topics.map((topic) => <StudyCard key={topic.id}>
      <Text style={styles.topic}>{topic.name}</Text>
      <View style={styles.row}><TextInput value={topicValues[topic.id] ?? String(topic.targetMinutes / 60)} onChangeText={(value) => setTopicValues((current) => ({ ...current, [topic.id]: value }))} keyboardType="decimal-pad" style={[styles.input, styles.smallInput]} /><Text style={styles.unit}>horas</Text></View>
      <View style={styles.button}><PrimaryButton label="GUARDAR TEMA" secondary disabled={busy} onPress={() => { void saveTopic(topic.id); }} /></View>
    </StudyCard>)}
    {(message || error) && <Text onPress={dismissError} style={[styles.notice, error && styles.error]}>{error ?? message}</Text>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 28, fontWeight: '900' },
  section: { color: palette.text, fontSize: 19, fontWeight: '900', marginTop: 10 },
  label: { color: palette.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  input: { backgroundColor: palette.surfaceRaised, borderColor: palette.border, borderWidth: 1, borderRadius: 12, minHeight: 50, color: palette.text, fontSize: 17, paddingHorizontal: 12 },
  smallInput: { width: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unit: { color: palette.muted },
  button: { marginTop: 14 },
  topic: { color: palette.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  muted: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 12 },
  notice: { color: palette.accent, textAlign: 'center', padding: 12 },
  error: { color: palette.danger },
});
