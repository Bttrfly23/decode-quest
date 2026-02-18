'use client';

import { useEffect } from 'react';
import { speakInstruction } from '@/lib/audio';
import { useApp } from '../AppProvider';

interface FeedbackDisplayProps {
  type: 'correct' | 'tryagain' | 'scaffold' | 'info';
  message: string;
  subMessage?: string;
  onContinue?: () => void;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
}

const feedbackStyles = {
  correct: 'bg-success-light/30 border-success text-foreground',
  tryagain: 'bg-warning/10 border-warning text-foreground',
  scaffold: 'bg-primary-light/20 border-primary text-foreground',
  info: 'bg-surface border-border text-foreground',
};

const feedbackIcons = {
  correct: '✓',
  tryagain: '→',
  scaffold: '💡',
  info: 'ℹ',
};

export function FeedbackDisplay({
  type,
  message,
  subMessage,
  onContinue,
  autoAdvance = false,
  autoAdvanceMs = 1500,
}: FeedbackDisplayProps) {
  const { settings } = useApp();

  useEffect(() => {
    if (settings.audioInstructions) {
      speakInstruction(message);
    }
  }, [message, settings.audioInstructions]);

  useEffect(() => {
    if (autoAdvance && onContinue) {
      const timer = setTimeout(onContinue, autoAdvanceMs);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, autoAdvanceMs, onContinue]);

  return (
    <div
      className={`rounded-xl border-2 px-5 py-4 mt-4 ${feedbackStyles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0" aria-hidden="true">
          {feedbackIcons[type]}
        </span>
        <div>
          <p className="font-medium">{message}</p>
          {subMessage && (
            <p className="text-sm text-text-muted mt-1">{subMessage}</p>
          )}
        </div>
      </div>
      {onContinue && !autoAdvance && (
        <button
          onClick={onContinue}
          className="mt-3 w-full bg-primary text-white py-2 px-4 rounded-lg font-medium
            hover:bg-primary-dark transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  );
}
