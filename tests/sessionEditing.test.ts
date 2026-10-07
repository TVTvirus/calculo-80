import { describe, expect, it } from 'vitest';
import { parseSessionForm, type SessionFormValues } from '@/services/sessionEditing';

const form: SessionFormValues = { topicId: 'limites', date: '2026-10-06', startTime: '08:00', durationMinutes: '90', exerciseCount: '12', correctExerciseCount: '9', difficulty: 3, notes: '  Factorización  ' };
const now = new Date('2026-10-06T12:00:00-06:00');

describe('sesiones manuales y edición', () => {
  it('crea una sesión con duración, fechas ISO y resultados coherentes', () => {
    const session = parseSessionForm(form, undefined, now);
    expect(session.durationSeconds).toBe(5400);
    expect(Date.parse(session.endTime) - Date.parse(session.startTime)).toBe(5400000);
    expect(session.activeSegments).toHaveLength(1);
    expect(session.correctExerciseCount).toBe(9);
    expect(session.notes).toBe('Factorización');
  });
  it('conserva los segmentos al editar solo el tema o la nota', () => {
    const original = parseSessionForm(form, undefined, now);
    const edited = parseSessionForm({ ...form, topicId: 'derivadas', notes: '  Cadena  ' }, original, now);
    expect(edited.id).toBe(original.id);
    expect(edited.startTime).toBe(original.startTime);
    expect(edited.activeSegments).toEqual(original.activeSegments);
    expect(edited.notes).toBe('Cadena');
  });
  it('rechaza duraciones negativas, fechas imposibles y correctos excesivos', () => {
    expect(() => parseSessionForm({ ...form, durationMinutes: '-3' }, undefined, now)).toThrow();
    expect(() => parseSessionForm({ ...form, date: '2026-02-30' }, undefined, now)).toThrow();
    expect(() => parseSessionForm({ ...form, correctExerciseCount: '13' }, undefined, now)).toThrow();
  });
  it('rechaza una sesión que termina en el futuro', () => {
    expect(() => parseSessionForm({ ...form, startTime: '11:30' }, undefined, now)).toThrow();
  });
});
