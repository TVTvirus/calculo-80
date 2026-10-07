import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clearActiveTimer, loadActiveTimer, saveActiveTimer } from '@/storage/activeTimer';
import { loadMockExams, saveMockExams } from '@/storage/mockExams';
import { loadSettings, saveSettings } from '@/storage/settings';
import { loadStudySessions, saveStudySessions } from '@/storage/studySessions';
import { loadTopics, saveTopics } from '@/storage/topics';
import { finishMockTimer, finishTimer, makeSession, pauseTimer, resumeTimer, startTimer } from '@/features/timer/timerLogic';
import { calculateReachedMilestone, calculateTotalStudyTime } from '@/services/progress';
import type { ActiveTimer, MockExam, Settings, StudySession, StudyTopic } from '@/types/study';

export type SessionDetails = Pick<StudySession, 'exerciseCount' | 'correctExerciseCount' | 'difficulty' | 'notes'>;
export type MockResultDetails = Pick<MockExam, 'exerciseCount' | 'score' | 'maximumScore' | 'failedTopicIds' | 'mainErrors' | 'notes'>;

type StudyContextValue = {
  ready: boolean;
  busy: boolean;
  error: string | null;
  settings: Settings | null;
  topics: StudyTopic[];
  sessions: StudySession[];
  mockExams: MockExam[];
  timer: ActiveTimer | null;
  pendingMilestone: number | null;
  begin: (topicId: string, subtopicId?: string) => Promise<void>;
  startMock: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  finish: () => Promise<void>;
  discard: () => Promise<void>;
  saveSession: (details: SessionDetails) => Promise<void>;
  saveMockExam: (details: MockResultDetails) => Promise<boolean>;
  acknowledgeMilestone: () => Promise<void>;
  addManualSession: (session: StudySession) => Promise<boolean>;
  editSession: (session: StudySession) => Promise<boolean>;
  deleteSession: (id: string) => Promise<boolean>;
  updateTopicTarget: (id: string, targetMinutes: number) => Promise<boolean>;
  updateSettings: (nextSettings: Settings) => Promise<boolean>;
  dismissError: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [timer, setTimer] = useState<ActiveTimer | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadSettings(), loadTopics(), loadStudySessions(), loadActiveTimer(), loadMockExams()])
      .then(async ([nextSettings, nextTopics, nextSessions, nextTimer, nextMockExams]) => {
        if (nextTimer && nextSessions.some((session) => session.id === nextTimer?.id)) {
          await clearActiveTimer();
          nextTimer = null;
        }
        if (!mounted) return;
        setSettings(nextSettings);
        setTopics(nextTopics);
        setSessions(nextSessions);
        setMockExams(nextMockExams);
        setTimer(nextTimer);
      })
      .catch((cause: unknown) => {
        if (mounted) setError(`No se pudieron cargar los datos: ${String(cause)}`);
      })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const performResult = useCallback(async (operation: () => Promise<void>): Promise<boolean> => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try { await operation(); return true; }
    catch (cause) { setError(`No se pudo guardar: ${String(cause)}`); return false; }
    finally { busyRef.current = false; setBusy(false); }
  }, []);
  const perform = useCallback(async (operation: () => Promise<void>) => { await performResult(operation); }, [performResult]);

  const begin = async (topicId: string, subtopicId?: string) => perform(async () => {
    if (timer || !topics.some((topic) => topic.id === topicId)) return;
    const next = startTimer(topicId, subtopicId);
    await saveActiveTimer(next);
    setTimer(next);
  });
  const startMock = async () => perform(async () => {
    if (timer) return;
    const next: ActiveTimer = { ...startTimer('simulacros'), mode: 'mock', targetSeconds: 7200 };
    await saveActiveTimer(next);
    setTimer(next);
  });
  const pause = async () => perform(async () => {
    if (!timer || !timer.runningSince) return;
    const next = pauseTimer(timer);
    await saveActiveTimer(next);
    setTimer(next);
  });
  const resume = async () => perform(async () => {
    if (!timer || timer.runningSince || timer.finishedAt) return;
    const next = resumeTimer(timer);
    await saveActiveTimer(next);
    setTimer(next);
  });
  const finish = async () => perform(async () => {
    if (!timer || timer.finishedAt) return;
    const next = timer.mode === 'mock' ? finishMockTimer(timer) : finishTimer(timer);
    await saveActiveTimer(next);
    setTimer(next);
  });
  const discard = async () => perform(async () => {
    if (!timer) return;
    await clearActiveTimer();
    setTimer(null);
  });
  const saveSession = async (details: SessionDetails) => perform(async () => {
    if (!timer?.finishedAt || timer.mode === 'mock') return;
    const session = makeSession(timer, details);
    const next = sessions.some((old) => old.id === session.id) ? sessions : [session, ...sessions];
    await saveStudySessions(next);
    await clearActiveTimer();
    setSessions(next);
    setTimer(null);
  });

  const saveMockExam = async (details: MockResultDetails) => performResult(async () => {
    if (!timer?.finishedAt || timer.mode !== 'mock') throw new Error('No hay simulacro terminado.');
    if (details.exerciseCount !== undefined && (!Number.isInteger(details.exerciseCount) || details.exerciseCount < 0)) throw new Error('Cantidad de ejercicios inválida.');
    if ((details.score === undefined) !== (details.maximumScore === undefined) ||
      (details.score !== undefined && (details.maximumScore === undefined || details.maximumScore <= 0 || details.score < 0 || details.score > details.maximumScore))) throw new Error('Revisá la nota y la puntuación máxima.');
    if (details.failedTopicIds.some((id) => !topics.some((topic) => topic.id === id))) throw new Error('Tema fallado inválido.');
    const session = makeSession(timer, { exerciseCount: details.exerciseCount, notes: details.mainErrors || details.notes ? `Simulacro. ${details.mainErrors ?? ''} ${details.notes ?? ''}`.trim() : 'Simulacro' });
    const exam: MockExam = { id: timer.id, date: session.endTime, durationSeconds: session.durationSeconds, ...details };
    const nextExams = mockExams.some((old) => old.id === exam.id) ? mockExams : [exam, ...mockExams];
    const nextSessions = sessions.some((old) => old.id === session.id) ? sessions : [session, ...sessions];
    await saveMockExams(nextExams);
    await saveStudySessions(nextSessions);
    await clearActiveTimer();
    setMockExams(nextExams);
    setSessions(nextSessions);
    setTimer(null);
  });

  const addManualSession = async (session: StudySession) => performResult(async () => {
    if (!topics.some((topic) => topic.id === session.topicId) || sessions.some((old) => old.id === session.id)) throw new Error('Tema o sesión inválida.');
    const next = [session, ...sessions].sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
    await saveStudySessions(next);
    setSessions(next);
  });
  const editSession = async (session: StudySession) => performResult(async () => {
    if (!topics.some((topic) => topic.id === session.topicId) || !sessions.some((old) => old.id === session.id)) throw new Error('Tema o sesión inválida.');
    const relatedMock = mockExams.find((exam) => exam.id === session.id);
    if (relatedMock && session.topicId !== 'simulacros') throw new Error('Un simulacro debe mantenerse en el tema Simulacros.');
    const next = sessions.map((old) => old.id === session.id ? session : old).sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
    if (relatedMock) {
      const nextExams = mockExams.map((exam) => exam.id === session.id ? { ...exam, date: session.endTime, durationSeconds: session.durationSeconds, exerciseCount: session.exerciseCount } : exam);
      await saveMockExams(nextExams);
      setMockExams(nextExams);
    }
    await saveStudySessions(next);
    setSessions(next);
  });
  const deleteSession = async (id: string) => performResult(async () => {
    if (!sessions.some((session) => session.id === id)) throw new Error('No se encontró la sesión.');
    const next = sessions.filter((session) => session.id !== id);
    const nextExams = mockExams.filter((exam) => exam.id !== id);
    if (nextExams.length !== mockExams.length) {
      await saveMockExams(nextExams);
      setMockExams(nextExams);
    }
    await saveStudySessions(next);
    setSessions(next);
  });
  const updateTopicTarget = async (id: string, targetMinutes: number) => performResult(async () => {
    if (!Number.isInteger(targetMinutes) || targetMinutes < 0 || !topics.some((topic) => topic.id === id)) throw new Error('Objetivo de tema inválido.');
    const next = topics.map((topic) => topic.id === id ? { ...topic, targetMinutes } : topic);
    await saveTopics(next);
    setTopics(next);
  });
  const updateSettings = async (nextSettings: Settings) => performResult(async () => {
    if (!Number.isFinite(nextSettings.targetHours) || nextSettings.targetHours <= 0) throw new Error('Objetivo general inválido.');
    await saveSettings(nextSettings);
    setSettings(nextSettings);
  });

  const reachedMilestone = settings ? calculateReachedMilestone(calculateTotalStudyTime(sessions)) : 0;
  const pendingMilestone = reachedMilestone > (settings?.lastCelebratedMilestone ?? 0) ? reachedMilestone : null;
  const acknowledgeMilestone = async () => perform(async () => {
    if (!settings || !pendingMilestone) return;
    const next = { ...settings, lastCelebratedMilestone: pendingMilestone };
    await saveSettings(next);
    setSettings(next);
  });

  return <StudyContext.Provider value={{ ready, busy, error, settings, topics, sessions, mockExams, timer, pendingMilestone, begin, startMock, pause, resume, finish, discard, saveSession, saveMockExam, acknowledgeMilestone, addManualSession, editSession, deleteSession, updateTopicTarget, updateSettings, dismissError: () => setError(null) }}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const value = useContext(StudyContext);
  if (!value) throw new Error('StudyProvider ausente');
  return value;
}
