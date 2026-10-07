import { DEFAULT_SETTINGS } from '@/constants/study';
import type { Settings } from '@/types/study';
import { readJson, writeJson } from './base';

const KEY = '@calculo80/settings/v1';
export async function loadSettings(): Promise<Settings> {
  const stored = await readJson<Settings>(KEY);
  if (stored) return stored;
  await writeJson(KEY, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
export async function saveSettings(settings: Settings): Promise<void> {
  await writeJson(KEY, settings);
}
