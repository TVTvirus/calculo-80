import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { getDaySeconds, secondsOnDay } from '@/services/progress';
import { formatDuration, localDateKey } from '@/utils/time';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
  const now = new Date();
  const { sessions, topics } = useStudy();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(localDateKey(now));
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (monthStart.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + dayCount) / 7) * 7 }, (_, index) => index - offset + 1);
  const selectedDate = new Date(`${selected}T12:00:00`);
  const total = getDaySeconds(sessions, selectedDate);
  const sessionCount = sessions.filter((session) => secondsOnDay(session, selected) > 0).length;
  const topicTotals = topics.map((topic) => ({ topic, seconds: sessions.filter((session) => session.topicId === topic.id).reduce((sum, session) => sum + secondsOnDay(session, selected), 0) })).filter((item) => item.seconds > 0);
  const moveMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    setSelected(localDateKey(next));
  };

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← ESTADÍSTICAS</Text></Pressable>
    <Text style={styles.heading}>CALENDARIO</Text>
    <StudyCard>
      <View style={styles.monthRow}><Pressable onPress={() => moveMonth(-1)}><Text style={styles.arrow}>‹</Text></Pressable><Text style={styles.month}>{month.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' }).toUpperCase()}</Text><Pressable onPress={() => moveMonth(1)}><Text style={styles.arrow}>›</Text></Pressable></View>
      <View style={styles.grid}>{WEEKDAYS.map((day, index) => <Text key={index} style={styles.weekday}>{day}</Text>)}
        {cells.map((day, index) => {
          if (day < 1 || day > dayCount) return <View key={`empty-${index}`} style={styles.dayCell} />;
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const key = localDateKey(date);
          const seconds = getDaySeconds(sessions, date);
          return <Pressable key={key} accessibilityRole="button" onPress={() => setSelected(key)} style={[styles.dayCell, seconds > 0 && { backgroundColor: palette.accent, opacity: 0.45 + Math.min(0.55, seconds / 7200 * 0.55) }, selected === key && styles.selected]}><Text style={[styles.dayText, seconds > 0 && styles.studiedText]}>{day}</Text></Pressable>;
        })}
      </View>
    </StudyCard>
    <StudyCard>
      <Text style={styles.selectedDate}>{selectedDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</Text>
      <Text style={styles.total}>{formatDuration(total)}</Text>
      <Text style={styles.muted}>{sessionCount} {sessionCount === 1 ? 'sesión' : 'sesiones'}</Text>
      {topicTotals.map(({ topic, seconds }) => <View key={topic.id} style={styles.topicRow}><Text style={styles.topic}>{topic.name}</Text><Text style={styles.topicTime}>{formatDuration(seconds)}</Text></View>)}
      {total === 0 && <Text style={styles.muted}>Sin estudio registrado ese día.</Text>}
    </StudyCard>
    <PrimaryButton label="+ REGISTRAR SESIÓN DE ESTE DÍA" onPress={() => router.push({ pathname: '/sessions/[id]', params: { id: 'new', date: selected } })} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50, gap: 14 },
  back: { color: palette.accent, fontWeight: '800' },
  heading: { color: palette.text, fontSize: 30, fontWeight: '900' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { color: palette.text, fontSize: 17, fontWeight: '900' },
  arrow: { color: palette.accent, fontSize: 28, paddingHorizontal: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, gap: 0 },
  weekday: { width: '14.2857%', textAlign: 'center', color: palette.muted, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  dayCell: { width: '14.2857%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  selected: { borderColor: palette.accent },
  dayText: { color: palette.text, fontWeight: '700' },
  studiedText: { color: palette.accentText, fontWeight: '900' },
  selectedDate: { color: palette.accent, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  total: { color: palette.text, fontSize: 38, fontWeight: '900', marginTop: 15 },
  muted: { color: palette.muted, marginTop: 8, fontSize: 13 },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 12, marginTop: 12 },
  topic: { color: palette.text, fontSize: 13 },
  topicTime: { color: palette.accent, fontWeight: '800' },
});
