import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { formatDuration, localDateKey } from '@/utils/time';

export default function HistoryScreen() {
  const { sessions, topics } = useStudy();
  const sorted = [...sessions].sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← MÁS</Text></Pressable>
    <Text style={styles.heading}>HISTORIAL</Text>
    <PrimaryButton label="+ REGISTRAR SESIÓN MANUAL" onPress={() => router.push('/sessions/new')} />
    {sorted.length === 0 && <StudyCard><Text style={styles.empty}>Aún no hay sesiones. Cuando terminés una, aparecerá aquí.</Text></StudyCard>}
    {sorted.map((session, index) => {
      const date = localDateKey(new Date(session.endTime));
      const showDate = index === 0 || date !== localDateKey(new Date(sorted[index - 1].endTime));
      const topic = topics.find((item) => item.id === session.topicId);
      const time = (iso: string) => new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
      return <View key={session.id} style={styles.group}>
        {showDate && <Text style={styles.date}>{new Date(session.endTime).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>}
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sessions/[id]', params: { id: session.id } })}><StudyCard>
          <View style={styles.row}><Text style={styles.topic}>{topic?.name ?? 'Tema desconocido'}</Text><Text style={styles.duration}>{formatDuration(session.durationSeconds)}</Text></View>
          <Text style={styles.muted}>{time(session.startTime)} – {time(session.endTime)}{session.subtopicId ? ` · ${topic?.subtopics.find((subtopic) => subtopic.id === session.subtopicId)?.name ?? ''}` : ''}</Text>
          {session.exerciseCount !== undefined && <Text style={styles.muted}>{session.exerciseCount} ejercicios{session.correctExerciseCount !== undefined ? ` · ${session.correctExerciseCount} correctos` : ''}</Text>}
          {session.notes && <Text style={styles.note}>{session.notes}</Text>}
        </StudyCard></Pressable>
      </View>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 30, fontWeight: '900' },
  empty: { color: palette.muted, lineHeight: 21 },
  group: { gap: 8 },
  date: { color: palette.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1, marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  topic: { color: palette.text, fontSize: 19, fontWeight: '800', flex: 1 },
  duration: { color: palette.accent, fontWeight: '900' },
  muted: { color: palette.muted, fontSize: 12, marginTop: 8 },
  note: { color: palette.text, fontSize: 13, lineHeight: 19, marginTop: 10 },
});
