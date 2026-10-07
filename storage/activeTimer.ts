import type { ActiveTimer } from '@/types/study';
import { readJson, writeJson, remove } from './base';

const KEY = '@calculo80/activeTimer/v1';
export async function loadActiveTimer(): Promise<ActiveTimer | null> {
  return readJson<ActiveTimer>(KEY);
}
export async function saveActiveTimer(timer: ActiveTimer): Promise<void> {
  await writeJson(KEY, timer);
}
export async function clearActiveTimer(): Promise<void> {
  await remove(KEY);
}
