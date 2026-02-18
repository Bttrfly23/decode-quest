import {
  ItemAttempt,
  SkillMastery,
  GameProgress,
  ProgressData,
  LearnerProfile,
  Difficulty,
} from '../content/types';

/**
 * Mastery update engine.
 *
 * Personalization:
 * - If profile indicates attention/processing speed concerns,
 *   time-to-answer is weighted minimally (precision > speed).
 * - Hint usage is penalized gently to encourage hint use without shame.
 * - Accuracy is the dominant factor.
 */

const MASTERY_MAX = 100;
const MASTERY_MIN = 0;
const RECENT_WINDOW = 10;

interface MasteryWeights {
  accuracy: number;
  hints: number;
  time: number;
}

export function getMasteryWeights(profile: LearnerProfile | null): MasteryWeights {
  const hasAttentionConcerns = profile?.learner.diagnoses.some(
    d => d.toLowerCase().includes('adhd') || d.toLowerCase().includes('attention')
  );
  const hasProcessingSpeedConcerns =
    profile?.assessment_summary.processing_speed === 'Variable' ||
    profile?.assessment_summary.processing_speed === 'Low';

  if (hasAttentionConcerns || hasProcessingSpeedConcerns) {
    // Minimize time penalty for ADHD/processing speed concerns
    return { accuracy: 0.75, hints: 0.20, time: 0.05 };
  }
  return { accuracy: 0.60, hints: 0.20, time: 0.20 };
}

/**
 * Calculate a score for a single attempt (0–100).
 */
export function scoreAttempt(
  attempt: ItemAttempt,
  profile: LearnerProfile | null,
  maxHints: number = 4
): number {
  const weights = getMasteryWeights(profile);

  // Accuracy: 100 if correct, 0 if not
  const accuracyScore = attempt.correct ? 100 : 0;

  // Hint penalty: each hint reduces score proportionally
  const hintPenalty = Math.min(attempt.hintsUsed / maxHints, 1);
  const hintScore = (1 - hintPenalty) * 100;

  // Time score: generous — up to 30s is full marks, degrades slowly
  const timeSec = attempt.timeMs / 1000;
  const timeScore = timeSec <= 30 ? 100 : Math.max(0, 100 - (timeSec - 30) * 2);

  return Math.round(
    accuracyScore * weights.accuracy +
    hintScore * weights.hints +
    timeScore * weights.time
  );
}

/**
 * Update mastery for a skill+pattern based on a new attempt.
 * Uses exponential moving average so recent performance matters more.
 */
export function updateSkillMastery(
  existing: SkillMastery | null,
  attempt: ItemAttempt,
  attemptScore: number
): SkillMastery {
  const now = Date.now();

  if (!existing) {
    return {
      skill: '',    // caller sets these
      pattern: '',
      mastery: attemptScore,
      totalAttempts: 1,
      correctAttempts: attempt.correct ? 1 : 0,
      lastAttempted: now,
      lastCorrect: attempt.correct ? now : 0,
      streak: attempt.correct ? 1 : 0,
      needsReview: !attempt.correct,
    };
  }

  // EMA: alpha=0.3 gives recent attempts ~2x weight of older ones
  const alpha = 0.3;
  const newMastery = Math.round(
    Math.min(MASTERY_MAX, Math.max(MASTERY_MIN,
      existing.mastery * (1 - alpha) + attemptScore * alpha
    ))
  );

  const newStreak = attempt.correct ? existing.streak + 1 : 0;

  return {
    ...existing,
    mastery: newMastery,
    totalAttempts: existing.totalAttempts + 1,
    correctAttempts: existing.correctAttempts + (attempt.correct ? 1 : 0),
    lastAttempted: now,
    lastCorrect: attempt.correct ? now : existing.lastCorrect,
    streak: newStreak,
    needsReview: newMastery < 70 || !attempt.correct,
  };
}

/**
 * Calculate rolling accuracy from recent attempts.
 */
export function calculateRecentAccuracy(attempts: ItemAttempt[], window: number = RECENT_WINDOW): number {
  if (attempts.length === 0) return 0;
  const recent = attempts.slice(-window);
  const correct = recent.filter(a => a.correct).length;
  return Math.round((correct / recent.length) * 100);
}

/**
 * Determine appropriate difficulty based on recent performance.
 */
export function calculateDifficulty(
  currentDifficulty: Difficulty,
  recentAccuracy: number,
  recentHintUsage: number // average hints per item in last 10
): Difficulty {
  // Increase difficulty: accuracy >= 85% and low hint use
  if (recentAccuracy >= 85 && recentHintUsage < 0.5) {
    return Math.min(5, currentDifficulty + 1) as Difficulty;
  }

  // Decrease difficulty: accuracy < 60%
  if (recentAccuracy < 60) {
    return Math.max(1, currentDifficulty - 1) as Difficulty;
  }

  return currentDifficulty;
}

/**
 * Calculate XP earned for an attempt.
 * Rewards accuracy + difficulty; no punishment for misses.
 */
export function calculateXP(
  attempt: ItemAttempt,
  difficulty: Difficulty,
  attemptScore: number
): number {
  if (!attempt.correct) {
    // Small participation XP — no punishment
    return 2;
  }

  const baseXP = 10;
  const difficultyBonus = difficulty * 3;
  const scoreBonus = Math.round(attemptScore / 20);
  const noHintBonus = attempt.hintsUsed === 0 ? 5 : 0;

  return baseXP + difficultyBonus + scoreBonus + noHintBonus;
}

/**
 * Update game progress after an attempt.
 */
export function updateGameProgress(
  progress: GameProgress,
  attempt: ItemAttempt,
  allRecentAttempts: ItemAttempt[]
): GameProgress {
  const gameAttempts = allRecentAttempts.filter(a => a.gameType === progress.gameType);
  const recentAccuracy = calculateRecentAccuracy(gameAttempts);
  const recentHints = gameAttempts.slice(-RECENT_WINDOW);
  const avgHints = recentHints.length > 0
    ? recentHints.reduce((sum, a) => sum + a.hintsUsed, 0) / recentHints.length
    : 0;

  return {
    ...progress,
    totalXP: progress.totalXP + calculateXP(attempt, progress.currentDifficulty, scoreAttempt(attempt, null)),
    currentDifficulty: calculateDifficulty(progress.currentDifficulty, recentAccuracy, avgHints),
    recentAccuracy,
    lastPlayed: Date.now(),
  };
}
