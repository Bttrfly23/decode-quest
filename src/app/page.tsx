'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { gameDisplayNames, gameIcons, getRandomMessage } from '@/lib/content/messages';
import { GameType } from '@/lib/content/types';
import { initAudio } from '@/lib/audio';

export default function HomePage() {
  const router = useRouter();
  const { profile, progress, settings, updateSettings } = useApp();

  const lastSession = progress.sessionHistory[progress.sessionHistory.length - 1];
  const totalMastery = progress.skillMasteries.length > 0
    ? Math.round(progress.skillMasteries.reduce((s, m) => s + m.mastery, 0) / progress.skillMasteries.length)
    : 0;

  const handleStartMission = async () => {
    await initAudio();
    router.push('/games/mission');
  };

  const handleQuickPlay = async (game: GameType) => {
    await initAudio();
    router.push(`/games/${game.replace(/_/g, '-')}`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">DecodeQuest</h1>
          <p className="text-sm text-text-muted">Build your decoding skills</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateSettings({ audioInstructions: !settings.audioInstructions })}
            className="text-xl p-2 rounded-lg hover:bg-surface-hover"
            aria-label={settings.audioInstructions ? 'Mute audio' : 'Enable audio'}
          >
            {settings.audioInstructions ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Streak + XP */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{progress.totalXP}</div>
          <div className="text-xs text-text-muted">Total XP</div>
        </div>
        <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-accent">{progress.currentStreak}</div>
          <div className="text-xs text-text-muted">Day Streak</div>
        </div>
        <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-success">{totalMastery}%</div>
          <div className="text-xs text-text-muted">Avg Mastery</div>
        </div>
      </div>

      {/* Today's Mission CTA */}
      <button
        onClick={handleStartMission}
        className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl
          hover:bg-primary-dark transition-colors shadow-lg mb-6 game-tile"
      >
        Start Today&apos;s Mission
        <span className="block text-sm font-normal opacity-80 mt-1">
          ~{settings.sessionMinutes} min session
        </span>
      </button>

      {/* Quick play buttons */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Quick Play
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(['sound_snap', 'blend_builder', 'syllable_sprint', 'morpheme_match'] as GameType[]).map(game => {
            const gp = progress.gameProgress[game];
            return (
              <button
                key={game}
                onClick={() => handleQuickPlay(game)}
                className="bg-surface border border-border rounded-xl p-4 text-left
                  hover:border-primary transition-colors game-tile"
              >
                <div className="text-2xl mb-1">{gameIcons[game]}</div>
                <div className="font-semibold text-sm">{gameDisplayNames[game]}</div>
                <ProgressBar value={gp.recentAccuracy} size="sm" color="primary" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Last session recap */}
      {lastSession && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
            Last Session
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">
              {lastSession.correctItems}/{lastSession.totalItems} correct
            </span>
            <span className="text-sm font-medium text-accent">+{lastSession.xpEarned} XP</span>
          </div>
          <ProgressBar
            value={lastSession.totalItems > 0
              ? Math.round((lastSession.correctItems / lastSession.totalItems) * 100)
              : 0}
            size="sm"
            color="success"
          />
          {lastSession.nextFocus.length > 0 && (
            <p className="text-xs text-text-muted mt-2">
              Next focus: {lastSession.nextFocus.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Confidence message */}
      <div className="text-center text-sm text-text-muted py-4">
        {getRandomMessage(progress.currentStreak > 0 ? 'streak' : 'encouragement')}
      </div>

      {/* Profile indicator */}
      {profile && (
        <div className="text-center text-xs text-text-muted/50 pb-4">
          Personalized for your learning profile
        </div>
      )}
    </div>
  );
}
