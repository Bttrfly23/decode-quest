// ── Learner Profile (from student-profile/profile.json) ──

export interface LearnerProfile {
  learner: {
    age: number;
    diagnoses: string[];
    notes: string[];
  };
  assessment_summary: {
    basic_reading_skills: string;
    reading_fluency: string;
    spelling: string;
    oral_language: string;
    working_memory: string;
    processing_speed: string;
  };
  instructional_priorities: {
    top_targets: string[];
    reduce: string[];
  };
  recommended_settings: {
    session_minutes: number;
    audio_instructions_default: boolean;
    timers_default: boolean;
    reduced_motion_default: boolean;
    extended_hint_ladder: boolean;
  };
  skill_weighting: {
    sound_snap: number;
    blend_builder: number;
    syllable_sprint: number;
    morpheme_match: number;
  };
  error_focus: {
    omission_errors: boolean;
    addition_errors: boolean;
    visual_guessing: boolean;
  };
}

// ── Game Types ──

export type GameType = 'sound_snap' | 'blend_builder' | 'syllable_sprint' | 'morpheme_match';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

// ── Content Items ──

export interface BaseItem {
  id: string;
  gameType: GameType;
  difficulty: Difficulty;
  skill: string;       // e.g. "digraphs", "vowel_teams", "r_controlled"
  pattern: string;     // specific pattern e.g. "sh", "ai", "pre-"
  isNonword?: boolean; // for blend builder practice words
}

export interface SoundSnapItem extends BaseItem {
  gameType: 'sound_snap';
  mode: 'grapheme_to_sound' | 'sound_to_grapheme';
  target: string;           // the grapheme being tested
  targetPronunciation: string; // phonetic description for TTS
  word: string;             // example word containing the grapheme
  distractors: string[];    // 2 wrong choices (graphemes or pronunciations)
  distractorPronunciations: string[];
}

export interface BlendBuilderItem extends BaseItem {
  gameType: 'blend_builder';
  phonemes: string[];       // ordered phoneme tiles
  targetWord: string;       // the word to build
  slowBlend: string;        // TTS text for slow blend
  smoothBlend: string;      // TTS text for smooth blend
  distractorPhonemes: string[]; // extra tiles to make it challenging
}

export interface SyllableSprintItem extends BaseItem {
  gameType: 'syllable_sprint';
  word: string;
  syllables: string[];       // correct syllable divisions
  stressIndex: number;       // index of stressed syllable (0-based)
  vowelPositions: number[];  // indices of vowels in the word
}

export interface MorphemeMatchItem extends BaseItem {
  gameType: 'morpheme_match';
  morphemes: string[];           // morpheme parts
  targetWord: string;            // assembled word
  meaning: string;               // correct meaning
  meaningDistractors: string[];  // 2 wrong meanings
  morphemeMeanings: Record<string, string>; // meaning of each morpheme
}

export type ContentItem = SoundSnapItem | BlendBuilderItem | SyllableSprintItem | MorphemeMatchItem;

// ── Progress & Mastery ──

export interface ItemAttempt {
  itemId: string;
  gameType: GameType;
  timestamp: number;
  correct: boolean;
  hintsUsed: number;
  timeMs: number;
  errorType?: 'omission' | 'addition' | 'visual_guessing' | null;
  wasGuessing?: boolean;
}

export interface SkillMastery {
  skill: string;
  pattern: string;
  mastery: number;       // 0–100
  totalAttempts: number;
  correctAttempts: number;
  lastAttempted: number;
  lastCorrect: number;
  streak: number;
  needsReview: boolean;
}

export interface GameProgress {
  gameType: GameType;
  totalXP: number;
  sessionsCompleted: number;
  currentDifficulty: Difficulty;
  recentAccuracy: number;  // rolling last 10
  lastPlayed: number;
}

export interface SessionSummary {
  date: number;
  duration: number;    // ms
  gamesPlayed: GameType[];
  totalItems: number;
  correctItems: number;
  hintsUsed: number;
  xpEarned: number;
  improvements: string[];
  nextFocus: string[];
}

export interface ProgressData {
  version: number;
  firstLoad: number;
  lastSession: number;
  totalXP: number;
  currentStreak: number;       // consecutive days
  longestStreak: number;
  skillMasteries: SkillMastery[];
  gameProgress: Record<GameType, GameProgress>;
  recentAttempts: ItemAttempt[];     // last 200 attempts
  sessionHistory: SessionSummary[];  // last 30 sessions
  badges: Badge[];
  tutorialsShown: GameType[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: number;
  icon: string;
}

// ── App Settings ──

export interface AppSettings {
  version: number;
  fontFamily: 'atkinson' | 'opendyslexic' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  letterSpacing: 'normal' | 'wide' | 'wider';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  highContrast: boolean;
  reducedMotion: boolean;
  audioInstructions: boolean;
  showTimers: boolean;
  sessionMinutes: number;
  extendedHintLadder: boolean;
  profileLoaded: boolean;
}

// ── Game Session State ──

export interface GameSessionState {
  gameType: GameType;
  items: ContentItem[];
  currentIndex: number;
  startTime: number;
  attempts: ItemAttempt[];
  hintLevel: number;
  sessionXP: number;
  isComplete: boolean;
  forcedScaffold: boolean;  // guessing detection triggered
}

// ── Confidence Messages ──

export interface ConfidenceMessage {
  type: 'encouragement' | 'progress' | 'mastery' | 'streak';
  message: string;
  minMastery?: number;
}
