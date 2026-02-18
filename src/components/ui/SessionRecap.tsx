'use client';

import { useRouter } from 'next/navigation';
import { SessionSummary } from '@/lib/content/types';
import { getRandomMessage } from '@/lib/content/messages';
import { ProgressBar } from './ProgressBar';

interface SessionRecapProps {
  summary: SessionSummary;
}

export function SessionRecap({ summary }: SessionRecapProps) {
  const router = useRouter();
  const accuracy = summary.totalItems > 0
    ? Math.round((summary.correctItems / summary.totalItems) * 100)
    : 0;

  const encouragement = getRandomMessage(accuracy >= 80 ? 'mastery' : 'progress', accuracy);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center mb-2">Mission Complete</h1>
        <p className="text-center text-text-muted mb-6">{encouragement}</p>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Accuracy</span>
            <span className="font-bold text-lg">{accuracy}%</span>
          </div>
          <ProgressBar value={accuracy} color={accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'primary'} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-surface-hover rounded-lg p-3">
              <div className="text-xl font-bold text-primary">{summary.xpEarned}</div>
              <div className="text-xs text-text-muted">XP Earned</div>
            </div>
            <div className="bg-surface-hover rounded-lg p-3">
              <div className="text-xl font-bold text-success">{summary.correctItems}</div>
              <div className="text-xs text-text-muted">Correct</div>
            </div>
            <div className="bg-surface-hover rounded-lg p-3">
              <div className="text-xl font-bold text-accent">{summary.totalItems}</div>
              <div className="text-xs text-text-muted">Total</div>
            </div>
          </div>
        </div>

        {summary.improvements.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">You improved on:</h3>
            <ul className="space-y-1">
              {summary.improvements.map((imp, i) => (
                <li key={i} className="text-sm text-success flex items-center gap-2">
                  <span>↑</span> {imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.nextFocus.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Next mission focuses on:</h3>
            <ul className="space-y-1">
              {summary.nextFocus.map((focus, i) => (
                <li key={i} className="text-sm text-text-muted flex items-center gap-2">
                  <span>→</span> {focus}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold
              hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push('/progress')}
            className="w-full bg-surface border border-border py-3 rounded-xl
              text-text-muted hover:bg-surface-hover transition-colors"
          >
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
}
