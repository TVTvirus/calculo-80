import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { calculateTopicStats } from '@/services/progress';
import { formatDuration } from '@/utils/time';

export default function TopicDetailScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { topics, sessions } = useStudy();
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) return <View style={styles.page}><Text style={styles.heading}>Tema no encontrado</Text></View>;
  const stats = calculateTopicStats(topic, sessions);
  const history = sessions.filter((session) => session.topicId === topic.id).sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← TEMAS</Text></Pressable>
    <Text style={styles.heading}>{topic.name}</Text>
    <StudyCard>
      <Text style={styles.number}>{formatDuration(stats.seconds)}</Text>
      <Text style={styles.muted}>de {formatDuration(topic.targetMinutes * 60)} · faltan {formatDuration(stats.remainingSeconds)}</Text>
      <Text style={styles.muted}>{stats.sessionCount} sesiones · {stats.exercises} ejercicios · {stats.accuracy === null ? 'Sin precisión' : `${Math.round(stats.accuracy * 100)}% correctos`}</Text>
    </StudyCard>
    <Text style={styles.section}>SUBTEMAS</Text>
    <StudyCard><View style={styles.chips}>{topic.subtopics.map((subtopic) => <Text key={subtopic.id} style={styles.chip}>{subtopic.name}</Text>)}</View></StudyCard>
    <Text style={styles.section}>HISTORIAL</Text>
    {history.length === 0 && <Text style={styles.muted}>Aún no hay sesiones en este tema.</Text>}
    {history.map((session) => <Pressable key={session.id} onPress={() => router.push({ pathname: '/sessions/[id]', params: { id: session.id } })}><StudyCard>
      <Text style={styles.value}>{formatDuration(session.durationSeconds)}</Text>
      <Text style={styles.muted}>{new Date(session.startTime).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
      {session.notes && <Text style={styles.muted}>{session.notes}</Text>}
    </StudyCard></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 29, fontWeight: '900' },
  number: { color: palette.text, fontSize: 34, fontWeight: '900' },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  section: { color: palette.text, fontSize: 18, fontWeight: '900', marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: palette.surfaceRaised, color: palette.text, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12 },
  value: { color: palette.text, fontSize: 19, fontWeight: '800' },
});
