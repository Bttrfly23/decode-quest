import {
  ContentItem,
  GameType,
  Difficulty,
  SkillMastery,
  ProgressData,
  LearnerProfile,
  ItemAttempt,
} from '../content/types';

/**
 * Adaptive item selection engine.
 *
 * Personalization via profile.json:
 * 1. Content selection: skill_weighting determines how many items from
 *    each game type appear in a session. error_focus flags increase weight
 *    for phoneme-segmentation and blending items.
 *
 * 2. Spaced repetition: recently missed items are prioritized. Items not
 *    seen recently are scheduled for review. Mastered items are interleaved
 *    at lower frequency.
 *
 * 3. Difficulty adaptation: based on rolling accuracy and hint usage.
 */

// How many items per session game
const ITEMS_PER_GAME_ROUND = 5;

interface SelectionConfig {
  totalItems: number;
  difficulty: Difficulty;
  interleaveReviewRatio: number; // 0-1, how much review vs new
}

/**
 * Build a "Today's Mission" — ordered list of games weighted by profile.
 */
export function buildMission(
  profile: LearnerProfile | null,
  progress: ProgressData,
  sessionMinutes: number
): GameType[] {
  // Estimate ~45 seconds per item, items per game round = 5
  const totalItems = Math.floor((sessionMinutes * 60) / 45);
  const totalRounds = Math.max(2, Math.floor(totalItems / ITEMS_PER_GAME_ROUND));

  const weights = profile?.skill_weighting ?? {
    sound_snap: 0.25,
    blend_builder: 0.25,
    syllable_sprint: 0.25,
    morpheme_match: 0.25,
  };

  // If error_focus flags are set, boost blending and sound snap
  let adjustedWeights = { ...weights };
  if (profile?.error_focus) {
    if (profile.error_focus.omission_errors || profile.error_focus.addition_errors) {
      adjustedWeights.blend_builder = Math.min(0.5, adjustedWeights.blend_builder + 0.05);
      adjustedWeights.sound_snap = Math.min(0.4, adjustedWeights.sound_snap + 0.05);
      // Normalize
      const total = Object.values(adjustedWeights).reduce((s, v) => s + v, 0);
      for (const key of Object.keys(adjustedWeights) as (keyof typeof adjustedWeights)[]) {
        adjustedWeights[key] = adjustedWeights[key] / total;
      }
    }
  }

  // Allocate rounds per game type
  const gameTypes: GameType[] = ['sound_snap', 'blend_builder', 'syllable_sprint', 'morpheme_match'];
  const roundAllocation: GameType[] = [];

  for (const game of gameTypes) {
    const key = game as keyof typeof adjustedWeights;
    const rounds = Math.max(1, Math.round(adjustedWeights[key] * totalRounds));
    for (let i = 0; i < rounds; i++) {
      roundAllocation.push(game);
    }
  }

  // Trim to totalRounds
  while (roundAllocation.length > totalRounds) {
    roundAllocation.pop();
  }

  // Shuffle to avoid always playing same order
  return shuffleArray(roundAllocation);
}

/**
 * Select items for a specific game round using adaptive selection.
 */
export function selectItems(
  allItems: ContentItem[],
  gameType: GameType,
  difficulty: Difficulty,
  masteries: SkillMastery[],
  recentAttempts: ItemAttempt[],
  profile: LearnerProfile | null,
  count: number = ITEMS_PER_GAME_ROUND
): ContentItem[] {
  const gameItems = allItems.filter(item => item.gameType === gameType);
  if (gameItems.length === 0) return [];

  // Score each item for selection priority
  const scored = gameItems.map(item => ({
    item,
    score: calculateItemPriority(item, difficulty, masteries, recentAttempts, profile),
  }));

  // Sort by priority (higher = more likely to be selected)
  scored.sort((a, b) => b.score - a.score);

  // Take top items but interleave: ~60% review/missed, ~40% new/not-seen
  const missedRecently = scored.filter(s => {
    const attempts = recentAttempts.filter(a => a.itemId === s.item.id);
    return attempts.length > 0 && !attempts[attempts.length - 1].correct;
  });

  const notSeen = scored.filter(s => {
    return !recentAttempts.some(a => a.itemId === s.item.id);
  });

  const mastered = scored.filter(s => {
    const m = findMastery(masteries, s.item.skill, s.item.pattern);
    return m && m.mastery >= 80;
  });

  // Build selection: missed first, then new, then review mastered
  const selected: ContentItem[] = [];
  const used = new Set<string>();

  // 1. Recently missed items (priority)
  for (const s of missedRecently) {
    if (selected.length >= Math.ceil(count * 0.4)) break;
    if (!used.has(s.item.id)) {
      selected.push(s.item);
      used.add(s.item.id);
    }
  }

  // 2. New items (items not seen yet, at appropriate difficulty)
  for (const s of notSeen) {
    if (selected.length >= Math.ceil(count * 0.8)) break;
    if (!used.has(s.item.id) && Math.abs(s.item.difficulty - difficulty) <= 1) {
      selected.push(s.item);
      used.add(s.item.id);
    }
  }

  // 3. Fill with highest-priority remaining items
  for (const s of scored) {
    if (selected.length >= count) break;
    if (!used.has(s.item.id)) {
      selected.push(s.item);
      used.add(s.item.id);
    }
  }

  // Shuffle selected to avoid predictable order
  return shuffleArray(selected.slice(0, count));
}

/**
 * Calculate priority score for an item (higher = select sooner).
 */
export function calculateItemPriority(
  item: ContentItem,
  targetDifficulty: Difficulty,
  masteries: SkillMastery[],
  recentAttempts: ItemAttempt[],
  profile: LearnerProfile | null
): number {
  let priority = 0;

  // 1. Difficulty match (items close to target difficulty score higher)
  const diffDelta = Math.abs(item.difficulty - targetDifficulty);
  priority += (3 - diffDelta) * 10; // max 30

  // 2. Mastery level (lower mastery = higher priority)
  const mastery = findMastery(masteries, item.skill, item.pattern);
  if (mastery) {
    priority += (100 - mastery.mastery) * 0.5; // max 50
    // Bonus for items needing review
    if (mastery.needsReview) priority += 20;
  } else {
    // Never seen this skill/pattern: moderate priority
    priority += 30;
  }

  // 3. Spaced repetition: time since last attempt
  const lastAttempt = recentAttempts
    .filter(a => a.itemId === item.id)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  if (lastAttempt) {
    const hoursSince = (Date.now() - lastAttempt.timestamp) / (1000 * 60 * 60);
    if (!lastAttempt.correct) {
      // Missed recently: high priority, especially if recent
      priority += Math.min(40, 40 - hoursSince * 2);
    } else {
      // Correct recently: lower priority, schedule for later review
      priority += Math.min(10, hoursSince * 0.5);
    }
  }

  // 4. Profile-based skill targeting
  if (profile) {
    const topTargets = profile.instructional_priorities.top_targets;
    if (topTargets.some(t =>
      item.skill.includes(t.replace(/-/g, '_')) ||
      t.includes(item.skill.replace(/_/g, '-'))
    )) {
      priority += 15;
    }
  }

  return priority;
}

function findMastery(masteries: SkillMastery[], skill: string, pattern: string): SkillMastery | undefined {
  return masteries.find(m => m.skill === skill && m.pattern === pattern);
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { ITEMS_PER_GAME_ROUND };
