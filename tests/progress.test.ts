import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, DEFAULT_TOPICS } from '@/constants/study';
import { calculateDashboard, calculatePaceStatus, calculateProjection, calculateReachedMilestone, calculateRemainingDays, calculateRemainingTime, calculateRequiredDailyMinutes, calculateTopicProgress, calculateTopicStats, calculateTotalStudyTime, getTodaySeconds, getWeekSeconds } from '@/services/progress';
import type { StudySession } from '@/types/study';

const session = (id: string, topicId: string, seconds: number, endTime = '2026-10-06T18:00:00-06:00'): StudySession => ({ id, topicId, startTime: '2026-10-06T17:00:00-06:00', endTime, durationSeconds: seconds, createdAt: endTime });

describe('ritmo y progreso', () => {
  it('marca hitos cada diez horas y detiene la celebración en ochenta', () => {
    expect(calculateReachedMilestone(9 * 3600)).toBe(0);
    expect(calculateReachedMilestone(40 * 3600)).toBe(40);
    expect(calculateReachedMilestone(95 * 3600)).toBe(80);
  });
  it('calcula 59 días y 81.36 minutos diarios para el examen confirmado', () => {
    const now = new Date('2026-10-06T12:00:00-06:00');
    const dashboard = calculateDashboard([], DEFAULT_SETTINGS, now);
    expect(dashboard.days).toBe(59);
    expect(dashboard.remainingSeconds).toBe(80 * 3600);
    expect(dashboard.dailyMinutes).toBeCloseTo(80 * 60 / 59);
  });
  it('reduce el requisito cuando se estudia y lo aumenta tras un día sin sesión', () => {
    const threeHours = session('1', 'limites', 3 * 3600);
    expect(calculateDashboard([threeHours], DEFAULT_SETTINGS, new Date('2026-10-07T12:00:00-06:00')).dailyMinutes)
      .toBeCloseTo(77 * 60 / 58);
    expect(calculateDashboard([], DEFAULT_SETTINGS, new Date('2026-10-07T12:00:00-06:00')).dailyMinutes)
      .toBeCloseTo(80 * 60 / 58);
  });
  it('termina el periodo el día anterior al examen', () => {
    expect(calculateRemainingDays(new Date('2026-12-03T12:00:00-06:00'), DEFAULT_SETTINGS.lastStudyDate)).toBe(1);
    expect(calculateRemainingDays(new Date('2026-12-04T08:00:00-06:00'), DEFAULT_SETTINGS.lastStudyDate)).toBe(0);
    expect(calculateRequiredDailyMinutes(100, 0)).toBe(0);
  });
  it('nunca muestra restante negativo al superar 80 horas', () => {
    expect(calculateRemainingTime(80, 90 * 3600)).toBe(0);
    expect(calculateTotalStudyTime([session('1', 'limites', -20)])).toBe(0);
  });
  it('calcula el progreso por tema', () => {
    const topic = DEFAULT_TOPICS[0];
    const progress = calculateTopicProgress(topic, [session('1', topic.id, 7 * 3600)]);
    expect(progress.ratio).toBe(0.5);
    expect(progress.remainingSeconds).toBe(7 * 3600);
  });
  it('divide una sesión que cruza la medianoche', () => {
    const cross = { ...session('1', 'limites', 3600, '2026-10-07T00:30:00-06:00'), activeSegments: [{ startTime: '2026-10-06T23:30:00-06:00', endTime: '2026-10-07T00:30:00-06:00' }] };
    expect(getTodaySeconds([cross], new Date('2026-10-06T12:00:00-06:00'))).toBe(1800);
    expect(getTodaySeconds([cross], new Date('2026-10-07T12:00:00-06:00'))).toBe(1800);
    expect(getWeekSeconds([cross], new Date('2026-10-07T12:00:00-06:00'))).toBe(3600);
  });
  it('proyecta la fecha de finalización con el ritmo reciente', () => {
    const now = new Date('2026-10-06T18:00:00-06:00');
    const projection = calculateProjection([session('1', 'limites', 2 * 3600)], DEFAULT_SETTINGS, now);
    expect(projection.dailySeconds).toBe(7200);
    expect(projection.generalDailySeconds).toBe(7200);
    expect(projection.finishDate).toBe('2026-11-14');
    expect(calculateProjection([], DEFAULT_SETTINGS, now).finishDate).toBeNull();
  });
  it('calcula el estado de ritmo sin castigar el primer día', () => {
    expect(calculatePaceStatus([], DEFAULT_SETTINGS, new Date('2026-10-06T08:00:00-06:00'))).toBe('on-track');
    expect(calculatePaceStatus([], DEFAULT_SETTINGS, new Date('2026-10-07T08:00:00-06:00'))).toBe('recover');
    expect(calculatePaceStatus([session('1', 'limites', 3 * 3600)], DEFAULT_SETTINGS, new Date('2026-10-06T18:00:00-06:00'))).toBe('ahead');
  });
  it('no considera incorrectos los ejercicios sin resultado registrado', () => {
    const topic = DEFAULT_TOPICS[0];
    const sessions = [{ ...session('1', topic.id, 3600), exerciseCount: 10 }, { ...session('2', topic.id, 3600), exerciseCount: 4, correctExerciseCount: 3 }];
    expect(calculateTopicStats(topic, sessions).accuracy).toBe(0.75);
  });
});
