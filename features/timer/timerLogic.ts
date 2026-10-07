import type { ActiveTimer, StudySession } from '@/types/study';

export function startTimer(topicId: string, subtopicId?: string, now = new Date()): ActiveTimer {
  const iso = now.toISOString();
  return { id: `${now.getTime()}-${Math.random().toString(36).slice(2)}`, topicId, subtopicId, startTime: iso, accumulatedSeconds: 0, completedSegments: [], runningSince: iso };
}

export function pauseTimer(timer: ActiveTimer, now = new Date()): ActiveTimer {
  if (!timer.runningSince) return timer;
  const added = Math.max(0, (now.getTime() - Date.parse(timer.runningSince)) / 1000);
  return { ...timer, accumulatedSeconds: timer.accumulatedSeconds + added, completedSegments: [...timer.completedSegments, { startTime: timer.runningSince, endTime: now.toISOString() }], runningSince: null };
}

export function resumeTimer(timer: ActiveTimer, now = new Date()): ActiveTimer {
  if (timer.finishedAt || timer.runningSince) return timer;
  return { ...timer, runningSince: now.toISOString() };
}

export function finishTimer(timer: ActiveTimer, now = new Date()): ActiveTimer {
  return { ...pauseTimer(timer, now), finishedAt: now.toISOString() };
}

export function finishMockTimer(timer: ActiveTimer, now = new Date()): ActiveTimer {
  const paused = pauseTimer(timer, now);
  const limit = timer.targetSeconds ?? 7200;
  if (paused.accumulatedSeconds <= limit) return { ...paused, finishedAt: now.toISOString() };
  let remaining = limit;
  const segments: ActiveTimer['completedSegments'] = [];
  for (const segment of paused.completedSegments) {
    if (remaining <= 0) break;
    const seconds = Math.max(0, (Date.parse(segment.endTime) - Date.parse(segment.startTime)) / 1000);
    const kept = Math.min(seconds, remaining);
    segments.push({ startTime: segment.startTime, endTime: new Date(Date.parse(segment.startTime) + kept * 1000).toISOString() });
    remaining -= kept;
  }
  return { ...paused, accumulatedSeconds: limit, completedSegments: segments, finishedAt: segments.at(-1)?.endTime ?? now.toISOString() };
}

export function makeSession(timer: ActiveTimer, details: Pick<StudySession, 'exerciseCount' | 'correctExerciseCount' | 'difficulty' | 'notes'>): StudySession {
  if (!timer.finishedAt) throw new Error('El cronómetro aún no terminó.');
  return {
    id: timer.id,
    topicId: timer.topicId,
    subtopicId: timer.subtopicId,
    startTime: timer.startTime,
    endTime: timer.finishedAt,
    durationSeconds: Math.max(0, Math.floor(timer.accumulatedSeconds)),
    activeSegments: timer.completedSegments,
    ...details,
    createdAt: new Date().toISOString(),
  };
}
