import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StudyCard } from '@/components/StudyCard';
import { getStagesForPhase } from '@/constants/learningRoadmap';
import { STUDY_PHASES } from '@/constants/plan';
import { palette } from '@/constants/theme';
import { useNow } from '@/hooks/useNow';
import { getStudyPhase } from '@/services/recommendation';
import { formatDuration } from '@/utils/time';

export default function PlanScreen() {
  const now = useNow();
  const current = getStudyPhase(now);
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>PLAN DE ESTUDIO</Text>
    <Text style={styles.intro}>Un orden para llegar preparado al examen. Las horas diarias se ajustan según tu progreso.</Text>
    {STUDY_PHASES.map((phase) => <StudyCard key={phase.number}>
      <View style={styles.topRow}>
        <Text style={[styles.phase, current === phase.number && styles.active]}>FASE {phase.number}{current === phase.number ? ' · ACTUAL' : ''}</Text>
        <Text style={styles.range}>{phase.rangeLabel}</Text>
      </View>
      <Text style={styles.title}>{phase.title}</Text>
      <View style={styles.list}>{phase.priorities.map((priority) => <Text key={priority} style={styles.item}>• {priority}</Text>)}</View>
      {phase.note && <Text style={styles.note}>{phase.note}</Text>}
      <Text style={styles.stageHeading}>BLOQUES DE PRÁCTICA</Text>
      {getStagesForPhase(phase.number).map((stage) => <Pressable key={stage.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/practice/[stageId]', params: { stageId: stage.id } })} style={styles.stage}>
        <View style={styles.stageRow}><Text style={styles.stageTitle}>{stage.title}</Text><Text style={styles.stageTime}>{formatDuration(stage.targetMinutes * 60)}</Text></View>
        <Text style={styles.stageFocus}>{stage.focus}</Text>
        <Text style={styles.stageLink}>ABRIR EJERCICIOS →</Text>
      </Pressable>)}
    </StudyCard>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 34, paddingBottom: 42, gap: 14 },
  heading: { color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  intro: { color: palette.muted, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  phase: { color: palette.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  active: { color: palette.accent },
  range: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  title: { color: palette.text, fontSize: 22, fontWeight: '800', marginTop: 12 },
  list: { gap: 7, marginTop: 14 },
  item: { color: palette.text, fontSize: 14, lineHeight: 21 },
  note: { color: palette.accent, fontSize: 12, lineHeight: 18, marginTop: 14 },
  stageHeading: { color: palette.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginTop: 20, marginBottom: 4 },
  stage: { backgroundColor: palette.surfaceRaised, borderRadius: 15, padding: 14, marginTop: 8, gap: 7 },
  stageRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stageTitle: { color: palette.text, fontSize: 15, fontWeight: '800', flex: 1 },
  stageTime: { color: palette.accent, fontSize: 12, fontWeight: '800' },
  stageFocus: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  stageLink: { color: palette.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
