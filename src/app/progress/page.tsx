'use client';

import { useApp } from '@/components/AppProvider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { gameDisplayNames, gameIcons, getRandomMessage } from '@/lib/content/messages';
import { GameType, SkillMastery } from '@/lib/content/types';

const skillDisplayNames: Record<string, string> = {
  digraphs: 'Digraphs',
  vowel_teams: 'Vowel Teams',
  silent_e: 'Silent-E',
  r_controlled: 'R-Controlled',
  soft_c_g: 'Soft C & G',
  tion_sion: '-tion / -sion',
  blending: 'Blending',
  blending_digraphs: 'Blending Digraphs',
  blending_vowel_teams: 'Blending Vowel Teams',
  syllabication: 'Syllabication',
  morphemic_awareness: 'Morpheme Awareness',
};

export default function ProgressPage() {
  const { progress, profile } = useApp();

  // Group masteries by skill
  const skillGroups = new Map<string, SkillMastery[]>();
  for (const m of progress.skillMasteries) {
    const existing = skillGroups.get(m.skill) || [];
    existing.push(m);
    skillGroups.set(m.skill, existing);
  }

  // Calculate average mastery per skill
  const skillAverages = Array.from(skillGroups.entries()).map(([skill, masteries]) => ({
    skill,
    displayName: skillDisplayNames[skill] || skill,
    average: Math.round(masteries.reduce((s, m) => s + m.mastery, 0) / masteries.length),
    count: masteries.length,
  }));

  // Sort by mastery ascending (weakest first)
  skillAverages.sort((a, b) => a.average - b.average);

  const totalMastery = progress.skillMasteries.length > 0
    ? Math.round(progress.skillMasteries.reduce((s, m) => s + m.mastery, 0) / progress.skillMasteries.length)
    : 0;

  // Recent wins (high mastery skills)
  const recentWins = skillAverages.filter(s => s.average >= 75);

  // Work on next (low mastery)
  const workOnNext = skillAverages.filter(s => s.average < 70).slice(0, 3);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{progress.totalXP}</div>
          <div className="text-sm text-text-muted">Total XP</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-accent">{totalMastery}%</div>
          <div className="text-sm text-text-muted">Avg Mastery</div>
        </div>
      </div>

      {/* Overall mastery bar */}
      <div className="mb-8">
        <ProgressBar
          value={totalMastery}
          label="Overall Decoding Mastery"
          showPercent
          size="lg"
          color={totalMastery >= 80 ? 'success' : totalMastery >= 50 ? 'primary' : 'warning'}
        />
      </div>

      {/* Game progress */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Games
        </h2>
        <div className="space-y-3">
          {(['sound_snap', 'blend_builder', 'syllable_sprint', 'morpheme_match'] as GameType[]).map(game => {
            const gp = progress.gameProgress[game];
            return (
              <div key={game} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{gameIcons[game]}</span>
                    <span className="font-semibold text-sm">{gameDisplayNames[game]}</span>
                  </div>
                  <span className="text-sm text-text-muted">
                    Level {gp.currentDifficulty} &middot; {gp.totalXP} XP
                  </span>
                </div>
                <ProgressBar value={gp.recentAccuracy} size="sm" showPercent />
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill breakdown */}
      {skillAverages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
            Skills
          </h2>
          <div className="space-y-2">
            {skillAverages.map(s => (
              <div key={s.skill}>
                <ProgressBar
                  value={s.average}
                  label={s.displayName}
                  showPercent
                  size="md"
                  color={s.average >= 80 ? 'success' : s.average >= 50 ? 'primary' : 'warning'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent wins */}
      {recentWins.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
            Recent Wins
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentWins.map(w => (
              <span
                key={w.skill}
                className="bg-success-light/30 text-foreground px-3 py-1 rounded-full text-sm"
              >
                {w.displayName} ({w.average}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work on next */}
      {workOnNext.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
            Focus Next
          </h2>
          <div className="space-y-2">
            {workOnNext.map(w => (
              <div key={w.skill} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm">{w.displayName}</span>
                <span className="text-sm text-warning font-medium">{w.average}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
            Badges
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {progress.badges.map(badge => (
              <div key={badge.id} className="bg-surface border border-border rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence message */}
      <div className="text-center text-sm text-text-muted py-4">
        {getRandomMessage('progress', totalMastery)}
      </div>

      {/* Profile-based suggestions */}
      {profile && (
        <div className="text-xs text-text-muted/50 text-center pb-8">
          Progress adapted from your learning profile.
          Focus areas: {profile.instructional_priorities.top_targets.slice(0, 3).join(', ')}.
        </div>
      )}
    </div>
  );
}
