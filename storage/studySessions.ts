import type { StudySession } from '@/types/study';
import { readJson, writeJson } from './base';

const KEY = '@calculo80/sessions/v1';
export async function loadStudySessions(): Promise<StudySession[]> {
  return (await readJson<StudySession[]>(KEY)) ?? [];
}
export async function saveStudySessions(sessions: StudySession[]): Promise<void> {
  await writeJson(KEY, sessions);
}
