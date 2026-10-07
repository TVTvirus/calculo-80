import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, DEFAULT_TOPICS } from '@/constants/study';
import { chooseRecommendedTopic } from '@/services/recommendation';
import type { StudySession } from '@/types/study';

const session = (id: string, topicId: string, durationSeconds: number, endTime = '2026-10-06T12:00:00-06:00'): StudySession => ({ id, topicId, startTime: endTime, endTime, durationSeconds, createdAt: endTime });

describe('recomendación diaria', () => {
  it('prioriza límites al inicio y propone el primer subtema', () => {
    const result = chooseRecommendedTopic(DEFAULT_TOPICS, [], DEFAULT_SETTINGS, new Date('2026-10-06T08:00:00-06:00'));
    expect(result).toMatchObject({ topicId: 'limites', subtopicId: 'limites-1', stageId: 'limits-start', minutes: 82, phase: 1 });
  });
  it('reduce la duración sugerida después de estudiar hoy', () => {
    const studied = session('1', 'limites', 3600);
    const result = chooseRecommendedTopic(DEFAULT_TOPICS, [studied], DEFAULT_SETTINGS, new Date('2026-10-06T15:00:00-06:00'));
    expect(result?.minutes).toBeLessThan(82);
  });
  it('cambia de tema cuando el objetivo de la fase está cubierto', () => {
    const completed = session('1', 'limites', 14 * 3600);
    const result = chooseRecommendedTopic(DEFAULT_TOPICS, [completed], DEFAULT_SETTINGS, new Date('2026-10-07T08:00:00-06:00'));
    expect(result?.topicId).not.toBe('limites');
  });
  it('respeta la fase de integrales y el fin del plazo', () => {
    expect(chooseRecommendedTopic(DEFAULT_TOPICS, [], DEFAULT_SETTINGS, new Date('2026-11-14T08:00:00-06:00'))?.topicId).toBe('integrales');
    expect(chooseRecommendedTopic(DEFAULT_TOPICS, [], DEFAULT_SETTINGS, new Date('2026-12-04T08:00:00-06:00'))).toBeNull();
  });
  it('da más prioridad a un tema fallado recientemente en simulacros', () => {
    const now = new Date('2026-11-03T08:00:00-06:00');
    const base = chooseRecommendedTopic(DEFAULT_TOPICS, [], DEFAULT_SETTINGS, now);
    const failed = Array.from({ length: 3 }, (_, index) => ({ id: `mock-${index}`, date: now.toISOString(), durationSeconds: 7200, failedTopicIds: ['tangente'] }));
    const revised = chooseRecommendedTopic(DEFAULT_TOPICS, [], DEFAULT_SETTINGS, now, failed);
    expect(base?.topicId).toBe('logaritmica');
    expect(revised?.topicId).toBe('tangente');
  });
});
