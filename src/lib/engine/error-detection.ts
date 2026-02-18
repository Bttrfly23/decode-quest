import { ItemAttempt, LearnerProfile } from '../content/types';

/**
 * Error pattern detection engine.
 *
 * Detects:
 * 1. Guessing — fast wrong answers without hint use
 * 2. Omission errors — sounds left off
 * 3. Addition errors — extra sounds added
 *
 * Based on profile.json error_focus flags.
 */

export interface ErrorDetectionResult {
  isGuessing: boolean;
  errorType: 'omission' | 'addition' | 'visual_guessing' | null;
  shouldForceScaffold: boolean;
  feedbackMessage: string | null;
  shouldReduceDifficulty: boolean;
}

const FAST_ANSWER_THRESHOLD_MS = 3000; // under 3s is suspiciously fast
const CONSECUTIVE_WRONG_FOR_GUESS = 2;

/**
 * Detect if a user is guessing based on speed and accuracy pattern.
 */
export function detectGuessing(
  currentAttempt: ItemAttempt,
  recentAttempts: ItemAttempt[]
): boolean {
  // Fast and wrong without hints = possible guessing
  if (!currentAttempt.correct && currentAttempt.timeMs < FAST_ANSWER_THRESHOLD_MS && currentAttempt.hintsUsed === 0) {
    // Check if previous attempt was also wrong without hints
    const lastAttempt = recentAttempts.length > 0 ? recentAttempts[recentAttempts.length - 1] : null;
    if (lastAttempt && !lastAttempt.correct && lastAttempt.hintsUsed === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Classify error type from user's answer vs. correct answer.
 * For Blend Builder: compare phoneme sequences.
 */
export function classifyError(
  userAnswer: string[],
  correctAnswer: string[],
  profile: LearnerProfile | null
): 'omission' | 'addition' | 'visual_guessing' | null {
  if (!profile) return null;

  // Check for omission: user answer is shorter (left off sounds)
  if (profile.error_focus.omission_errors && userAnswer.length < correctAnswer.length) {
    // Verify the user's phonemes are a subset in order
    const isSubsequence = userAnswer.every((p, i) => correctAnswer.includes(p));
    if (isSubsequence) return 'omission';
  }

  // Check for addition: user answer is longer (added sounds)
  if (profile.error_focus.addition_errors && userAnswer.length > correctAnswer.length) {
    const isSuperset = correctAnswer.every(p => userAnswer.includes(p));
    if (isSuperset) return 'addition';
  }

  // Check for visual guessing: answer looks similar but is wrong
  if (profile.error_focus.visual_guessing) {
    const userStr = userAnswer.join('');
    const correctStr = correctAnswer.join('');
    if (userStr.length > 0 && correctStr.length > 0) {
      // First and last characters match but middle is wrong → visual guessing
      if (
        userStr[0] === correctStr[0] &&
        userStr[userStr.length - 1] === correctStr[correctStr.length - 1] &&
        userStr !== correctStr
      ) {
        return 'visual_guessing';
      }
    }
  }

  return null;
}

/**
 * Generate supportive feedback message based on error type.
 */
export function getErrorFeedback(errorType: 'omission' | 'addition' | 'visual_guessing' | null): string | null {
  switch (errorType) {
    case 'omission':
      return "Almost! Let's check — it looks like a sound might be missing. Tap through each sound carefully.";
    case 'addition':
      return "Close! There might be an extra sound in there. Let's listen to each part one at a time.";
    case 'visual_guessing':
      return "That word looks similar! Let's slow down and decode it sound by sound instead of guessing the shape.";
    default:
      return null;
  }
}

/**
 * Full error detection pipeline for an attempt.
 */
export function detectErrors(
  currentAttempt: ItemAttempt,
  recentAttempts: ItemAttempt[],
  userAnswer: string[],
  correctAnswer: string[],
  profile: LearnerProfile | null
): ErrorDetectionResult {
  const isGuessing = detectGuessing(currentAttempt, recentAttempts);
  const errorType = currentAttempt.correct
    ? null
    : classifyError(userAnswer, correctAnswer, profile);

  const shouldForceScaffold = isGuessing;
  const shouldReduceDifficulty = isGuessing;
  const feedbackMessage = isGuessing
    ? "Let's slow down and work through this step by step. No rush!"
    : getErrorFeedback(errorType);

  return {
    isGuessing,
    errorType,
    shouldForceScaffold,
    feedbackMessage,
    shouldReduceDifficulty,
  };
}
