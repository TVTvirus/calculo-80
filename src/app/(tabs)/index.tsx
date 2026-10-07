import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyCard } from '@/components/StudyCard';
import { PRACTICE_STAGES } from '@/constants/learningRoadmap';
import { palette } from '@/constants/theme';
import { useStudy } from '@/features/study/StudyContext';
import { useNow } from '@/hooks/useNow';
import { calculateDashboard, calculatePaceStatus, calculateProjection } from '@/services/progress';
import { chooseRecommendedTopic } from '@/services/recommendation';
import { formatDuration } from '@/utils/time';

export default function HomeScreen() {
  const { ready, settings, topics, sessions, mockExams, timer, busy, begin, error, dismissError } = useStudy();
  const now = useNow();
  if (!ready || !settings) return <View style={styles.page}><Text style={styles.muted}>{error ?? 'Cargando tus datos…'}</Text></View>;
  const data = calculateDashboard(sessions, settings, now);
  const projection = calculateProjection(sessions, settings, now);
  const paceStatus = calculatePaceStatus(sessions, settings, now);
  const targetSeconds = settings.targetHours * 3600;
  const progress = targetSeconds > 0 ? Math.min(1, data.totalSeconds / targetSeconds) : 1;
  const beforeStart = now < new Date(`${settings.startDate}T00:00:00`);
  const afterStudy = data.days === 0;
  const daily = Math.ceil(data.dailyMinutes);
  const recommendation = chooseRecommendedTopic(topics, sessions, settings, now, mockExams);
  const recommendedTopic = topics.find((topic) => topic.id === recommendation?.topicId);
  const recommendedSubtopic = recommendedTopic?.subtopics.find((subtopic) => subtopic.id === recommendation?.subtopicId);
  const recommendedStage = PRACTICE_STAGES.find((stage) => stage.id === recommendation?.stageId);

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.heading}><Text style={styles.kicker}>CÁLCULO</Text><Text style={styles.exam}>EXAMEN · 4 DIC, 8 A. M.</Text></View>
    {error && <Text onPress={dismissError} style={styles.error}>{error} · Tocar para cerrar</Text>}
    <StudyCard>
      <View style={styles.heroLabel}><Text style={styles.eyebrow}>OBJETIVO GENERAL</Text><Text style={styles.progressLabel}>{Math.round(progress * 100)} %</Text></View>
      <View style={styles.heroRow}><Text style={styles.heroNumber}>{(data.totalSeconds / 3600).toFixed(1)}</Text><Text style={styles.heroTarget}>/ {settings.targetHours} h</Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
    </StudyCard>
    <StudyCard>
      <View style={styles.metricsTop}>
        <View style={styles.metricHalf}><Text style={styles.eyebrow}>HOY</Text><Text style={styles.value}>{formatDuration(data.todaySeconds)}</Text></View>
        <View style={styles.metricHalf}><Text style={styles.eyebrow}>ESTA SEMANA</Text><Text style={styles.value}>{formatDuration(data.weekSeconds)}</Text></View>
      </View>
      <View style={styles.separator} />
      <View style={styles.metricsTop}>
        <View style={styles.metricHalf}><Text style={styles.eyebrow}>FALTAN</Text><Text style={styles.metricValue}>{formatDuration(data.remainingSeconds)}</Text></View>
        <View style={styles.metricHalf}><Text style={styles.eyebrow}>DÍAS DISPONIBLES</Text><Text style={styles.metricValue}>{data.days}</Text></View>
      </View>
      <View style={styles.separator} />
      <View style={styles.metric}><Text style={styles.muted}>Ritmo necesario</Text><Text style={styles.metricValue}>{data.remainingSeconds === 0 ? 'Objetivo cumplido' : afterStudy ? 'Plazo terminado' : `${formatDuration(daily * 60)} / día`}</Text></View>
    </StudyCard>
    {recommendation && <StudyCard>
      <Text style={styles.eyebrow}>PLAN DE HOY · FASE {recommendation.phase}</Text>
      <Text style={styles.planTopic}>{recommendedTopic?.name}</Text>
      <Text style={styles.planSubtopic}>{recommendedSubtopic?.name ?? recommendedStage?.title}</Text>
      <Text style={styles.planTime}>{recommendation.minutes > 0 ? `${formatDuration(recommendation.minutes * 60)} sugeridos hoy` : 'El ritmo de hoy ya está cubierto'}</Text>
      <View style={styles.planActions}><PrimaryButton label={timer ? 'VOLVER AL CRONÓMETRO' : '▶ EMPEZAR'} disabled={busy} onPress={() => { if (timer) router.push(timer.mode === 'mock' ? '/mocks' : '/(tabs)/timer'); else void begin(recommendation.topicId, recommendation.subtopicId).then(() => router.push('/(tabs)/timer')); }} /></View>
      {recommendedStage && <View style={styles.practiceButton}><PrimaryButton label="VER EJERCICIOS DEL BLOQUE" secondary onPress={() => router.push({ pathname: '/practice/[stageId]', params: { stageId: recommendedStage.id } })} /></View>}
    </StudyCard>}
    <StudyCard>
      <Text style={styles.eyebrow}>{paceStatus === 'ahead' ? 'VAS ADELANTADO' : paceStatus === 'recover' ? 'HAY QUE RECUPERAR' : paceStatus === 'complete' ? 'OBJETIVO COMPLETADO' : paceStatus === 'ended' ? 'PLAZO TERMINADO' : 'VAS EN RITMO'}</Text>
      <Text style={styles.projectionTitle}>PROYECCIÓN</Text>
      {projection.dailySeconds === 0 && data.remainingSeconds > 0 ? <Text style={styles.muted}>Todavía no hay sesiones para estimar un ritmo.</Text> : projection.finishDate ? <Text style={styles.projectionValue}>Al ritmo reciente terminarías alrededor del {new Date(`${projection.finishDate}T12:00:00`).toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })}.</Text> : <Text style={styles.projectionValue}>Al último día de estudio llegarías con aproximadamente {(projection.expectedAtDeadlineSeconds / 3600).toFixed(1)} / {settings.targetHours} h.</Text>}
      <Text style={styles.projectionFoot}>Promedio últimos 7 días: {formatDuration(projection.dailySeconds)} / día · Promedio general: {formatDuration(projection.generalDailySeconds)} / día</Text>
    </StudyCard>
    {beforeStart && <Text style={styles.muted}>El plan empieza el 6 de octubre. Podés registrar estudio antes si querés.</Text>}
    {!recommendation && <PrimaryButton label={timer ? '▶ VOLVER AL ESTUDIO' : '▶ INICIAR ESTUDIO'} onPress={() => router.push(timer?.mode === 'mock' ? '/mocks' : '/(tabs)/timer')} />}
    <Text style={styles.footnote}>Solo cuenta el tiempo que realmente estudiás. Podés pausar cuando lo necesités.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 34, paddingBottom: 42, gap: 14 },
  heading: { gap: 4, marginBottom: 8 },
  kicker: { color: palette.text, fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  exam: { color: palette.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  eyebrow: { color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  heroLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8, marginBottom: 10 },
  heroNumber: { color: palette.text, fontSize: 68, fontWeight: '800', letterSpacing: -3 },
  heroTarget: { color: palette.muted, fontSize: 24, fontWeight: '600' },
  track: { backgroundColor: palette.surfaceRaised, height: 16, borderRadius: 99, overflow: 'hidden' },
  fill: { backgroundColor: palette.accent, height: '100%', borderRadius: 99 },
  progressLabel: { color: palette.muted, fontSize: 13 },
  value: { color: palette.text, fontSize: 21, fontWeight: '800' },
  metric: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metricsTop: { flexDirection: 'row', gap: 12 },
  metricHalf: { flex: 1, gap: 7 },
  muted: { color: palette.muted, fontSize: 14 },
  metricValue: { color: palette.text, fontSize: 17, fontWeight: '800', textAlign: 'right', flexShrink: 1 },
  separator: { height: 1, backgroundColor: palette.border, marginVertical: 8 },
  footnote: { color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 18 },
  planTopic: { color: palette.text, fontSize: 23, fontWeight: '800', marginTop: 12 },
  planSubtopic: { color: palette.accent, fontSize: 16, marginTop: 4 },
  planTime: { color: palette.text, fontSize: 19, fontWeight: '800', marginTop: 14 },
  planActions: { marginTop: 18 },
  practiceButton: { marginTop: 10 },
  projectionTitle: { color: palette.text, fontSize: 18, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  projectionValue: { color: palette.text, fontSize: 15, lineHeight: 22 },
  projectionFoot: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  error: { color: palette.danger, backgroundColor: palette.surfaceRaised, padding: 12, borderRadius: 10 },
});
