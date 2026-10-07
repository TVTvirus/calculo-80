import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { calculateTopicStats } from '@/services/progress';
import { formatDuration } from '@/utils/time';

export default function TopicsScreen() {
  const { topics, sessions } = useStudy();
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← MÁS</Text></Pressable>
    <Text style={styles.heading}>TEMAS</Text>
    {topics.map((topic) => {
      const stats = calculateTopicStats(topic, sessions);
      return <Pressable key={topic.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/topics/[topicId]', params: { topicId: topic.id } })}><StudyCard>
        <View style={styles.row}><Text style={styles.title}>{topic.name}</Text><Text style={styles.percent}>{Math.round(stats.ratio * 100)}%</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: `${stats.ratio * 100}%` }]} /></View>
        <Text style={styles.value}>{formatDuration(stats.seconds)} / {formatDuration(topic.targetMinutes * 60)}</Text>
        <Text style={styles.meta}>Faltan {formatDuration(stats.remainingSeconds)} · {stats.sessionCount} sesiones</Text>
        <Text style={styles.meta}>{stats.exercises} ejercicios · {stats.accuracy === null ? 'Sin precisión registrada' : `${Math.round(stats.accuracy * 100)}% correctos`}</Text>
      </StudyCard></Pressable>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 30, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  title: { color: palette.text, fontSize: 20, fontWeight: '800', flex: 1 },
  percent: { color: palette.accent, fontSize: 20, fontWeight: '900' },
  track: { height: 10, borderRadius: 10, backgroundColor: palette.surfaceRaised, overflow: 'hidden', marginTop: 16 },
  fill: { height: '100%', backgroundColor: palette.accent },
  value: { color: palette.text, fontWeight: '700', marginTop: 14 },
  meta: { color: palette.muted, fontSize: 12, marginTop: 7 },
});
