import type { StudySession } from '@/types/study';
import { localDateKey } from '@/utils/time';

export type SessionFormValues = {
  topicId: string;
  subtopicId?: string;
  date: string;
  startTime: string;
  durationMinutes: string;
  exerciseCount: string;
  correctExerciseCount: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  notes: string;
};

function optionalCount(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error('Los ejercicios deben ser números enteros desde 0.');
  return number;
}

export function parseSessionForm(values: SessionFormValues, original?: StudySession, now = new Date()): StudySession {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !/^\d{2}:\d{2}$/.test(values.startTime)) {
    throw new Error('Usá fecha AAAA-MM-DD y hora HH:MM.');
  }
  const start = new Date(`${values.date}T${values.startTime}:00`);
  if (Number.isNaN(start.getTime()) || localDateKey(start) !== values.date ||
    `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}` !== values.startTime) {
    throw new Error('La fecha o la hora no existe.');
  }
  const minutes = Number(values.durationMinutes);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 24 * 60) {
    throw new Error('La duración debe estar entre 1 y 1440 minutos.');
  }
  const end = new Date(start.getTime() + minutes * 60000);
  if (end.getTime() > now.getTime()) throw new Error('La sesión no puede terminar en el futuro.');
  const exercises = optionalCount(values.exerciseCount);
  const correct = optionalCount(values.correctExerciseCount);
  if (correct !== undefined && (exercises === undefined || correct > exercises)) {
    throw new Error('Los correctos deben estar entre 0 y los ejercicios realizados.');
  }
  const unchangedTime = original && localDateKey(new Date(original.startTime)) === values.date &&
    `${String(new Date(original.startTime).getHours()).padStart(2, '0')}:${String(new Date(original.startTime).getMinutes()).padStart(2, '0')}` === values.startTime &&
    Math.round(original.durationSeconds / 60) === minutes;
  const iso = now.toISOString();
  return {
    id: original?.id ?? `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
    topicId: values.topicId,
    subtopicId: values.subtopicId,
    startTime: unchangedTime ? original.startTime : start.toISOString(),
    endTime: unchangedTime ? original.endTime : end.toISOString(),
    durationSeconds: unchangedTime ? original.durationSeconds : minutes * 60,
    activeSegments: unchangedTime ? original.activeSegments : [{ startTime: start.toISOString(), endTime: end.toISOString() }],
    exerciseCount: exercises,
    correctExerciseCount: correct,
    difficulty: values.difficulty,
    notes: values.notes.trim() || undefined,
    createdAt: original?.createdAt ?? iso,
  };
}
