import {
  ProgressData,
  AppSettings,
  GameType,
  GameProgress,
  LearnerProfile,
  ItemAttempt,
  SkillMastery,
  SessionSummary,
  Badge,
} from '../content/types';

const PROGRESS_KEY = 'decodequest_progress';
const SETTINGS_KEY = 'decodequest_settings';
const SCHEMA_VERSION = 1;

// ── Default Factories ──

function createDefaultGameProgress(gameType: GameType): GameProgress {
  return {
    gameType,
    totalXP: 0,
    sessionsCompleted: 0,
    currentDifficulty: 1,
    recentAccuracy: 0,
    lastPlayed: 0,
  };
}

export function createDefaultProgress(): ProgressData {
  return {
    version: SCHEMA_VERSION,
    firstLoad: Date.now(),
    lastSession: 0,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    skillMasteries: [],
    gameProgress: {
      sound_snap: createDefaultGameProgress('sound_snap'),
      blend_builder: createDefaultGameProgress('blend_builder'),
      syllable_sprint: createDefaultGameProgress('syllable_sprint'),
      morpheme_match: createDefaultGameProgress('morpheme_match'),
    },
    recentAttempts: [],
    sessionHistory: [],
    badges: [],
    tutorialsShown: [],
  };
}

export function createDefaultSettings(profile?: LearnerProfile | null): AppSettings {
  const rec = profile?.recommended_settings;
  return {
    version: SCHEMA_VERSION,
    fontFamily: 'atkinson',
    fontSize: 'medium',
    letterSpacing: 'wide',
    lineHeight: 'relaxed',
    highContrast: false,
    reducedMotion: rec?.reduced_motion_default ?? false,
    audioInstructions: rec?.audio_instructions_default ?? true,
    showTimers: rec?.timers_default ?? false,
    sessionMinutes: rec?.session_minutes ?? 6,
    extendedHintLadder: rec?.extended_hint_ladder ?? true,
    profileLoaded: !!profile,
  };
}

// ── Storage Operations ──

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return createDefaultProgress();
    const data = JSON.parse(raw) as ProgressData;
    if (data.version !== SCHEMA_VERSION) {
      return migrateProgress(data);
    }
    return data;
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: ProgressData): void {
  if (typeof window === 'undefined') return;
  // Cap stored attempts and session history to prevent bloat
  const trimmed: ProgressData = {
    ...progress,
    recentAttempts: progress.recentAttempts.slice(-200),
    sessionHistory: progress.sessionHistory.slice(-30),
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(trimmed));
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return createDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return createDefaultSettings();
    return JSON.parse(raw) as AppSettings;
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
}

export function resetAll(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

// ── Helper: Add attempt to progress ──

export function addAttempt(progress: ProgressData, attempt: ItemAttempt): ProgressData {
  return {
    ...progress,
    recentAttempts: [...progress.recentAttempts, attempt],
  };
}

// ── Helper: Update or add skill mastery ──

export function upsertSkillMastery(
  progress: ProgressData,
  skill: string,
  pattern: string,
  updatedMastery: SkillMastery
): ProgressData {
  const existing = progress.skillMasteries.findIndex(
    m => m.skill === skill && m.pattern === pattern
  );

  const masteries = [...progress.skillMasteries];
  if (existing >= 0) {
    masteries[existing] = { ...updatedMastery, skill, pattern };
  } else {
    masteries.push({ ...updatedMastery, skill, pattern });
  }

  return { ...progress, skillMasteries: masteries };
}

// ── Helper: Add session summary ──

export function addSessionSummary(progress: ProgressData, summary: SessionSummary): ProgressData {
  // Update streak
  const today = new Date().toDateString();
  const lastSessionDate = progress.lastSession
    ? new Date(progress.lastSession).toDateString()
    : '';

  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let currentStreak = progress.currentStreak;
  if (lastSessionDate === today) {
    // Same day, no change
  } else if (lastSessionDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1; // streak reset
  }

  return {
    ...progress,
    lastSession: Date.now(),
    totalXP: progress.totalXP + summary.xpEarned,
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    sessionHistory: [...progress.sessionHistory, summary],
  };
}

// ── Helper: Add badge ──

export function addBadge(progress: ProgressData, badge: Badge): ProgressData {
  if (progress.badges.some(b => b.id === badge.id)) return progress;
  return {
    ...progress,
    badges: [...progress.badges, badge],
  };
}

// ── Migration (placeholder for future schema changes) ──

function migrateProgress(data: ProgressData): ProgressData {
  // Future: handle schema migrations here
  return { ...createDefaultProgress(), ...data, version: SCHEMA_VERSION };
}

// ── Load learner profile from public folder ──

export async function loadLearnerProfile(): Promise<LearnerProfile | null> {
  try {
    const response = await fetch('/student-profile/profile.json');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
