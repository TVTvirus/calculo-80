export type StudyTopic = {
  id: string;
  name: string;
  targetMinutes: number;
  subtopics: { id: string; name: string }[];
  createdAt: string;
};

export type StudySession = {
  id: string;
  topicId: string;
  subtopicId?: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  activeSegments?: { startTime: string; endTime: string }[];
  exerciseCount?: number;
  correctExerciseCount?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
};

export type MockExam = {
  id: string;
  date: string;
  durationSeconds: number;
  exerciseCount?: number;
  score?: number;
  maximumScore?: number;
  failedTopicIds: string[];
  mainErrors?: string;
  notes?: string;
};

export type Settings = {
  targetHours: number;
  startDate: string;
  examDate: string;
  lastStudyDate: string;
  theme: 'dark' | 'light' | 'system';
  lastCelebratedMilestone?: number;
};

export type ActiveTimer = {
  id: string;
  topicId: string;
  subtopicId?: string;
  startTime: string;
  accumulatedSeconds: number;
  completedSegments: { startTime: string; endTime: string }[];
  runningSince: string | null;
  finishedAt?: string;
  mode?: 'study' | 'mock';
  targetSeconds?: number;
};
