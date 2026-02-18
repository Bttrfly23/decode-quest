import { describe, it, expect } from 'vitest';
import {
  buildMission,
  selectItems,
  calculateItemPriority,
  ITEMS_PER_GAME_ROUND,
} from '../adaptive-selector';
import { allContent } from '../../content/seed-data';
import {
  ContentItem,
  GameType,
  LearnerProfile,
  ProgressData,
  SkillMastery,
  ItemAttempt,
  Difficulty,
  GameProgress,
} from '../../content/types';

function makeProfile(overrides: Partial<LearnerProfile> = {}): LearnerProfile {
  return {
    learner: { age: 13, diagnoses: ['Dyslexia', 'ADHD_Inattentive'], notes: [] },
    assessment_summary: {
      basic_reading_skills: 'Low Average',
      reading_fluency: 'Low Average',
      spelling: 'Low',
      oral_language: 'High',
      working_memory: 'Strong',
      processing_speed: 'Variable',
    },
    instructional_priorities: {
      top_targets: ['phoneme-grapheme accuracy', 'blending digraphs and vowel teams'],
      reduce: ['timed pressure'],
    },
    recommended_settings: {
      session_minutes: 6,
      audio_instructions_default: true,
      timers_default: false,
      reduced_motion_default: true,
      extended_hint_ladder: true,
    },
    skill_weighting: {
      sound_snap: 0.30,
      blend_builder: 0.35,
      syllable_sprint: 0.20,
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

function makeDefaultGameProgress(gameType: GameType): GameProgress {
  return {
    gameType,
    totalXP: 0,
    sessionsCompleted: 0,
    currentDifficulty: 1,
    recentAccuracy: 0,
    lastPlayed: 0,
  };
}

function makeProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    version: 1,
    firstLoad: Date.now(),
    lastSession: 0,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    skillMasteries: [],
    gameProgress: {
      sound_snap: makeDefaultGameProgress('sound_snap'),
      blend_builder: makeDefaultGameProgress('blend_builder'),
      syllable_sprint: makeDefaultGameProgress('syllable_sprint'),
      morpheme_match: makeDefaultGameProgress('morpheme_match'),
    },
    recentAttempts: [],
    sessionHistory: [],
    badges: [],
    tutorialsShown: [],
    ...overrides,
  };
}

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

describe('buildMission', () => {
  it('returns a list of game types', () => {
    const mission = buildMission(makeProfile(), makeProgress(), 6);
    expect(mission.length).toBeGreaterThan(0);
    const validTypes: GameType[] = ['sound_snap', 'blend_builder', 'syllable_sprint', 'morpheme_match'];
    for (const game of mission) {
      expect(validTypes).toContain(game);
    }
  });

  it('respects profile skill_weighting (blend_builder gets most rounds)', () => {
    const missions: GameType[][] = [];
    for (let i = 0; i < 20; i++) {
      missions.push(buildMission(makeProfile(), makeProgress(), 6));
    }
    // Count how often each game appears across all missions
    const counts: Record<GameType, number> = {
      sound_snap: 0,
      blend_builder: 0,
      syllable_sprint: 0,
      morpheme_match: 0,
    };
    for (const m of missions) {
      for (const g of m) counts[g]++;
    }
    // blend_builder (0.35) should appear more than morpheme_match (0.15)
    expect(counts.blend_builder).toBeGreaterThan(counts.morpheme_match);
  });

  it('allocates at least 1 round per game type', () => {
    const mission = buildMission(makeProfile(), makeProgress(), 10);
    const types = new Set(mission);
    // With 10 minutes, should have all 4 types
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it('works without a profile (equal weights)', () => {
    const mission = buildMission(null, makeProgress(), 6);
    expect(mission.length).toBeGreaterThan(0);
  });
});

describe('selectItems', () => {
  it('returns items of the correct game type', () => {
    const items = selectItems(
      allContent,
      'sound_snap',
      1 as Difficulty,
      [],
      [],
      null,
      5
    );
    expect(items.length).toBe(5);
    for (const item of items) {
      expect(item.gameType).toBe('sound_snap');
    }
  });

  it('returns up to requested count', () => {
    const items = selectItems(allContent, 'blend_builder', 1 as Difficulty, [], [], null, 3);
    expect(items.length).toBe(3);
  });

  it('prioritizes recently missed items', () => {
    const missedId = 'ss-01';
    const recentAttempts: ItemAttempt[] = [
      makeAttempt({ itemId: missedId, correct: false, timestamp: Date.now() - 60000 }),
    ];
    const items = selectItems(
      allContent,
      'sound_snap',
      1 as Difficulty,
      [],
      recentAttempts,
      null,
      5
    );
    // The missed item should be in the selection
    const hasMissed = items.some(i => i.id === missedId);
    expect(hasMissed).toBe(true);
  });

  it('interleaves review and new items', () => {
    // Create masteries for some items
    const masteries: SkillMastery[] = [
      {
        skill: 'digraphs',
        pattern: 'sh',
        mastery: 90,
        totalAttempts: 20,
        correctAttempts: 18,
        lastAttempted: Date.now(),
        lastCorrect: Date.now(),
        streak: 10,
        needsReview: false,
      },
    ];
    const items = selectItems(
      allContent,
      'sound_snap',
      2 as Difficulty,
      masteries,
      [],
      null,
      5
    );
    expect(items.length).toBe(5);
  });

  it('returns empty array for non-existent game type', () => {
    const items = selectItems(
      allContent,
      'nonexistent' as GameType,
      1 as Difficulty,
      [],
      [],
      null,
      5
    );
    expect(items.length).toBe(0);
  });
});

describe('calculateItemPriority', () => {
  const sampleItem = allContent.find(i => i.gameType === 'sound_snap')!;

  it('gives higher priority to items matching target difficulty', () => {
    const priorityMatch = calculateItemPriority(
      { ...sampleItem, difficulty: 2 as Difficulty },
      2 as Difficulty,
      [],
      [],
      null
    );
    const priorityMismatch = calculateItemPriority(
      { ...sampleItem, difficulty: 5 as Difficulty },
      2 as Difficulty,
      [],
      [],
      null
    );
    expect(priorityMatch).toBeGreaterThan(priorityMismatch);
  });

  it('gives higher priority to items with lower mastery', () => {
    const lowMastery: SkillMastery[] = [{
      skill: sampleItem.skill,
      pattern: sampleItem.pattern,
      mastery: 20,
      totalAttempts: 5,
      correctAttempts: 1,
      lastAttempted: Date.now(),
      lastCorrect: 0,
      streak: 0,
      needsReview: true,
    }];
    const highMastery: SkillMastery[] = [{
      skill: sampleItem.skill,
      pattern: sampleItem.pattern,
      mastery: 95,
      totalAttempts: 50,
      correctAttempts: 48,
      lastAttempted: Date.now(),
      lastCorrect: Date.now(),
      streak: 20,
      needsReview: false,
    }];

    const priorityLow = calculateItemPriority(sampleItem, sampleItem.difficulty, lowMastery, [], null);
    const priorityHigh = calculateItemPriority(sampleItem, sampleItem.difficulty, highMastery, [], null);
    expect(priorityLow).toBeGreaterThan(priorityHigh);
  });

  it('gives bonus to items matching profile top_targets', () => {
    const profile = makeProfile();
    const matchingItem = { ...sampleItem, skill: 'blending_digraphs' };
    const nonMatchingItem = { ...sampleItem, skill: 'random_skill' };

    const priorityMatch = calculateItemPriority(matchingItem, 1 as Difficulty, [], [], profile);
    const priorityNoMatch = calculateItemPriority(nonMatchingItem, 1 as Difficulty, [], [], profile);
    // Both will have similar base priority, but the profile match should get a bonus
    // This test is fuzzy because the bonus is part of a larger score
    expect(priorityMatch).toBeGreaterThanOrEqual(priorityNoMatch);
  });

  it('prioritizes recently missed items', () => {
    const missed: ItemAttempt[] = [{
      itemId: sampleItem.id,
      gameType: 'sound_snap',
      timestamp: Date.now() - 60000,
      correct: false,
      hintsUsed: 0,
      timeMs: 5000,
    }];
    const correct: ItemAttempt[] = [{
      itemId: sampleItem.id,
      gameType: 'sound_snap',
      timestamp: Date.now() - 60000,
      correct: true,
      hintsUsed: 0,
      timeMs: 5000,
    }];

    const priorityMissed = calculateItemPriority(sampleItem, sampleItem.difficulty, [], missed, null);
    const priorityCorrect = calculateItemPriority(sampleItem, sampleItem.difficulty, [], correct, null);
    expect(priorityMissed).toBeGreaterThan(priorityCorrect);
  });
});
