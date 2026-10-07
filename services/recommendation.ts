import type { MockExam, Settings, StudySession, StudyTopic } from '@/types/study';
import { STUDY_PHASES } from '@/constants/plan';
import { PRACTICE_STAGES } from '@/constants/learningRoadmap';
import { calculateDashboard, calculateTopicProgress } from '@/services/progress';
import { dateOrdinal, localDateKey } from '@/utils/time';

export type StudyRecommendation = {
  topicId: string;
  subtopicId?: string;
  stageId?: string;
  minutes: number;
  phase: number;
  reason: string;
};

const PHASE_WEIGHTS: Record<string, number>[] = [
  { limites: 3.2, derivadas: 1.2, logaritmica: 0.3, tangente: 0.3, integrales: 0.3, simulacros: 0.2 },
  { limites: 0.7, derivadas: 3.2, logaritmica: 1.1, tangente: 0.8, integrales: 0.3, simulacros: 0.2 },
  { limites: 0.5, derivadas: 0.8, logaritmica: 3, tangente: 3, integrales: 0.6, simulacros: 0.3 },
  { limites: 0.4, derivadas: 0.6, logaritmica: 0.5, tangente: 0.5, integrales: 3.5, simulacros: 0.6 },
  { limites: 0.7, derivadas: 0.9, logaritmica: 0.9, tangente: 0.9, integrales: 1.1, simulacros: 3.2 },
];

export function getStudyPhase(today: Date): number {
  const day = dateOrdinal(localDateKey(today));
  let phase = 0;
  for (let index = 0; index < STUDY_PHASES.length; index++) {
    if (day >= dateOrdinal(STUDY_PHASES[index].startDate)) phase = index;
  }
  return phase + 1;
}

function weaknessMultiplier(topicSessions: StudySession[], today: Date): number {
  if (topicSessions.length === 0) return 1;
  const difficulties = topicSessions.flatMap((session) => session.difficulty ? [session.difficulty] : []);
  const averageDifficulty = difficulties.length ? difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length : 3;
  const graded = topicSessions.filter((session) => session.exerciseCount !== undefined && session.correctExerciseCount !== undefined);
  const exercises = graded.reduce((sum, session) => sum + (session.exerciseCount ?? 0), 0);
  const correct = graded.reduce((sum, session) => sum + (session.correctExerciseCount ?? 0), 0);
  const incorrectRate = exercises > 0 ? Math.max(0, 1 - correct / exercises) : 0;
  const latest = Math.max(...topicSessions.map((session) => Date.parse(session.endTime)));
  const gap = Math.max(0, dateOrdinal(localDateKey(today)) - dateOrdinal(localDateKey(new Date(latest))));
  return 1 + Math.max(0, averageDifficulty - 3) * 0.15 + incorrectRate * 0.55 + Math.min(gap, 10) * 0.035;
}

function chooseSubtopic(topic: StudyTopic, sessions: StudySession[]): string | undefined {
  if (topic.subtopics.length === 0) return undefined;
  const amounts = new Map(topic.subtopics.map((subtopic) => [subtopic.id, 0]));
  for (const session of sessions) {
    if (session.subtopicId && amounts.has(session.subtopicId)) {
      amounts.set(session.subtopicId, (amounts.get(session.subtopicId) ?? 0) + Math.max(0, session.durationSeconds));
    }
  }
  return [...topic.subtopics].sort((a, b) => (amounts.get(a.id) ?? 0) - (amounts.get(b.id) ?? 0))[0].id;
}

export function chooseRecommendedTopic(topics: StudyTopic[], sessions: StudySession[], settings: Settings, today: Date, mockExams: MockExam[] = []): StudyRecommendation | null {
  const dashboard = calculateDashboard(sessions, settings, today);
  if (dashboard.days === 0 || dashboard.remainingSeconds === 0 || topics.length === 0) return null;
  const phase = getStudyPhase(today);
  const weights = PHASE_WEIGHTS[phase - 1];
  const unfinished = topics.filter((topic) => calculateTopicProgress(topic, sessions).remainingSeconds > 0);
  const candidates = unfinished.length > 0 ? unfinished : topics;
  const latestSession = [...sessions].sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime))[0];
  const ranked = candidates.map((topic) => {
    const topicSessions = sessions.filter((session) => session.topicId === topic.id);
    const remainingRatio = topic.targetMinutes > 0 ? calculateTopicProgress(topic, sessions).remainingSeconds / (topic.targetMinutes * 60) : 0;
    const recentSeconds = topicSessions.filter((session) => Date.parse(session.endTime) >= today.getTime() - 2 * 86400000)
      .reduce((total, session) => total + Math.max(0, session.durationSeconds), 0);
    const recentPenalty = 1 / (1 + recentSeconds / 7200);
    const repeatPenalty = latestSession?.topicId === topic.id ? 0.78 : 1;
    const recentMockFailures = mockExams.filter((exam) => exam.failedTopicIds.includes(topic.id) && Date.parse(exam.date) >= today.getTime() - 14 * 86400000).length;
    const mockWeakness = 1 + Math.min(0.75, recentMockFailures * 0.25);
    const score = (weights[topic.id] ?? 0.5) * Math.max(0.05, remainingRatio) * weaknessMultiplier(topicSessions, today) * mockWeakness * recentPenalty * repeatPenalty;
    return { topic, topicSessions, score };
  }).sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const topicStages = PRACTICE_STAGES.filter((stage) => stage.topicId === winner.topic.id);
  const studiedMinutes = winner.topicSessions.reduce((total, session) => total + Math.max(0, session.durationSeconds), 0) / 60;
  let stageThreshold = 0;
  const stage = topicStages.find((item) => {
    stageThreshold += item.targetMinutes;
    return studiedMinutes < stageThreshold;
  }) ?? topicStages.at(-1);
  const remainingToday = Math.max(0, Math.ceil(dashboard.dailyMinutes - dashboard.todaySeconds / 60));
  return {
    topicId: winner.topic.id,
    subtopicId: chooseSubtopic(winner.topic, winner.topicSessions),
    stageId: stage?.id,
    minutes: remainingToday,
    phase,
    reason: `Fase ${phase}: ${winner.topic.name.toLowerCase()} según objetivo pendiente, práctica reciente y dificultad.`,
  };
}
