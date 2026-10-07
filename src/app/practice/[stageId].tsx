import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { getExercisesForStage } from '@/constants/exercises';
import { PRACTICE_STAGES } from '@/constants/learningRoadmap';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { formatDuration } from '@/utils/time';

export default function PracticeScreen() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const stage = PRACTICE_STAGES.find((item) => item.id === stageId);
  const exercises = stage ? getExercisesForStage(stage.id) : [];
  const [revealed, setRevealed] = useState<string[]>([]);
  const { timer, busy, begin } = useStudy();

  if (!stage) return <View style={styles.page}><Text style={styles.title}>Bloque no encontrado</Text><PrimaryButton label="VOLVER" onPress={() => router.back()} /></View>;

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>← PLAN</Text></Pressable>
    <Text style={styles.kicker}>FASE {stage.phase} · {formatDuration(stage.targetMinutes * 60)} EN TOTAL</Text>
    <Text style={styles.title}>{stage.title}</Text>
    <Text style={styles.intro}>{stage.focus}</Text>
    <StudyCard>
      <Text style={styles.cardLabel}>PARA AVANZAR</Text>
      <Text style={styles.body}>{stage.checkpoint}</Text>
      <Text style={styles.hint}>Estas horas son para todo el bloque, no para repetir el primer ejercicio. Avanzá cuando puedas resolverlo sin ayuda.</Text>
    </StudyCard>
    <PrimaryButton label={timer ? 'VOLVER AL CRONÓMETRO' : '▶ ESTUDIAR ESTE BLOQUE'} disabled={busy} onPress={() => {
      if (timer) { router.push('/(tabs)/timer'); return; }
      void begin(stage.topicId).then(() => router.push('/(tabs)/timer'));
    }} />
    <Text style={styles.section}>EJERCICIOS GUIADOS</Text>
    <Text style={styles.hint}>Intentá cada uno antes de abrir la solución. Son ejercicios originales ordenados hasta el nivel aproximado de los parciales.</Text>
    {exercises.map((exercise, index) => {
      const isRevealed = revealed.includes(exercise.id);
      return <StudyCard key={exercise.id}>
        <Text style={styles.cardLabel}>{index + 1} · {exercise.level.toUpperCase()}</Text>
        <Text style={styles.prompt}>{exercise.prompt}</Text>
        <PrimaryButton secondary label={isRevealed ? 'OCULTAR SOLUCIÓN' : 'VER SOLUCIÓN'} onPress={() => setRevealed((current) => isRevealed ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])} />
        {isRevealed && <View style={styles.solution}>
          <Text style={styles.answer}>{exercise.answer}</Text>
          {exercise.steps.map((step, stepIndex) => <Text key={stepIndex} style={styles.body}>{stepIndex + 1}. {step}</Text>)}
        </View>}
      </StudyCard>;
    })}
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(stage.resourceUrl)} style={styles.resource}>
      <Text style={styles.resourceText}>LECTURA OPCIONAL · {stage.resourceTitle} ↗</Text>
      <Text style={styles.hint}>El enlace externo requiere internet; los ejercicios de la app funcionan sin conexión.</Text>
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 32, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontSize: 13, fontWeight: '800', marginBottom: 10 },
  kicker: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: palette.text, fontSize: 30, fontWeight: '900', lineHeight: 35 },
  intro: { color: palette.muted, fontSize: 15, lineHeight: 22, marginBottom: 4 },
  cardLabel: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.1, marginBottom: 10 },
  body: { color: palette.text, fontSize: 14, lineHeight: 21, marginBottom: 7 },
  hint: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  section: { color: palette.text, fontSize: 20, fontWeight: '900', marginTop: 12 },
  prompt: { color: palette.text, fontSize: 18, fontWeight: '700', lineHeight: 27, marginBottom: 18 },
  solution: { borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 16, marginTop: 16 },
  answer: { color: palette.accent, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  resource: { padding: 16, borderRadius: 16, backgroundColor: palette.surfaceRaised },
  resourceText: { color: palette.accent, fontSize: 12, fontWeight: '800' },
});
