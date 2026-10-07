import { describe, expect, it } from 'vitest';
import { WORKED_EXERCISES, getExercisesForStage } from '@/constants/exercises';
import { PRACTICE_STAGES } from '@/constants/learningRoadmap';
import { DEFAULT_TOPICS } from '@/constants/study';

describe('recorrido guiado', () => {
  it('reparte exactamente 80 horas según los objetivos de cada tema', () => {
    for (const topic of DEFAULT_TOPICS) {
      expect(PRACTICE_STAGES.filter((stage) => stage.topicId === topic.id).reduce((total, stage) => total + stage.targetMinutes, 0)).toBe(topic.targetMinutes);
    }
    expect(PRACTICE_STAGES.reduce((total, stage) => total + stage.targetMinutes, 0)).toBe(80 * 60);
  });

  it('ofrece ejercicios progresivos con respuestas y pasos en cada bloque', () => {
    expect(WORKED_EXERCISES).toHaveLength(41);
    for (const stage of PRACTICE_STAGES) {
      const exercises = getExercisesForStage(stage.id);
      expect(exercises.length).toBeGreaterThanOrEqual(3);
      expect(exercises[0].level).toBe('Arranque');
      expect(exercises[1].level).toBe('Práctica');
      expect(exercises[2].level).toBe('Nivel parcial');
      expect(exercises.every((exercise) => exercise.answer.length > 0 && exercise.steps.length > 0)).toBe(true);
    }
  });
});
