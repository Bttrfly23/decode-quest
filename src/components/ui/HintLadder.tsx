'use client';

import { useApp } from '../AppProvider';
import { speakInstruction } from '@/lib/audio';

interface HintLadderProps {
  hints: string[];        // ordered hint messages (least → most help)
  currentLevel: number;   // 0 = no hints used, 1 = first hint, etc.
  maxLevel: number;
  onRequestHint: () => void;
  disabled?: boolean;
}

export function HintLadder({
  hints,
  currentLevel,
  maxLevel,
  onRequestHint,
  disabled = false,
}: HintLadderProps) {
  const { settings } = useApp();
  const canGetHint = currentLevel < maxLevel && !disabled;
  const activeHint = currentLevel > 0 ? hints[currentLevel - 1] : null;

  const handleHint = () => {
    if (!canGetHint) return;
    onRequestHint();
    // Speak the hint if audio is on
    if (settings.audioInstructions && hints[currentLevel]) {
      speakInstruction(hints[currentLevel]);
    }
  };

  return (
    <div className="mt-4">
      {activeHint && (
        <div className="bg-primary-light/20 border border-primary-light rounded-lg px-4 py-3 mb-3">
          <p className="text-sm text-foreground">{activeHint}</p>
        </div>
      )}
      <button
        onClick={handleHint}
        disabled={!canGetHint}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
          ${canGetHint
            ? 'bg-surface border border-border text-text-muted hover:bg-surface-hover hover:text-foreground'
            : 'bg-border text-text-muted/50 cursor-not-allowed'
          }`}
        aria-label={canGetHint ? 'Get a hint' : 'No more hints available'}
      >
        {canGetHint
          ? `💡 Need a hint? (${maxLevel - currentLevel} left)`
          : currentLevel >= maxLevel
            ? 'All hints used'
            : 'Hints unavailable'
        }
      </button>
    </div>
  );
}
