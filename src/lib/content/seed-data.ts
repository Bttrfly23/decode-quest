import {
  SoundSnapItem,
  BlendBuilderItem,
  SyllableSprintItem,
  MorphemeMatchItem,
  ContentItem,
} from './types';

// ══════════════════════════════════════════════════
// SOUND SNAP — 30 items
// Grapheme ↔ Phoneme mapping
// Extra items for digraphs + vowel teams per profile
// ══════════════════════════════════════════════════

export const soundSnapItems: SoundSnapItem[] = [
  // Digraphs (10 items)
  {
    id: 'ss-01', gameType: 'sound_snap', difficulty: 1, skill: 'digraphs', pattern: 'sh',
    mode: 'grapheme_to_sound', target: 'sh', targetPronunciation: 'shh',
    word: 'ship', distractors: ['ch', 'th'], distractorPronunciations: ['chh', 'thh'],
  },
  {
    id: 'ss-02', gameType: 'sound_snap', difficulty: 1, skill: 'digraphs', pattern: 'ch',
    mode: 'grapheme_to_sound', target: 'ch', targetPronunciation: 'chh',
    word: 'chip', distractors: ['sh', 'th'], distractorPronunciations: ['shh', 'thh'],
  },
  {
    id: 'ss-03', gameType: 'sound_snap', difficulty: 1, skill: 'digraphs', pattern: 'th',
    mode: 'grapheme_to_sound', target: 'th', targetPronunciation: 'thh',
    word: 'thin', distractors: ['sh', 'ph'], distractorPronunciations: ['shh', 'ff'],
  },
  {
    id: 'ss-04', gameType: 'sound_snap', difficulty: 2, skill: 'digraphs', pattern: 'ph',
    mode: 'grapheme_to_sound', target: 'ph', targetPronunciation: 'ff',
    word: 'phone', distractors: ['th', 'wh'], distractorPronunciations: ['thh', 'wh'],
  },
  {
    id: 'ss-05', gameType: 'sound_snap', difficulty: 2, skill: 'digraphs', pattern: 'wh',
    mode: 'sound_to_grapheme', target: 'wh', targetPronunciation: 'wh',
    word: 'whale', distractors: ['w', 'ph'], distractorPronunciations: ['wuh', 'ff'],
  },
  {
    id: 'ss-06', gameType: 'sound_snap', difficulty: 2, skill: 'digraphs', pattern: 'sh',
    mode: 'sound_to_grapheme', target: 'sh', targetPronunciation: 'shh',
    word: 'flash', distractors: ['ss', 'ch'], distractorPronunciations: ['sss', 'chh'],
  },
  {
    id: 'ss-07', gameType: 'sound_snap', difficulty: 2, skill: 'digraphs', pattern: 'ch',
    mode: 'sound_to_grapheme', target: 'ch', targetPronunciation: 'chh',
    word: 'ranch', distractors: ['tch', 'sh'], distractorPronunciations: ['chh', 'shh'],
  },
  {
    id: 'ss-08', gameType: 'sound_snap', difficulty: 3, skill: 'digraphs', pattern: 'th',
    mode: 'sound_to_grapheme', target: 'th', targetPronunciation: 'thh voiced',
    word: 'bathe', distractors: ['th', 'dh'], distractorPronunciations: ['thh unvoiced', 'dh'],
  },
  {
    id: 'ss-09', gameType: 'sound_snap', difficulty: 1, skill: 'digraphs', pattern: 'ck',
    mode: 'grapheme_to_sound', target: 'ck', targetPronunciation: 'k',
    word: 'duck', distractors: ['k', 'c'], distractorPronunciations: ['kk', 'ss'],
  },
  {
    id: 'ss-10', gameType: 'sound_snap', difficulty: 3, skill: 'digraphs', pattern: 'ng',
    mode: 'grapheme_to_sound', target: 'ng', targetPronunciation: 'ng',
    word: 'ring', distractors: ['n', 'nk'], distractorPronunciations: ['nn', 'nk'],
  },

  // Vowel Teams / Diphthongs (10 items)
  {
    id: 'ss-11', gameType: 'sound_snap', difficulty: 2, skill: 'vowel_teams', pattern: 'ai',
    mode: 'grapheme_to_sound', target: 'ai', targetPronunciation: 'long a',
    word: 'rain', distractors: ['ay', 'ea'], distractorPronunciations: ['ay', 'ee'],
  },
  {
    id: 'ss-12', gameType: 'sound_snap', difficulty: 2, skill: 'vowel_teams', pattern: 'ea',
    mode: 'grapheme_to_sound', target: 'ea', targetPronunciation: 'long e',
    word: 'beam', distractors: ['ee', 'ie'], distractorPronunciations: ['ee', 'eye'],
  },
  {
    id: 'ss-13', gameType: 'sound_snap', difficulty: 2, skill: 'vowel_teams', pattern: 'oa',
    mode: 'grapheme_to_sound', target: 'oa', targetPronunciation: 'long o',
    word: 'boat', distractors: ['ow', 'oo'], distractorPronunciations: ['ow', 'oo'],
  },
  {
    id: 'ss-14', gameType: 'sound_snap', difficulty: 3, skill: 'vowel_teams', pattern: 'oy',
    mode: 'grapheme_to_sound', target: 'oy', targetPronunciation: 'oy',
    word: 'joy', distractors: ['oi', 'ow'], distractorPronunciations: ['oy', 'ow'],
  },
  {
    id: 'ss-15', gameType: 'sound_snap', difficulty: 3, skill: 'vowel_teams', pattern: 'ey',
    mode: 'sound_to_grapheme', target: 'ey', targetPronunciation: 'long e',
    word: 'key', distractors: ['ee', 'ea'], distractorPronunciations: ['ee', 'ee'],
  },
  {
    id: 'ss-16', gameType: 'sound_snap', difficulty: 2, skill: 'vowel_teams', pattern: 'oo',
    mode: 'grapheme_to_sound', target: 'oo', targetPronunciation: 'oo as in moon',
    word: 'moon', distractors: ['ew', 'ou'], distractorPronunciations: ['oo', 'ow'],
  },
  {
    id: 'ss-17', gameType: 'sound_snap', difficulty: 3, skill: 'vowel_teams', pattern: 'ow',
    mode: 'grapheme_to_sound', target: 'ow', targetPronunciation: 'ow as in cow',
    word: 'plow', distractors: ['ou', 'oa'], distractorPronunciations: ['ow', 'oh'],
  },
  {
    id: 'ss-18', gameType: 'sound_snap', difficulty: 3, skill: 'vowel_teams', pattern: 'au',
    mode: 'grapheme_to_sound', target: 'au', targetPronunciation: 'aw',
    word: 'haul', distractors: ['aw', 'al'], distractorPronunciations: ['aw', 'al'],
  },
  {
    id: 'ss-19', gameType: 'sound_snap', difficulty: 2, skill: 'vowel_teams', pattern: 'ee',
    mode: 'sound_to_grapheme', target: 'ee', targetPronunciation: 'long e',
    word: 'tree', distractors: ['ea', 'ie'], distractorPronunciations: ['ee', 'ee'],
  },
  {
    id: 'ss-20', gameType: 'sound_snap', difficulty: 3, skill: 'vowel_teams', pattern: 'oi',
    mode: 'sound_to_grapheme', target: 'oi', targetPronunciation: 'oy',
    word: 'coin', distractors: ['oy', 'ow'], distractorPronunciations: ['oy', 'ow'],
  },

  // Silent-e, R-controlled, Soft c/g, -tion/-sion (10 items)
  {
    id: 'ss-21', gameType: 'sound_snap', difficulty: 2, skill: 'silent_e', pattern: 'a_e',
    mode: 'grapheme_to_sound', target: 'a_e', targetPronunciation: 'long a',
    word: 'cake', distractors: ['short a', 'ar'], distractorPronunciations: ['ah', 'ar'],
  },
  {
    id: 'ss-22', gameType: 'sound_snap', difficulty: 2, skill: 'silent_e', pattern: 'i_e',
    mode: 'grapheme_to_sound', target: 'i_e', targetPronunciation: 'long i',
    word: 'kite', distractors: ['short i', 'ir'], distractorPronunciations: ['ih', 'er'],
  },
  {
    id: 'ss-23', gameType: 'sound_snap', difficulty: 2, skill: 'r_controlled', pattern: 'ar',
    mode: 'grapheme_to_sound', target: 'ar', targetPronunciation: 'ar',
    word: 'star', distractors: ['or', 'er'], distractorPronunciations: ['or', 'er'],
  },
  {
    id: 'ss-24', gameType: 'sound_snap', difficulty: 2, skill: 'r_controlled', pattern: 'or',
    mode: 'grapheme_to_sound', target: 'or', targetPronunciation: 'or',
    word: 'fork', distractors: ['ar', 'ir'], distractorPronunciations: ['ar', 'er'],
  },
  {
    id: 'ss-25', gameType: 'sound_snap', difficulty: 3, skill: 'r_controlled', pattern: 'er',
    mode: 'sound_to_grapheme', target: 'er', targetPronunciation: 'er',
    word: 'fern', distractors: ['ir', 'ur'], distractorPronunciations: ['er', 'er'],
  },
  {
    id: 'ss-26', gameType: 'sound_snap', difficulty: 3, skill: 'soft_c_g', pattern: 'soft_c',
    mode: 'grapheme_to_sound', target: 'ce', targetPronunciation: 'ss',
    word: 'cent', distractors: ['hard c', 'ch'], distractorPronunciations: ['kk', 'chh'],
  },
  {
    id: 'ss-27', gameType: 'sound_snap', difficulty: 3, skill: 'soft_c_g', pattern: 'soft_g',
    mode: 'grapheme_to_sound', target: 'ge', targetPronunciation: 'j',
    word: 'gem', distractors: ['hard g', 'j'], distractorPronunciations: ['guh', 'juh'],
  },
  {
    id: 'ss-28', gameType: 'sound_snap', difficulty: 4, skill: 'tion_sion', pattern: 'tion',
    mode: 'grapheme_to_sound', target: 'tion', targetPronunciation: 'shun',
    word: 'nation', distractors: ['sion', 'tien'], distractorPronunciations: ['zhun', 'tee-en'],
  },
  {
    id: 'ss-29', gameType: 'sound_snap', difficulty: 4, skill: 'tion_sion', pattern: 'sion',
    mode: 'grapheme_to_sound', target: 'sion', targetPronunciation: 'zhun',
    word: 'vision', distractors: ['tion', 'sian'], distractorPronunciations: ['shun', 'see-an'],
  },
  {
    id: 'ss-30', gameType: 'sound_snap', difficulty: 2, skill: 'silent_e', pattern: 'o_e',
    mode: 'grapheme_to_sound', target: 'o_e', targetPronunciation: 'long o',
    word: 'bone', distractors: ['short o', 'or'], distractorPronunciations: ['ah', 'or'],
  },
];

// ══════════════════════════════════════════════════
// BLEND BUILDER — 30 items
// Phoneme Blending (key focus per profile)
// ══════════════════════════════════════════════════

export const blendBuilderItems: BlendBuilderItem[] = [
  // CVC words (difficulty 1)
  {
    id: 'bb-01', gameType: 'blend_builder', difficulty: 1, skill: 'blending', pattern: 'cvc',
    phonemes: ['s', 'a', 't'], targetWord: 'sat', slowBlend: 's...a...t',
    smoothBlend: 'sat', distractorPhonemes: ['m', 'e'],
  },
  {
    id: 'bb-02', gameType: 'blend_builder', difficulty: 1, skill: 'blending', pattern: 'cvc',
    phonemes: ['p', 'i', 'n'], targetWord: 'pin', slowBlend: 'p...i...n',
    smoothBlend: 'pin', distractorPhonemes: ['b', 'a'],
  },
  {
    id: 'bb-03', gameType: 'blend_builder', difficulty: 1, skill: 'blending', pattern: 'cvc',
    phonemes: ['r', 'u', 'g'], targetWord: 'rug', slowBlend: 'r...u...g',
    smoothBlend: 'rug', distractorPhonemes: ['b', 'o'],
  },
  {
    id: 'bb-04', gameType: 'blend_builder', difficulty: 1, skill: 'blending', pattern: 'cvc',
    phonemes: ['h', 'o', 't'], targetWord: 'hot', slowBlend: 'h...o...t',
    smoothBlend: 'hot', distractorPhonemes: ['c', 'u'],
  },
  {
    id: 'bb-05', gameType: 'blend_builder', difficulty: 1, skill: 'blending', pattern: 'cvc',
    phonemes: ['m', 'a', 'p'], targetWord: 'map', slowBlend: 'm...a...p',
    smoothBlend: 'map', distractorPhonemes: ['n', 'i'],
  },

  // CCVC / Blends (difficulty 2)
  {
    id: 'bb-06', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    phonemes: ['s', 't', 'o', 'p'], targetWord: 'stop', slowBlend: 's...t...o...p',
    smoothBlend: 'stop', distractorPhonemes: ['r', 'a'],
  },
  {
    id: 'bb-07', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    phonemes: ['g', 'r', 'a', 'b'], targetWord: 'grab', slowBlend: 'g...r...a...b',
    smoothBlend: 'grab', distractorPhonemes: ['d', 'i'],
  },
  {
    id: 'bb-08', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    phonemes: ['s', 'l', 'i', 'p'], targetWord: 'slip', slowBlend: 's...l...i...p',
    smoothBlend: 'slip', distractorPhonemes: ['t', 'a'],
  },
  {
    id: 'bb-09', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    phonemes: ['f', 'l', 'a', 't'], targetWord: 'flat', slowBlend: 'f...l...a...t',
    smoothBlend: 'flat', distractorPhonemes: ['r', 'o'],
  },
  {
    id: 'bb-10', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    phonemes: ['c', 'r', 'i', 'b'], targetWord: 'crib', slowBlend: 'c...r...i...b',
    smoothBlend: 'crib', distractorPhonemes: ['l', 'u'],
  },

  // Digraph blends (difficulty 2-3)
  {
    id: 'bb-11', gameType: 'blend_builder', difficulty: 2, skill: 'blending_digraphs', pattern: 'digraph',
    phonemes: ['sh', 'i', 'p'], targetWord: 'ship', slowBlend: 'sh...i...p',
    smoothBlend: 'ship', distractorPhonemes: ['ch', 'a'],
  },
  {
    id: 'bb-12', gameType: 'blend_builder', difficulty: 2, skill: 'blending_digraphs', pattern: 'digraph',
    phonemes: ['ch', 'e', 's', 't'], targetWord: 'chest', slowBlend: 'ch...e...s...t',
    smoothBlend: 'chest', distractorPhonemes: ['sh', 'a'],
  },
  {
    id: 'bb-13', gameType: 'blend_builder', difficulty: 2, skill: 'blending_digraphs', pattern: 'digraph',
    phonemes: ['th', 'i', 'n'], targetWord: 'thin', slowBlend: 'th...i...n',
    smoothBlend: 'thin', distractorPhonemes: ['sh', 'a'],
  },
  {
    id: 'bb-14', gameType: 'blend_builder', difficulty: 3, skill: 'blending_digraphs', pattern: 'digraph',
    phonemes: ['wh', 'i', 's', 'k'], targetWord: 'whisk', slowBlend: 'wh...i...s...k',
    smoothBlend: 'whisk', distractorPhonemes: ['w', 'a'],
  },
  {
    id: 'bb-15', gameType: 'blend_builder', difficulty: 3, skill: 'blending_digraphs', pattern: 'digraph',
    phonemes: ['ph', 'o', 'n', 'e'], targetWord: 'phone', slowBlend: 'ph...o...n...',
    smoothBlend: 'phone', distractorPhonemes: ['f', 'a'],
  },

  // Vowel team blends (difficulty 3)
  {
    id: 'bb-16', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    phonemes: ['r', 'ai', 'n'], targetWord: 'rain', slowBlend: 'r...ai...n',
    smoothBlend: 'rain', distractorPhonemes: ['p', 'ea'],
  },
  {
    id: 'bb-17', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    phonemes: ['b', 'oa', 't'], targetWord: 'boat', slowBlend: 'b...oa...t',
    smoothBlend: 'boat', distractorPhonemes: ['g', 'ee'],
  },
  {
    id: 'bb-18', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    phonemes: ['t', 'ea', 'm'], targetWord: 'team', slowBlend: 't...ea...m',
    smoothBlend: 'team', distractorPhonemes: ['s', 'ai'],
  },
  {
    id: 'bb-19', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    phonemes: ['s', 'n', 'ow'], targetWord: 'snow', slowBlend: 's...n...ow',
    smoothBlend: 'snow', distractorPhonemes: ['t', 'ou'],
  },
  {
    id: 'bb-20', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    phonemes: ['c', 'oi', 'n'], targetWord: 'coin', slowBlend: 'c...oi...n',
    smoothBlend: 'coin', distractorPhonemes: ['t', 'oy'],
  },

  // Multisyllabic / complex blends (difficulty 4)
  {
    id: 'bb-21', gameType: 'blend_builder', difficulty: 4, skill: 'blending', pattern: 'complex',
    phonemes: ['s', 'p', 'l', 'a', 'sh'], targetWord: 'splash', slowBlend: 's...p...l...a...sh',
    smoothBlend: 'splash', distractorPhonemes: ['t', 'r'],
  },
  {
    id: 'bb-22', gameType: 'blend_builder', difficulty: 4, skill: 'blending', pattern: 'complex',
    phonemes: ['s', 'tr', 'ea', 'm'], targetWord: 'stream', slowBlend: 's...tr...ea...m',
    smoothBlend: 'stream', distractorPhonemes: ['p', 'ai'],
  },
  {
    id: 'bb-23', gameType: 'blend_builder', difficulty: 4, skill: 'blending', pattern: 'complex',
    phonemes: ['s', 'c', 'r', 'a', 'tch'], targetWord: 'scratch', slowBlend: 's...c...r...a...tch',
    smoothBlend: 'scratch', distractorPhonemes: ['p', 'i'],
  },

  // Nonword items (difficulty 2-3) — labeled clearly
  {
    id: 'bb-24', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'cvc',
    isNonword: true,
    phonemes: ['f', 'i', 'b'], targetWord: 'fib', slowBlend: 'f...i...b',
    smoothBlend: 'fib', distractorPhonemes: ['r', 'o'],
  },
  {
    id: 'bb-25', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'cvc',
    isNonword: true,
    phonemes: ['n', 'u', 'p'], targetWord: 'nup', slowBlend: 'n...u...p',
    smoothBlend: 'nup', distractorPhonemes: ['m', 'a'],
  },
  {
    id: 'bb-26', gameType: 'blend_builder', difficulty: 3, skill: 'blending_digraphs', pattern: 'digraph',
    isNonword: true,
    phonemes: ['th', 'o', 'b'], targetWord: 'thob', slowBlend: 'th...o...b',
    smoothBlend: 'thob', distractorPhonemes: ['sh', 'i'],
  },
  {
    id: 'bb-27', gameType: 'blend_builder', difficulty: 3, skill: 'blending_vowel_teams', pattern: 'vowel_team',
    isNonword: true,
    phonemes: ['f', 'oa', 'p'], targetWord: 'foap', slowBlend: 'f...oa...p',
    smoothBlend: 'foap', distractorPhonemes: ['g', 'ai'],
  },
  {
    id: 'bb-28', gameType: 'blend_builder', difficulty: 2, skill: 'blending', pattern: 'ccvc',
    isNonword: true,
    phonemes: ['b', 'l', 'i', 'k'], targetWord: 'blik', slowBlend: 'b...l...i...k',
    smoothBlend: 'blik', distractorPhonemes: ['r', 'a'],
  },
  {
    id: 'bb-29', gameType: 'blend_builder', difficulty: 3, skill: 'blending', pattern: 'ccvc',
    isNonword: true,
    phonemes: ['s', 'n', 'a', 'f'], targetWord: 'snaf', slowBlend: 's...n...a...f',
    smoothBlend: 'snaf', distractorPhonemes: ['t', 'o'],
  },
  {
    id: 'bb-30', gameType: 'blend_builder', difficulty: 4, skill: 'blending', pattern: 'complex',
    isNonword: true,
    phonemes: ['s', 'p', 'r', 'o', 'ck'], targetWord: 'sprock', slowBlend: 's...p...r...o...ck',
    smoothBlend: 'sprock', distractorPhonemes: ['t', 'i'],
  },
];

// ══════════════════════════════════════════════════
// SYLLABLE SPRINT — 25 items
// Syllabication + Stress
// ══════════════════════════════════════════════════

export const syllableSprintItems: SyllableSprintItem[] = [
  // 2-syllable (difficulty 1-2)
  {
    id: 'sy-01', gameType: 'syllable_sprint', difficulty: 1, skill: 'syllabication', pattern: '2_syllable',
    word: 'happen', syllables: ['hap', 'pen'], stressIndex: 0, vowelPositions: [1, 4],
  },
  {
    id: 'sy-02', gameType: 'syllable_sprint', difficulty: 1, skill: 'syllabication', pattern: '2_syllable',
    word: 'rabbit', syllables: ['rab', 'bit'], stressIndex: 0, vowelPositions: [1, 4],
  },
  {
    id: 'sy-03', gameType: 'syllable_sprint', difficulty: 1, skill: 'syllabication', pattern: '2_syllable',
    word: 'sunset', syllables: ['sun', 'set'], stressIndex: 0, vowelPositions: [1, 4],
  },
  {
    id: 'sy-04', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'silent', syllables: ['si', 'lent'], stressIndex: 0, vowelPositions: [1, 3],
  },
  {
    id: 'sy-05', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'robot', syllables: ['ro', 'bot'], stressIndex: 0, vowelPositions: [1, 3],
  },
  {
    id: 'sy-06', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'below', syllables: ['be', 'low'], stressIndex: 1, vowelPositions: [1, 3],
  },
  {
    id: 'sy-07', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'pillow', syllables: ['pil', 'low'], stressIndex: 0, vowelPositions: [1, 4],
  },
  {
    id: 'sy-08', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'kitten', syllables: ['kit', 'ten'], stressIndex: 0, vowelPositions: [1, 4],
  },

  // 3-syllable (difficulty 3)
  {
    id: 'sy-09', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'important', syllables: ['im', 'por', 'tant'], stressIndex: 1, vowelPositions: [0, 3, 6],
  },
  {
    id: 'sy-10', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'beautiful', syllables: ['beau', 'ti', 'ful'], stressIndex: 0, vowelPositions: [1, 5, 7],
  },
  {
    id: 'sy-11', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'adventure', syllables: ['ad', 'ven', 'ture'], stressIndex: 1, vowelPositions: [0, 3, 7],
  },
  {
    id: 'sy-12', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'remember', syllables: ['re', 'mem', 'ber'], stressIndex: 1, vowelPositions: [1, 3, 6],
  },
  {
    id: 'sy-13', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'hamburger', syllables: ['ham', 'bur', 'ger'], stressIndex: 0, vowelPositions: [1, 4, 7],
  },
  {
    id: 'sy-14', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'fantastic', syllables: ['fan', 'tas', 'tic'], stressIndex: 1, vowelPositions: [1, 4, 7],
  },
  {
    id: 'sy-15', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'umbrella', syllables: ['um', 'brel', 'la'], stressIndex: 1, vowelPositions: [0, 4, 7],
  },

  // 4-syllable (difficulty 4)
  {
    id: 'sy-16', gameType: 'syllable_sprint', difficulty: 4, skill: 'syllabication', pattern: '4_syllable',
    word: 'watermelon', syllables: ['wa', 'ter', 'mel', 'on'], stressIndex: 0, vowelPositions: [1, 3, 6, 9],
  },
  {
    id: 'sy-17', gameType: 'syllable_sprint', difficulty: 4, skill: 'syllabication', pattern: '4_syllable',
    word: 'information', syllables: ['in', 'for', 'ma', 'tion'], stressIndex: 2, vowelPositions: [0, 3, 6, 9],
  },
  {
    id: 'sy-18', gameType: 'syllable_sprint', difficulty: 4, skill: 'syllabication', pattern: '4_syllable',
    word: 'celebration', syllables: ['cel', 'e', 'bra', 'tion'], stressIndex: 2, vowelPositions: [1, 3, 6, 9],
  },
  {
    id: 'sy-19', gameType: 'syllable_sprint', difficulty: 4, skill: 'syllabication', pattern: '4_syllable',
    word: 'caterpillar', syllables: ['cat', 'er', 'pil', 'lar'], stressIndex: 0, vowelPositions: [1, 3, 6, 9],
  },
  {
    id: 'sy-20', gameType: 'syllable_sprint', difficulty: 4, skill: 'syllabication', pattern: '4_syllable',
    word: 'calculator', syllables: ['cal', 'cu', 'la', 'tor'], stressIndex: 0, vowelPositions: [1, 4, 6, 9],
  },

  // Mixed difficulty extras
  {
    id: 'sy-21', gameType: 'syllable_sprint', difficulty: 2, skill: 'syllabication', pattern: '2_syllable',
    word: 'pencil', syllables: ['pen', 'cil'], stressIndex: 0, vowelPositions: [1, 4],
  },
  {
    id: 'sy-22', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'discover', syllables: ['dis', 'cov', 'er'], stressIndex: 1, vowelPositions: [1, 4, 6],
  },
  {
    id: 'sy-23', gameType: 'syllable_sprint', difficulty: 3, skill: 'syllabication', pattern: '3_syllable',
    word: 'elephant', syllables: ['el', 'e', 'phant'], stressIndex: 0, vowelPositions: [0, 2, 5],
  },
  {
    id: 'sy-24', gameType: 'syllable_sprint', difficulty: 5, skill: 'syllabication', pattern: '4_syllable',
    word: 'understanding', syllables: ['un', 'der', 'stand', 'ing'], stressIndex: 2, vowelPositions: [0, 3, 7, 11],
  },
  {
    id: 'sy-25', gameType: 'syllable_sprint', difficulty: 5, skill: 'syllabication', pattern: '4_syllable',
    word: 'communication', syllables: ['com', 'mu', 'ni', 'ca', 'tion'], stressIndex: 3, vowelPositions: [1, 4, 6, 8, 12],
  },
];

// ══════════════════════════════════════════════════
// MORPHEME MATCH — 20 items
// Prefixes, Suffixes, Roots
// ══════════════════════════════════════════════════

export const morphemeMatchItems: MorphemeMatchItem[] = [
  // Prefix focus (difficulty 2-3)
  {
    id: 'mm-01', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'prefix_un',
    morphemes: ['un', 'happy'], targetWord: 'unhappy',
    meaning: 'not happy', meaningDistractors: ['very happy', 'somewhat happy'],
    morphemeMeanings: { un: 'not', happy: 'feeling good' },
  },
  {
    id: 'mm-02', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'prefix_re',
    morphemes: ['re', 'play'], targetWord: 'replay',
    meaning: 'play again', meaningDistractors: ['stop playing', 'play faster'],
    morphemeMeanings: { re: 'again', play: 'to participate in a game' },
  },
  {
    id: 'mm-03', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'prefix_pre',
    morphemes: ['pre', 'view'], targetWord: 'preview',
    meaning: 'see before', meaningDistractors: ['see after', 'see clearly'],
    morphemeMeanings: { pre: 'before', view: 'to see' },
  },
  {
    id: 'mm-04', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'prefix_dis',
    morphemes: ['dis', 'agree'], targetWord: 'disagree',
    meaning: 'not agree', meaningDistractors: ['fully agree', 'agree sometimes'],
    morphemeMeanings: { dis: 'not / opposite of', agree: 'to have the same opinion' },
  },
  {
    id: 'mm-05', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'prefix_mis',
    morphemes: ['mis', 'spell'], targetWord: 'misspell',
    meaning: 'spell incorrectly', meaningDistractors: ['spell perfectly', 'spell out loud'],
    morphemeMeanings: { mis: 'wrongly', spell: 'to write letters in order' },
  },

  // Suffix focus (difficulty 2-3)
  {
    id: 'mm-06', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'suffix_ful',
    morphemes: ['help', 'ful'], targetWord: 'helpful',
    meaning: 'full of help', meaningDistractors: ['needing help', 'without help'],
    morphemeMeanings: { help: 'to assist', ful: 'full of' },
  },
  {
    id: 'mm-07', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'suffix_less',
    morphemes: ['fear', 'less'], targetWord: 'fearless',
    meaning: 'without fear', meaningDistractors: ['full of fear', 'causing fear'],
    morphemeMeanings: { fear: 'feeling afraid', less: 'without' },
  },
  {
    id: 'mm-08', gameType: 'morpheme_match', difficulty: 2, skill: 'morphemic_awareness', pattern: 'suffix_ness',
    morphemes: ['kind', 'ness'], targetWord: 'kindness',
    meaning: 'the quality of being kind', meaningDistractors: ['a kind person', 'not kind'],
    morphemeMeanings: { kind: 'caring and gentle', ness: 'state or quality of' },
  },
  {
    id: 'mm-09', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'suffix_able',
    morphemes: ['break', 'able'], targetWord: 'breakable',
    meaning: 'can be broken', meaningDistractors: ['cannot be broken', 'already broken'],
    morphemeMeanings: { break: 'to split apart', able: 'can be done' },
  },
  {
    id: 'mm-10', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'suffix_ment',
    morphemes: ['move', 'ment'], targetWord: 'movement',
    meaning: 'the act of moving', meaningDistractors: ['standing still', 'a place to move'],
    morphemeMeanings: { move: 'to change position', ment: 'act or result of' },
  },

  // Combined prefix + suffix (difficulty 3-4)
  {
    id: 'mm-11', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'prefix_suffix',
    morphemes: ['un', 'break', 'able'], targetWord: 'unbreakable',
    meaning: 'cannot be broken', meaningDistractors: ['easy to break', 'already broken'],
    morphemeMeanings: { un: 'not', break: 'to split apart', able: 'can be done' },
  },
  {
    id: 'mm-12', gameType: 'morpheme_match', difficulty: 3, skill: 'morphemic_awareness', pattern: 'prefix_suffix',
    morphemes: ['re', 'build', 'ing'], targetWord: 'rebuilding',
    meaning: 'building again', meaningDistractors: ['tearing down', 'planning to build'],
    morphemeMeanings: { re: 'again', build: 'to construct', ing: 'in the process of' },
  },
  {
    id: 'mm-13', gameType: 'morpheme_match', difficulty: 4, skill: 'morphemic_awareness', pattern: 'prefix_suffix',
    morphemes: ['dis', 'respect', 'ful'], targetWord: 'disrespectful',
    meaning: 'showing no respect', meaningDistractors: ['very respectful', 'earning respect'],
    morphemeMeanings: { dis: 'not / opposite of', respect: 'to admire', ful: 'full of' },
  },

  // Latin/Greek roots (difficulty 4-5)
  {
    id: 'mm-14', gameType: 'morpheme_match', difficulty: 4, skill: 'morphemic_awareness', pattern: 'root_port',
    morphemes: ['trans', 'port'], targetWord: 'transport',
    meaning: 'carry across', meaningDistractors: ['stand still', 'build something'],
    morphemeMeanings: { trans: 'across', port: 'to carry' },
  },
  {
    id: 'mm-15', gameType: 'morpheme_match', difficulty: 4, skill: 'morphemic_awareness', pattern: 'root_dict',
    morphemes: ['pre', 'dict'], targetWord: 'predict',
    meaning: 'say before (foretell)', meaningDistractors: ['say after', 'say clearly'],
    morphemeMeanings: { pre: 'before', dict: 'to say or speak' },
  },
  {
    id: 'mm-16', gameType: 'morpheme_match', difficulty: 4, skill: 'morphemic_awareness', pattern: 'root_vis',
    morphemes: ['vis', 'ible'], targetWord: 'visible',
    meaning: 'able to be seen', meaningDistractors: ['unable to see', 'very bright'],
    morphemeMeanings: { vis: 'to see', ible: 'able to be' },
  },
  {
    id: 'mm-17', gameType: 'morpheme_match', difficulty: 4, skill: 'morphemic_awareness', pattern: 'root_struct',
    morphemes: ['con', 'struct', 'ion'], targetWord: 'construction',
    meaning: 'the act of building together', meaningDistractors: ['tearing apart', 'painting a wall'],
    morphemeMeanings: { con: 'together', struct: 'to build', ion: 'act or process of' },
  },
  {
    id: 'mm-18', gameType: 'morpheme_match', difficulty: 5, skill: 'morphemic_awareness', pattern: 'root_scrib',
    morphemes: ['de', 'scrib', 'e'], targetWord: 'describe',
    meaning: 'write down about', meaningDistractors: ['erase writing', 'read aloud'],
    morphemeMeanings: { de: 'down / about', scrib: 'to write', e: '' },
  },
  {
    id: 'mm-19', gameType: 'morpheme_match', difficulty: 5, skill: 'morphemic_awareness', pattern: 'root_rupt',
    morphemes: ['inter', 'rupt'], targetWord: 'interrupt',
    meaning: 'break between', meaningDistractors: ['continue smoothly', 'start over'],
    morphemeMeanings: { inter: 'between', rupt: 'to break' },
  },
  {
    id: 'mm-20', gameType: 'morpheme_match', difficulty: 5, skill: 'morphemic_awareness', pattern: 'root_ject',
    morphemes: ['re', 'ject', 'ion'], targetWord: 'rejection',
    meaning: 'the act of throwing back', meaningDistractors: ['warm acceptance', 'strong connection'],
    morphemeMeanings: { re: 'back', ject: 'to throw', ion: 'act or process of' },
  },
];

// ══════════════════════════════════════════════════
// ALL CONTENT — Combined export
// ══════════════════════════════════════════════════

export const allContent: ContentItem[] = [
  ...soundSnapItems,
  ...blendBuilderItems,
  ...syllableSprintItems,
  ...morphemeMatchItems,
];

// Total: 30 + 30 + 25 + 20 = 105 items
