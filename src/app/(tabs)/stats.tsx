import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { useNow } from '@/hooks/useNow';
import { calculateStudyStats, calculateTopicProgress, getDaySeconds } from '@/services/progress';
import { formatDuration } from '@/utils/time';

export default function StatsScreen() {
  const { settings, topics, sessions } = useStudy();
  const now = useNow();
  if (!settings) return <View style={styles.page} />;
  const stats = calculateStudyStats(sessions, settings, now);
  const days = Array.from({ length: 14 }, (_, index) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - index)));
  const values = days.map((day) => getDaySeconds(sessions, day));
  const maxValue = Math.max(3600, ...values);
  const metric = (label: string, value: string | number) => <View key={label} style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>ESTADÍSTICAS</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/calendar')} style={styles.calendarButton}><Text style={styles.calendarText}>VER CALENDARIO →</Text></Pressable>
    <StudyCard>
      <Text style={styles.kicker}>TIEMPO Y PRÁCTICA</Text>
      {metric('Horas totales', formatDuration(stats.totalSeconds))}
      {metric('Esta semana', formatDuration(stats.weekSeconds))}
      {metric('Últimos 7 días', formatDuration(stats.sevenSeconds))}
      {metric('Promedio diario', formatDuration(stats.dailyAverageSeconds))}
      {metric('Promedio por sesión', formatDuration(stats.sessionAverageSeconds))}
      {metric('Sesión más larga', formatDuration(stats.longestSeconds))}
      {metric('Sesiones', stats.sessionCount)}
      {metric('Ejercicios realizados', stats.exercises)}
      {metric('Correctos sin ayuda', stats.correct)}
    </StudyCard>
    <StudyCard>
      <Text style={styles.kicker}>ÚLTIMOS 14 DÍAS</Text>
      <View style={styles.chart}>{days.map((day, index) => <View key={day.toISOString()} style={styles.barColumn}>
        <View style={styles.barSpace}><View style={[styles.bar, { height: Math.max(values[index] > 0 ? 5 : 2, Math.round(values[index] / maxValue * 100)), opacity: values[index] > 0 ? 1 : 0.2 }]} /></View>
        <Text style={styles.dayLabel}>{day.getDate()}</Text>
      </View>)}</View>
      <Text style={styles.muted}>Cada barra representa tiempo real de estudio. Los días sin estudio también aparecen.</Text>
    </StudyCard>
    <StudyCard>
      <Text style={styles.kicker}>DISTRIBUCIÓN POR TEMA</Text>
      {topics.map((topic) => {
        const progress = calculateTopicProgress(topic, sessions);
        return <View key={topic.id} style={styles.topicRow}>
          <View style={styles.topicLabels}><Text style={styles.topicName}>{topic.name}</Text><Text style={styles.topicValue}>{(progress.seconds / 3600).toFixed(1)} / {(topic.targetMinutes / 60).toFixed(1)} h</Text></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress.ratio * 100}%` }]} /></View>
        </View>;
      })}
    </StudyCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 34, paddingBottom: 50, gap: 14 },
  heading: { color: palette.text, fontSize: 28, fontWeight: '900' },
  calendarButton: { backgroundColor: palette.surfaceRaised, borderRadius: 15, padding: 15 },
  calendarText: { color: palette.accent, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  kicker: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 12 },
  metric: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, borderTopColor: palette.border, borderTopWidth: 1, paddingVertical: 11 },
  metricLabel: { color: palette.muted, fontSize: 13 },
  metricValue: { color: palette.text, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  chart: { height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3 },
  barColumn: { flex: 1, alignItems: 'center' },
  barSpace: { height: 110, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { backgroundColor: palette.accent, borderRadius: 4, width: '85%' },
  dayLabel: { color: palette.muted, fontSize: 10, marginTop: 5 },
  muted: { color: palette.muted, fontSize: 11, lineHeight: 17, marginTop: 10 },
  topicRow: { marginTop: 13 },
  topicLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  topicName: { color: palette.text, fontSize: 12, flex: 1 },
  topicValue: { color: palette.muted, fontSize: 12 },
  track: { height: 7, borderRadius: 8, backgroundColor: palette.surfaceRaised, marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: palette.accent },
});
