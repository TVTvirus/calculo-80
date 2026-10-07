import type { ActiveTimer, Settings, StudySession, StudyTopic } from '@/types/study';
import { dateOrdinal, localDateKey } from '@/utils/time';

export function calculateTotalStudyTime(sessions: StudySession[]): number {
  return sessions.reduce((total, session) => total + Math.max(0, session.durationSeconds), 0);
}

export function calculateReachedMilestone(completedSeconds: number): number {
  return Math.min(80, Math.floor(Math.max(0, completedSeconds) / 36000) * 10);
}

export function calculateRemainingTime(targetHours: number, completedSeconds: number): number {
  return Math.max(0, targetHours * 3600 - Math.max(0, completedSeconds));
}

export function calculateRemainingDays(today: Date, lastStudyDate: string, startDate?: string): number {
  const start = startDate ? dateOrdinal(startDate) : -Infinity;
  return Math.max(0, dateOrdinal(lastStudyDate) - Math.max(dateOrdinal(localDateKey(today)), start) + 1);
}

export function calculateRequiredDailyMinutes(remainingSeconds: number, remainingDays: number): number {
  return remainingDays > 0 ? Math.max(0, remainingSeconds) / 60 / remainingDays : 0;
}

export function calculateTopicProgress(topic: StudyTopic, sessions: StudySession[]) {
  const seconds = calculateTotalStudyTime(sessions.filter((session) => session.topicId === topic.id));
  const targetSeconds = Math.max(0, topic.targetMinutes) * 60;
  return {
    seconds,
    remainingSeconds: Math.max(0, targetSeconds - seconds),
    ratio: targetSeconds > 0 ? Math.min(1, seconds / targetSeconds) : 1,
  };
}

export function calculateTopicStats(topic: StudyTopic, sessions: StudySession[]) {
  const related = sessions.filter((session) => session.topicId === topic.id);
  const progress = calculateTopicProgress(topic, related);
  const exercises = related.reduce((total, session) => total + Math.max(0, session.exerciseCount ?? 0), 0);
  const graded = related.filter((session) => session.exerciseCount !== undefined && session.correctExerciseCount !== undefined);
  const gradedExercises = graded.reduce((total, session) => total + Math.max(0, session.exerciseCount ?? 0), 0);
  const correct = graded.reduce((total, session) => total + Math.max(0, session.correctExerciseCount ?? 0), 0);
  return { ...progress, sessionCount: related.length, exercises, correct, accuracy: gradedExercises > 0 ? correct / gradedExercises : null };
}

export function getTimerSeconds(timer: ActiveTimer, now = Date.now()): number {
  const running = timer.runningSince ? Math.max(0, (now - Date.parse(timer.runningSince)) / 1000) : 0;
  return Math.max(0, Math.floor(timer.accumulatedSeconds + running));
}

export function secondsOnDay(session: StudySession, key: string): number {
  if (!session.activeSegments?.length) {
    return localDateKey(new Date(session.endTime)) === key ? Math.max(0, session.durationSeconds) : 0;
  }
  const dayStart = new Date(`${key}T00:00:00`).getTime();
  const dayEnd = new Date(`${key}T00:00:00`);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return session.activeSegments.reduce((total, segment) => {
    const from = Math.max(dayStart, Date.parse(segment.startTime));
    const to = Math.min(dayEnd.getTime(), Date.parse(segment.endTime));
    return total + Math.max(0, to - from) / 1000;
  }, 0);
}

export function getDaySeconds(sessions: StudySession[], day: Date): number {
  const key = localDateKey(day);
  return sessions.reduce((total, session) => total + secondsOnDay(session, key), 0);
}

export function getTodaySeconds(sessions: StudySession[], today: Date): number {
  return getDaySeconds(sessions, today);
}

export function getLastDaysSeconds(sessions: StudySession[], today: Date, count: number): number {
  let total = 0;
  for (let offset = 0; offset < count; offset++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    total += getDaySeconds(sessions, day);
  }
  return total;
}

export function calculateProjection(sessions: StudySession[], settings: Settings, today: Date) {
  const totalSeconds = calculateTotalStudyTime(sessions);
  const start = dateOrdinal(settings.startDate);
  const current = dateOrdinal(localDateKey(today));
  const last = dateOrdinal(settings.lastStudyDate);
  const elapsedDays = Math.max(0, Math.min(current, last) - start + 1);
  const sampleDays = Math.min(7, elapsedDays);
  const lastSevenSeconds = getLastDaysSeconds(sessions, today, sampleDays);
  const dailySeconds = sampleDays > 0 ? lastSevenSeconds / sampleDays : 0;
  const generalDailySeconds = elapsedDays > 0 ? totalSeconds / elapsedDays : 0;
  const remainingDays = calculateRemainingDays(today, settings.lastStudyDate, settings.startDate);
  const remainingSeconds = calculateRemainingTime(settings.targetHours, totalSeconds);
  const expectedAtDeadlineSeconds = Math.max(0, totalSeconds + dailySeconds * Math.max(0, remainingDays - 1));
  let finishDate: string | null = null;
  if (remainingSeconds === 0) finishDate = localDateKey(today);
  else if (dailySeconds > 0 && expectedAtDeadlineSeconds >= settings.targetHours * 3600) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + Math.ceil(remainingSeconds / dailySeconds));
    finishDate = localDateKey(date);
  }
  return { lastSevenSeconds, dailySeconds, generalDailySeconds, expectedAtDeadlineSeconds, finishDate, elapsedDays };
}

export function calculatePaceStatus(sessions: StudySession[], settings: Settings, today: Date): 'ahead' | 'on-track' | 'recover' | 'complete' | 'ended' {
  const total = calculateTotalStudyTime(sessions);
  if (total >= settings.targetHours * 3600) return 'complete';
  if (dateOrdinal(localDateKey(today)) > dateOrdinal(settings.lastStudyDate)) return 'ended';
  const fullDays = dateOrdinal(settings.lastStudyDate) - dateOrdinal(settings.startDate) + 1;
  const finishedDays = Math.max(0, dateOrdinal(localDateKey(today)) - dateOrdinal(settings.startDate));
  const expected = fullDays > 0 ? settings.targetHours * 3600 * finishedDays / fullDays : 0;
  const delta = total - expected;
  if (delta > 30 * 60) return 'ahead';
  if (delta < -30 * 60) return 'recover';
  return 'on-track';
}

export function calculateStudyStats(sessions: StudySession[], settings: Settings, today: Date) {
  const totalSeconds = calculateTotalStudyTime(sessions);
  const sevenSeconds = getLastDaysSeconds(sessions, today, 7);
  const projection = calculateProjection(sessions, settings, today);
  const exercises = sessions.reduce((total, session) => total + Math.max(0, session.exerciseCount ?? 0), 0);
  const correct = sessions.reduce((total, session) => total + Math.max(0, session.correctExerciseCount ?? 0), 0);
  return {
    totalSeconds,
    weekSeconds: getWeekSeconds(sessions, today),
    sevenSeconds,
    dailyAverageSeconds: projection.generalDailySeconds,
    sessionAverageSeconds: sessions.length ? totalSeconds / sessions.length : 0,
    longestSeconds: sessions.reduce((max, session) => Math.max(max, session.durationSeconds), 0),
    sessionCount: sessions.length,
    exercises,
    correct,
  };
}

export function getWeekSeconds(sessions: StudySession[], today: Date): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  let total = 0;
  for (let day = new Date(start); day <= today; day.setDate(day.getDate() + 1)) {
    total += getTodaySeconds(sessions, day);
  }
  return total;
}

export function calculateDashboard(sessions: StudySession[], settings: Settings, today: Date) {
  const totalSeconds = calculateTotalStudyTime(sessions);
  const remainingSeconds = calculateRemainingTime(settings.targetHours, totalSeconds);
  const days = calculateRemainingDays(today, settings.lastStudyDate, settings.startDate);
  return {
    totalSeconds,
    remainingSeconds,
    days,
    dailyMinutes: calculateRequiredDailyMinutes(remainingSeconds, days),
    todaySeconds: getTodaySeconds(sessions, today),
    weekSeconds: getWeekSeconds(sessions, today),
  };
}
