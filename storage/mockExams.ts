import type { MockExam } from '@/types/study';
import { readJson, writeJson } from './base';

const KEY = '@calculo80/mockExams/v1';
export async function loadMockExams(): Promise<MockExam[]> {
  return (await readJson<MockExam[]>(KEY)) ?? [];
}
export async function saveMockExams(exams: MockExam[]): Promise<void> {
  await writeJson(KEY, exams);
}
