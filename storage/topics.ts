import { DEFAULT_TOPICS } from '@/constants/study';
import type { StudyTopic } from '@/types/study';
import { readJson, writeJson } from './base';

const KEY = '@calculo80/topics/v1';
export async function loadTopics(): Promise<StudyTopic[]> {
  const stored = await readJson<StudyTopic[]>(KEY);
  if (stored) return stored;
  await writeJson(KEY, DEFAULT_TOPICS);
  return DEFAULT_TOPICS;
}
export async function saveTopics(topics: StudyTopic[]): Promise<void> {
  await writeJson(KEY, topics);
}
