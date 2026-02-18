import { ConfidenceMessage, GameType } from './types';

export const confidenceMessages: ConfidenceMessage[] = [
  // Encouragement (shown during play)
  { type: 'encouragement', message: "You're working through this — keep going." },
  { type: 'encouragement', message: "Take your time. Accuracy beats speed." },
  { type: 'encouragement', message: "Every attempt builds your skills." },
  { type: 'encouragement', message: "Mistakes are part of learning. You've got this." },
  { type: 'encouragement', message: "Nice effort — you're building new connections." },
  { type: 'encouragement', message: "Slow and steady is a smart strategy." },

  // Progress (shown on progress/recap)
  { type: 'progress', message: "You're moving forward — that's what counts." },
  { type: 'progress', message: "Consistent practice makes a real difference." },
  { type: 'progress', message: "You've been showing up, and it's paying off." },
  { type: 'progress', message: "Look how far you've come since you started." },
  { type: 'progress', message: "Your accuracy is improving. Keep it up." },

  // Mastery (shown when skill mastery is high)
  { type: 'mastery', message: "You've locked this in. Solid work.", minMastery: 80 },
  { type: 'mastery', message: "This pattern is really clicking for you.", minMastery: 75 },
  { type: 'mastery', message: "Expert level on this one. Well earned.", minMastery: 90 },
  { type: 'mastery', message: "You own this skill now. Time for the next challenge.", minMastery: 85 },

  // Streak
  { type: 'streak', message: "Streak going strong — consistency is key." },
  { type: 'streak', message: "Another day, another step forward." },
  { type: 'streak', message: "You're building a real habit here." },
];

export function getRandomMessage(type: ConfidenceMessage['type'], mastery?: number): string {
  const filtered = confidenceMessages.filter(m => {
    if (m.type !== type) return false;
    if (m.minMastery && mastery !== undefined && mastery < m.minMastery) return false;
    return true;
  });
  if (filtered.length === 0) return "Keep going — you're doing great.";
  return filtered[Math.floor(Math.random() * filtered.length)].message;
}

export const gameDisplayNames: Record<GameType, string> = {
  sound_snap: 'Sound Snap',
  blend_builder: 'Blend Builder',
  syllable_sprint: 'Syllable Sprint',
  morpheme_match: 'Morpheme Match',
};

export const gameIcons: Record<GameType, string> = {
  sound_snap: '🎵',
  blend_builder: '🔗',
  syllable_sprint: '✂️',
  morpheme_match: '🧩',
};

export const gameDescriptions: Record<GameType, string> = {
  sound_snap: 'Match sounds to their letter patterns',
  blend_builder: 'Build words by blending sounds together',
  syllable_sprint: 'Break words into syllables and find the stress',
  morpheme_match: 'Combine word parts to build meaning',
};
