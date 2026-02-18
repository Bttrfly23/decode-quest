'use client';

import { speakInstruction } from '@/lib/audio';
import { useApp } from '../AppProvider';
import { useEffect } from 'react';

interface TutorialOverlayProps {
  title: string;
  steps: string[];
  onDismiss: () => void;
}

export function TutorialOverlay({ title, steps, onDismiss }: TutorialOverlayProps) {
  const { settings } = useApp();

  useEffect(() => {
    if (settings.audioInstructions) {
      const text = `${title}. ${steps.join('. ')}`;
      speakInstruction(text);
    }
  }, [title, steps, settings.audioInstructions]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <ol className="space-y-3 mb-6">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full
                flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={onDismiss}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold
            hover:bg-primary-dark transition-colors text-lg"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
