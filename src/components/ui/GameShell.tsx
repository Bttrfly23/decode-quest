'use client';

import { useRouter } from 'next/navigation';
import { ProgressBar } from './ProgressBar';
import { useApp } from '../AppProvider';
import { speakInstruction, stopSpeech } from '@/lib/audio';

interface GameShellProps {
  title: string;
  icon: string;
  currentItem: number;
  totalItems: number;
  xp: number;
  children: React.ReactNode;
  onQuit?: () => void;
}

export function GameShell({
  title,
  icon,
  currentItem,
  totalItems,
  xp,
  children,
  onQuit,
}: GameShellProps) {
  const router = useRouter();
  const { settings } = useApp();

  const progress = totalItems > 0 ? Math.round((currentItem / totalItems) * 100) : 0;

  const handleQuit = () => {
    stopSpeech();
    if (onQuit) {
      onQuit();
    } else {
      router.push('/');
    }
  };

  const handleAudioInstruction = () => {
    speakInstruction(`${title}. Item ${currentItem + 1} of ${totalItems}.`);
  };

  return (
    <div className="min-h-screen bg-background pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-surface border-b border-border z-40 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleQuit}
              className="text-text-muted hover:text-foreground text-sm px-2 py-1 rounded"
              aria-label="Quit game"
            >
              ✕ Quit
            </button>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">{icon}</span>
              <span className="font-semibold">{title}</span>
            </div>
            <div className="flex items-center gap-2">
              {settings.audioInstructions && (
                <button
                  onClick={handleAudioInstruction}
                  className="text-xl p-1 rounded hover:bg-surface-hover"
                  aria-label="Hear instructions"
                >
                  🔊
                </button>
              )}
              <span className="text-sm font-medium text-accent">{xp} XP</span>
            </div>
          </div>
          <ProgressBar value={progress} size="sm" />
          <div className="text-xs text-text-muted text-center mt-1">
            {currentItem + 1} of {totalItems}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        {children}
      </div>
    </div>
  );
}
