import { describe, it, expect } from 'vitest';
import {
  scoreAttempt,
  updateSkillMastery,
  calculateRecentAccuracy,
  calculateDifficulty,
  calculateXP,
  getMasteryWeights,
} from '../mastery';
import { ItemAttempt, LearnerProfile, SkillMastery, Difficulty } from '../../content/types';

// ── Test helpers ──

function makeAttempt(overrides: Partial<ItemAttempt> = {}): ItemAttempt {
  return {
    itemId: 'test-01',
    gameType: 'sound_snap',
    timestamp: Date.now(),
    correct: true,
    hintsUsed: 0,
    timeMs: 5000,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<LearnerProfile> = {}): LearnerProfile {
  return {
    learner: { age: 13, diagnoses: ['Dyslexia'], notes: [] },
    assessment_summary: {
      basic_reading_skills: 'Low Average',
      reading_fluency: 'Low Average',
      spelling: 'Low',
      oral_language: 'High',
      working_memory: 'Strong',
      processing_speed: 'Variable',
    },
    instructional_priorities: { top_targets: [], reduce: [] },
    recommended_settings: {
      session_minutes: 6,
      audio_instructions_default: true,
      timers_default: false,
      reduced_motion_default: true,
      extended_hint_ladder: true,
    },
    skill_weighting: {
      sound_snap: 0.3,
      blend_builder: 0.35,
      syllable_sprint: 0.2,
      morpheme_match: 0.15,
    },
    error_focus: {
      omission_errors: true,
      addition_errors: true,
      visual_guessing: true,
    },
    ...overrides,
  };
}

// ── Tests ──

describe('getMasteryWeights', () => {
  it('gives lower time weight for ADHD profiles', () => {
    const adhdProfile = makeProfile({
      learner: { age: 13, diagnoses: ['Dyslexia', 'ADHD_Inattentive'], notes: [] },
    });
    const weights = getMasteryWeights(adhdProfile);
    expect(weights.time).toBe(0.05);
    expect(weights.accuracy).toBe(0.75);
  });

  it('gives lower time weight for variable processing speed', () => {
    const profile = makeProfile();
    const weights = getMasteryWeights(profile);
    expect(weights.time).toBe(0.05); // processing_speed is 'Variable'
  });

  it('gives normal weights without attention concerns', () => {
    const profile = makeProfile({
      learner: { age: 13, diagnoses: ['Dyslexia'], notes: [] },
      assessment_summary: {
        basic_reading_skills: 'Average',
        reading_fluency: 'Average',
        spelling: 'Average',
        oral_language: 'Average',
        working_memory: 'Average',
        processing_speed: 'Average',
      },
    });
    const weights = getMasteryWeights(profile);
    expect(weights.time).toBe(0.20);
    expect(weights.accuracy).toBe(0.60);
  });

  it('returns default weights when profile is null', () => {
    const weights = getMasteryWeights(null);
    expect(weights.accuracy).toBe(0.60);
    expect(weights.hints).toBe(0.20);
    expect(weights.time).toBe(0.20);
  });
});

describe('scoreAttempt', () => {
  it('gives max score for fast correct answer with no hints', () => {
    const attempt = makeAttempt({ correct: true, hintsUsed: 0, timeMs: 3000 });
    const score = scoreAttempt(attempt, null);
    expect(score).toBe(100);
  });

  it('gives 0 accuracy component for wrong answers', () => {
    const attempt = makeAttempt({ correct: false, hintsUsed: 0, timeMs: 3000 });
    const score = scoreAttempt(attempt, null);
    expect(score).toBeLessThan(50); // only hints and time contribute
  });

  it('penalizes hint usage', () => {
    const noHints = scoreAttempt(makeAttempt({ hintsUsed: 0 }), null);
    const withHints = scoreAttempt(makeAttempt({ hintsUsed: 2 }), null);
    expect(noHints).toBeGreaterThan(withHints);
  });

  it('minimizes time penalty for ADHD profile', () => {
    const profile = makeProfile({
      learner: { age: 13, diagnoses: ['ADHD_Inattentive'], notes: [] },
    });
    const fastScore = scoreAttempt(makeAttempt({ timeMs: 5000 }), profile);
    const slowScore = scoreAttempt(makeAttempt({ timeMs: 60000 }), profile);
    // With ADHD, time weight is only 0.05, so difference should be small
    expect(fastScore - slowScore).toBeLessThan(10);
  });
});

describe('updateSkillMastery', () => {
  it('creates new mastery from scratch', () => {
    const attempt = makeAttempt({ correct: true });
    const mastery = updateSkillMastery(null, attempt, 80);
    expect(mastery.mastery).toBe(80);
    expect(mastery.totalAttempts).toBe(1);
    expect(mastery.correctAttempts).toBe(1);
    expect(mastery.streak).toBe(1);
  });

  it('updates existing mastery with EMA', () => {
    const existing: SkillMastery = {
      skill: 'digraphs',
      pattern: 'sh',
      mastery: 50,
      totalAttempts: 5,
      correctAttempts: 3,
      lastAttempted: Date.now() - 10000,
      lastCorrect: Date.now() - 10000,
      streak: 2,
      needsReview: false,
    };
    const attempt = makeAttempt({ correct: true });
    const updated = updateSkillMastery(existing, attempt, 100);
    // EMA: 50 * 0.7 + 100 * 0.3 = 65
    expect(updated.mastery).toBe(65);
    expect(updated.streak).toBe(3);
    expect(updated.totalAttempts).toBe(6);
  });

  it('resets streak on wrong answer', () => {
    const existing: SkillMastery = {
      skill: 'digraphs',
      pattern: 'sh',
      mastery: 80,
      totalAttempts: 10,
      correctAttempts: 8,
      lastAttempted: Date.now(),
      lastCorrect: Date.now(),
      streak: 5,
      needsReview: false,
    };
    const attempt = makeAttempt({ correct: false });
    const updated = updateSkillMastery(existing, attempt, 0);
    expect(updated.streak).toBe(0);
    expect(updated.needsReview).toBe(true);
  });

  it('marks needsReview when mastery drops below 70', () => {
    const existing: SkillMastery = {
      skill: 'digraphs',
      pattern: 'sh',
      mastery: 60,
      totalAttempts: 10,
      correctAttempts: 5,
      lastAttempted: Date.now(),
      lastCorrect: Date.now(),
      streak: 0,
      needsReview: false,
    };
    const attempt = makeAttempt({ correct: false });
    const updated = updateSkillMastery(existing, attempt, 0);
    expect(updated.needsReview).toBe(true);
  });
});

describe('calculateRecentAccuracy', () => {
  it('returns 0 for empty attempts', () => {
    expect(calculateRecentAccuracy([])).toBe(0);
  });

  it('calculates correct percentage from last 10', () => {
    const attempts: ItemAttempt[] = [];
    for (let i = 0; i < 10; i++) {
      attempts.push(makeAttempt({ correct: i < 8 })); // 8/10 correct
    }
    expect(calculateRecentAccuracy(attempts)).toBe(80);
  });

  it('only considers last N items', () => {
    const attempts: ItemAttempt[] = [];
    // 5 wrong then 5 right
    for (let i = 0; i < 5; i++) attempts.push(makeAttempt({ correct: false }));
    for (let i = 0; i < 5; i++) attempts.push(makeAttempt({ correct: true }));
    // Last 5 = all correct
    expect(calculateRecentAccuracy(attempts, 5)).toBe(100);
  });
});

describe('calculateDifficulty', () => {
  it('increases difficulty when accuracy >= 85% and hints < 0.5', () => {
    const result = calculateDifficulty(2 as Difficulty, 90, 0.2);
    expect(result).toBe(3);
  });

  it('decreases difficulty when accuracy < 60%', () => {
    const result = calculateDifficulty(3 as Difficulty, 50, 1.0);
    expect(result).toBe(2);
  });

  it('keeps difficulty when accuracy is between 60-85%', () => {
    const result = calculateDifficulty(2 as Difficulty, 70, 0.5);
    expect(result).toBe(2);
  });

  it('caps at difficulty 5', () => {
    const result = calculateDifficulty(5 as Difficulty, 90, 0);
    expect(result).toBe(5);
  });

  it('floors at difficulty 1', () => {
    const result = calculateDifficulty(1 as Difficulty, 40, 2);
    expect(result).toBe(1);
  });

  it('does not increase with high hint use even if accuracy high', () => {
    const result = calculateDifficulty(2 as Difficulty, 90, 1.0);
    expect(result).toBe(2);
  });
});

describe('calculateXP', () => {
  it('gives participation XP for wrong answers', () => {
    const attempt = makeAttempt({ correct: false });
    const xp = calculateXP(attempt, 1 as Difficulty, 0);
    expect(xp).toBe(2);
  });

  it('gives more XP for higher difficulty', () => {
    const attemptLow = makeAttempt({ correct: true });
    const attemptHigh = makeAttempt({ correct: true });
    const xpLow = calculateXP(attemptLow, 1 as Difficulty, 80);
    const xpHigh = calculateXP(attemptHigh, 5 as Difficulty, 80);
    expect(xpHigh).toBeGreaterThan(xpLow);
  });

  it('gives bonus for no hints', () => {
    const noHints = calculateXP(makeAttempt({ hintsUsed: 0 }), 1 as Difficulty, 80);
    const withHints = calculateXP(makeAttempt({ hintsUsed: 2 }), 1 as Difficulty, 80);
    expect(noHints).toBeGreaterThan(withHints);
  });
});
