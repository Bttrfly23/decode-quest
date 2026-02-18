import { describe, it, expect } from 'vitest';
import {
  detectGuessing,
  classifyError,
  getErrorFeedback,
  detectErrors,
} from '../error-detection';
import { ItemAttempt, LearnerProfile } from '../../content/types';

function makeAttempt(overrides: Partial<ItemAttempt> = {}): ItemAttempt {
  return {
    itemId: 'test-01',
    gameType: 'blend_builder',
    timestamp: Date.now(),
    correct: false,
    hintsUsed: 0,
    timeMs: 5000,
    ...overrides,
  };
}

function makeProfile(errorFocus: Partial<LearnerProfile['error_focus']> = {}): LearnerProfile {
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
      ...errorFocus,
    },
  };
}

describe('detectGuessing', () => {
  it('detects guessing when fast wrong without hints twice', () => {
    const current = makeAttempt({ correct: false, timeMs: 2000, hintsUsed: 0 });
    const recent = [makeAttempt({ correct: false, timeMs: 1500, hintsUsed: 0 })];
    expect(detectGuessing(current, recent)).toBe(true);
  });

  it('does not flag guessing for slow answers', () => {
    const current = makeAttempt({ correct: false, timeMs: 10000, hintsUsed: 0 });
    const recent = [makeAttempt({ correct: false, timeMs: 8000, hintsUsed: 0 })];
    expect(detectGuessing(current, recent)).toBe(false);
  });

  it('does not flag guessing when hints are used', () => {
    const current = makeAttempt({ correct: false, timeMs: 2000, hintsUsed: 1 });
    const recent = [makeAttempt({ correct: false, timeMs: 1500, hintsUsed: 0 })];
    expect(detectGuessing(current, recent)).toBe(false);
  });

  it('does not flag guessing for correct answers', () => {
    const current = makeAttempt({ correct: true, timeMs: 2000, hintsUsed: 0 });
    const recent = [makeAttempt({ correct: false, timeMs: 1500, hintsUsed: 0 })];
    expect(detectGuessing(current, recent)).toBe(false);
  });

  it('does not flag guessing on first attempt', () => {
    const current = makeAttempt({ correct: false, timeMs: 1000, hintsUsed: 0 });
    expect(detectGuessing(current, [])).toBe(false);
  });
});

describe('classifyError', () => {
  it('detects omission when user answer is shorter', () => {
    const profile = makeProfile({ omission_errors: true });
    const result = classifyError(['s', 'a'], ['s', 'a', 't'], profile);
    expect(result).toBe('omission');
  });

  it('detects addition when user answer is longer', () => {
    const profile = makeProfile({ addition_errors: true });
    const result = classifyError(['s', 'a', 't', 'r'], ['s', 'a', 't'], profile);
    expect(result).toBe('addition');
  });

  it('detects visual guessing when first and last match but middle differs', () => {
    const profile = makeProfile({ visual_guessing: true });
    // user typed 'sxt' vs correct 'sat' — first (s) and last (t) match
    const result = classifyError(['s', 'x', 't'], ['s', 'a', 't'], profile);
    expect(result).toBe('visual_guessing');
  });

  it('returns null when no error focus flags are set', () => {
    const profile = makeProfile({
      omission_errors: false,
      addition_errors: false,
      visual_guessing: false,
    });
    const result = classifyError(['s', 'a'], ['s', 'a', 't'], profile);
    expect(result).toBeNull();
  });

  it('returns null with no profile', () => {
    const result = classifyError(['s', 'a'], ['s', 'a', 't'], null);
    expect(result).toBeNull();
  });
});

describe('getErrorFeedback', () => {
  it('returns appropriate message for omission', () => {
    const msg = getErrorFeedback('omission');
    expect(msg).toContain('missing');
  });

  it('returns appropriate message for addition', () => {
    const msg = getErrorFeedback('addition');
    expect(msg).toContain('extra');
  });

  it('returns appropriate message for visual guessing', () => {
    const msg = getErrorFeedback('visual_guessing');
    expect(msg).toContain('similar');
  });

  it('returns null for no error type', () => {
    expect(getErrorFeedback(null)).toBeNull();
  });
});

describe('detectErrors (full pipeline)', () => {
  it('triggers scaffold for guessing', () => {
    const current = makeAttempt({ correct: false, timeMs: 1500, hintsUsed: 0 });
    const recent = [makeAttempt({ correct: false, timeMs: 1200, hintsUsed: 0 })];
    const result = detectErrors(current, recent, ['s', 'a'], ['s', 'a', 't'], makeProfile());
    expect(result.isGuessing).toBe(true);
    expect(result.shouldForceScaffold).toBe(true);
    expect(result.shouldReduceDifficulty).toBe(true);
    expect(result.feedbackMessage).toContain('slow down');
  });

  it('provides omission feedback when not guessing', () => {
    const current = makeAttempt({ correct: false, timeMs: 8000, hintsUsed: 0 });
    const result = detectErrors(current, [], ['s', 'a'], ['s', 'a', 't'], makeProfile());
    expect(result.isGuessing).toBe(false);
    expect(result.errorType).toBe('omission');
    expect(result.feedbackMessage).toContain('missing');
  });

  it('returns no feedback for correct answers', () => {
    const current = makeAttempt({ correct: true, timeMs: 5000 });
    const result = detectErrors(current, [], ['s', 'a', 't'], ['s', 'a', 't'], makeProfile());
    expect(result.errorType).toBeNull();
    expect(result.isGuessing).toBe(false);
  });
});
