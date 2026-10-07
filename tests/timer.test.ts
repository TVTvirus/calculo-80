import { describe, expect, it } from 'vitest';
import { finishMockTimer, finishTimer, makeSession, pauseTimer, resumeTimer, startTimer } from '@/features/timer/timerLogic';
import { getTimerSeconds } from '@/services/progress';

describe('cronómetro recuperable', () => {
  it('limita el simulacro a 120 minutos aunque la app se reabra tarde', () => {
    const started = { ...startTimer('simulacros', undefined, new Date('2026-10-06T10:00:00Z')), mode: 'mock' as const, targetSeconds: 7200 };
    const first = pauseTimer(started, new Date('2026-10-06T10:30:00Z'));
    const resumed = resumeTimer(first, new Date('2026-10-06T11:00:00Z'));
    const ended = finishMockTimer(resumed, new Date('2026-10-06T14:00:00Z'));
    const saved = makeSession(ended, {});
    expect(saved.durationSeconds).toBe(7200);
    expect(saved.endTime).toBe('2026-10-06T12:30:00.000Z');
    expect(saved.activeSegments).toEqual([
      { startTime: '2026-10-06T10:00:00.000Z', endTime: '2026-10-06T10:30:00.000Z' },
      { startTime: '2026-10-06T11:00:00.000Z', endTime: '2026-10-06T12:30:00.000Z' },
    ]);
  });
  it('se reconstruye tras serializar el estado activo', () => {
    const timer = startTimer('limites', undefined, new Date('2026-10-06T10:00:00Z'));
    const restored = JSON.parse(JSON.stringify(timer));
    expect(getTimerSeconds(restored, Date.parse('2026-10-06T11:00:00Z'))).toBe(3600);
  });
  it('usa hora real transcurrida y descuenta pausas', () => {
    const start = startTimer('derivadas', undefined, new Date('2026-10-06T10:00:00Z'));
    expect(getTimerSeconds(start, Date.parse('2026-10-06T10:45:00Z'))).toBe(2700);
    const paused = pauseTimer(start, new Date('2026-10-06T10:45:00Z'));
    expect(getTimerSeconds(paused, Date.parse('2026-10-06T11:30:00Z'))).toBe(2700);
    const resumed = resumeTimer(paused, new Date('2026-10-06T11:30:00Z'));
    expect(resumeTimer(resumed, new Date('2026-10-06T11:45:00Z'))).toEqual(resumed);
    const finished = finishTimer(resumed, new Date('2026-10-06T12:00:00Z'));
    const studySession = makeSession(finished, { exerciseCount: 12, correctExerciseCount: 9 });
    expect(studySession.durationSeconds).toBe(4500);
    expect(studySession.startTime).toBe('2026-10-06T10:00:00.000Z');
    expect(studySession.endTime).toBe('2026-10-06T12:00:00.000Z');
    expect(studySession.activeSegments).toHaveLength(2);
  });
});
