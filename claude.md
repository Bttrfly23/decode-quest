# DecodeQuest — CLAUDE.md

## Overview
Web-only MVP for ages 13–15 with dyslexia. 4 game loops targeting decoding skills (phonics + word attack). Personalized from a learner profile. Built with Next.js App Router, TypeScript, Tailwind CSS.

## Quick Start
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 54 vitest tests
npm run build   # production build
```

## Architecture

### Key Directories
- `src/app/` — Next.js App Router pages
- `src/components/games/` — 4 game components (SoundSnap, BlendBuilder, SyllableSprint, MorphemeMatch)
- `src/components/ui/` — shared UI (GameShell, HintLadder, FeedbackDisplay, ProgressBar, Navigation, TutorialOverlay, SessionRecap)
- `src/components/AppProvider.tsx` — React context: profile, progress, settings, all mutation handlers
- `src/lib/engine/` — adaptive selection, mastery scoring, error detection (this is the core logic)
- `src/lib/content/` — TypeScript types, 105-item seed dataset, confidence messages
- `src/lib/storage/` — LocalStorage wrapper (keys: `decodequest_progress`, `decodequest_settings`)
- `src/lib/audio/` — Web Speech API helpers with graceful degradation
- `public/student-profile/profile.json` — learner profile (parsed client-side on startup)

### Personalization (profile.json)
- **Content selection**: `skill_weighting` controls game frequency in missions; `error_focus` flags boost blending/sound snap items; `instructional_priorities.top_targets` gives priority bonus in item selection
- **Mastery calculation**: ADHD/variable processing speed → time weight drops to 0.05 (accuracy: 0.75, hints: 0.20, time: 0.05). Precision over speed always.
- **UX defaults**: `recommended_settings` applied on first load (session_minutes, audio, timers, reduced_motion, extended_hint_ladder). Overridable in Settings. Profile-sourced values marked with star icon.

### Learning Engine (`src/lib/engine/`)
- `adaptive-selector.ts` — `buildMission()` allocates game rounds by weight; `selectItems()` uses spaced repetition (missed items first, new items second, mastered items for review)
- `mastery.ts` — `scoreAttempt()` with configurable weights; `updateSkillMastery()` uses EMA (alpha=0.3); `calculateDifficulty()` advances at ≥85% accuracy + low hints, retreats at <60%
- `error-detection.ts` — `detectGuessing()` (fast wrong without hints, twice consecutive); `classifyError()` (omission/addition/visual guessing); triggers forced scaffold

### LocalStorage Keys
- `decodequest_progress` — ProgressData (masteries, attempts, sessions, badges, XP)
- `decodequest_settings` — AppSettings (font, spacing, contrast, audio, session length)

### Content Data
- 105 items total in `src/lib/content/seed-data.ts`: 30 Sound Snap, 30 Blend Builder, 25 Syllable Sprint, 20 Morpheme Match
- Extra items for digraphs + vowel teams + blending (aligned to profile)
- Nonword items in Blend Builder labeled as "Practice Word"

## Conventions
- All text left-aligned, never justified
- No shame states — wrong answers get "try again" + hint ladder
- Participation XP (2) even for wrong answers; no XP loss
- Feedback is supportive and teen-appropriate, not patronizing
- `prefers-reduced-motion` respected via CSS + `.reduced-motion` class
- Atkinson Hyperlegible default font, loaded from Google Fonts
- Game screens hide bottom nav; other pages show it

## Routes
- `/` — Home (mission CTA, stats, quick play)
- `/games/mission` — Today's Mission orchestrator
- `/games/sound-snap` — standalone Sound Snap
- `/games/blend-builder` — standalone Blend Builder
- `/games/syllable-sprint` — standalone Syllable Sprint
- `/games/morpheme-match` — standalone Morpheme Match
- `/progress` — skill bars, game stats, badges, focus suggestions
- `/settings` — all accessibility + session options, reset progress
- `/help` — what decoding is, how hints work, privacy note

## Tests
Located in `src/lib/engine/__tests__/`. Run with `npm test`.
- `mastery.test.ts` — 24 tests (scoring, EMA updates, difficulty, XP, ADHD weights)
- `error-detection.test.ts` — 17 tests (guessing, omission, addition, visual guessing, scaffolding)
- `adaptive-selector.test.ts` — 13 tests (mission building, item selection, priority scoring, spaced repetition)

## Important Thresholds (tunable)
- Difficulty increase: accuracy ≥ 85% AND avg hints < 0.5
- Difficulty decrease: accuracy < 60%
- Guessing detection: wrong + <3s + no hints + 2 consecutive
- Mastery EMA alpha: 0.3
- Items per game round: 5
- Max stored attempts: 200; max session history: 30
