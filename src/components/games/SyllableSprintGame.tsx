'use client';

import { useState, useEffect, useCallback } from 'react';
import { SyllableSprintItem, ItemAttempt, SessionSummary } from '@/lib/content/types';
import { useApp } from '../AppProvider';
import { GameShell } from '../ui/GameShell';
import { HintLadder } from '../ui/HintLadder';
import { FeedbackDisplay } from '../ui/FeedbackDisplay';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SessionRecap } from '../ui/SessionRecap';
import { speak } from '@/lib/audio';
import { getRandomMessage } from '@/lib/content/messages';

interface SyllableSprintGameProps {
  items: SyllableSprintItem[];
}

type Phase = 'split' | 'stress' | null;

export function SyllableSprintGame({ items }: SyllableSprintGameProps) {
  const { progress, settings, recordAttempt, finishSession, markTutorialShown } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('split');
  const [breakPositions, setBreakPositions] = useState<Set<number>>(new Set());
  const [selectedStress, setSelectedStress] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'tryagain' | 'scaffold'; message: string; sub?: string } | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [startTime] = useState(Date.now());
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [sessionAttempts, setSessionAttempts] = useState<ItemAttempt[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [splitCorrect, setSplitCorrect] = useState(false);

  const maxHints = settings.extendedHintLadder ? 4 : 3;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!progress.tutorialsShown.includes('syllable_sprint')) {
      setShowTutorial(true);
    }
  }, [progress.tutorialsShown]);

  useEffect(() => {
    if (currentItem) {
      setPhase('split');
      setBreakPositions(new Set());
      setSelectedStress(null);
      setHintLevel(0);
      setFeedback(null);
      setSplitCorrect(false);
      setItemStartTime(Date.now());
    }
  }, [currentIndex, currentItem]);

  const getCorrectBreakPositions = useCallback((item: SyllableSprintItem): Set<number> => {
    const positions = new Set<number>();
    let pos = 0;
    for (let i = 0; i < item.syllables.length - 1; i++) {
      pos += item.syllables[i].length;
      positions.add(pos);
    }
    return positions;
  }, []);

  const getHints = useCallback((item: SyllableSprintItem): string[] => {
    const hints = [
      `This word has ${item.syllables.length} syllables. Look for the vowels.`,
      `Each syllable needs a vowel sound. Find them first.`,
      `The syllables are: ${item.syllables.join(' · ')}`,
    ];
    if (settings.extendedHintLadder) {
      hints.push(`Tap between these letters to split: ${item.syllables.join(' | ')}`);
    }
    return hints;
  }, [settings.extendedHintLadder]);

  const toggleBreak = (position: number) => {
    if (feedback) return;
    setBreakPositions(prev => {
      const next = new Set(prev);
      if (next.has(position)) {
        next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  };

  const handleCheckSplit = () => {
    if (feedback) return;
    const correct = getCorrectBreakPositions(currentItem);
    const isCorrect =
      breakPositions.size === correct.size &&
      [...breakPositions].every(p => correct.has(p));

    if (isCorrect) {
      setSplitCorrect(true);
      setFeedback({ type: 'correct', message: 'Great split! Now find the stressed syllable.' });
      setTimeout(() => {
        setFeedback(null);
        setPhase('stress');
      }, 1500);
    } else {
      setFeedback({
        type: 'tryagain',
        message: 'Not quite — try moving the breaks.',
        sub: `This word has ${currentItem.syllables.length} syllables.`,
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleSelectStress = (index: number) => {
    if (feedback) return;
    setSelectedStress(index);

    const timeMs = Date.now() - itemStartTime;
    const isCorrect = index === currentItem.stressIndex;

    const attempt: ItemAttempt = {
      itemId: currentItem.id,
      gameType: 'syllable_sprint',
      timestamp: Date.now(),
      correct: isCorrect && splitCorrect,
      hintsUsed: hintLevel,
      timeMs,
    };

    if (isCorrect) {
      const xp = 15 + (hintLevel === 0 ? 5 : 0);
      setSessionXP(prev => prev + xp);
      setFeedback({ type: 'correct', message: getRandomMessage('encouragement') });

      // Speak the word with emphasis
      speak(currentItem.word, { rate: 0.8 });

      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);

      setTimeout(() => advanceItem(), 1500);
    } else {
      setFeedback({
        type: 'tryagain',
        message: 'That\'s not the stressed syllable. Try again.',
        sub: 'The stressed syllable is the one you say a bit louder.',
      });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);
      setSessionXP(prev => prev + 2);

      setTimeout(() => {
        setFeedback(null);
        setSelectedStress(null);
      }, 2000);
    }
  };

  const advanceItem = () => {
    if (currentIndex + 1 >= items.length) {
      completeSession();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const completeSession = () => {
    const correct = sessionAttempts.filter(a => a.correct).length;
    const totalHints = sessionAttempts.reduce((s, a) => s + a.hintsUsed, 0);

    const summary: SessionSummary = {
      date: Date.now(),
      duration: Date.now() - startTime,
      gamesPlayed: ['syllable_sprint'],
      totalItems: items.length,
      correctItems: correct,
      hintsUsed: totalHints,
      xpEarned: sessionXP,
      improvements: correct > items.length * 0.7 ? ['Syllable division'] : [],
      nextFocus: correct < items.length * 0.6
        ? ['Simpler syllable patterns']
        : ['Longer multisyllabic words'],
    };

    finishSession(summary);
    setSessionSummary(summary);
    setSessionComplete(true);
  };

  if (showTutorial) {
    return (
      <TutorialOverlay
        title="Syllable Sprint"
        steps={[
          'You\'ll see a word displayed letter by letter.',
          'Tap between letters to mark where syllables break.',
          'Then pick which syllable gets the stress (emphasis).',
          'Use hints if you\'re unsure. Take your time.',
        ]}
        onDismiss={() => {
          setShowTutorial(false);
          markTutorialShown('syllable_sprint');
        }}
      />
    );
  }

  if (sessionComplete && sessionSummary) {
    return <SessionRecap summary={sessionSummary} />;
  }

  if (!currentItem) return null;

  const letters = currentItem.word.split('');

  return (
    <GameShell
      title="Syllable Sprint"
      icon="✂️"
      currentItem={currentIndex}
      totalItems={items.length}
      xp={sessionXP}
    >
      <div className="text-center mb-6">
        <p className="text-text-muted text-sm mb-2">
          {phase === 'split'
            ? 'Tap between letters to split into syllables'
            : 'Tap the stressed syllable'}
        </p>
      </div>

      {/* Word display with break points */}
      {phase === 'split' && (
        <>
          <div className="flex items-center justify-center flex-wrap gap-0 mb-8">
            {letters.map((letter, i) => (
              <div key={i} className="flex items-center">
                <span className="text-3xl font-bold px-1">{letter}</span>
                {i < letters.length - 1 && (
                  <button
                    onClick={() => toggleBreak(i + 1)}
                    className={`syllable-break rounded mx-0.5 ${
                      breakPositions.has(i + 1) ? 'active' : ''
                    }`}
                    aria-label={`Toggle syllable break after "${letter}"`}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckSplit}
            disabled={breakPositions.size === 0}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg
              hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Splits
          </button>
        </>
      )}

      {/* Stress selection */}
      {phase === 'stress' && (
        <div className="space-y-3">
          <p className="text-center text-sm text-text-muted mb-4">
            Which syllable do you say a bit louder?
          </p>
          {currentItem.syllables.map((syl, i) => (
            <button
              key={i}
              onClick={() => handleSelectStress(i)}
              className={`w-full p-4 rounded-xl text-xl font-bold text-center
                border-2 transition-colors game-tile
                ${selectedStress === i
                  ? i === currentItem.stressIndex
                    ? 'bg-success-light/30 border-success'
                    : 'bg-warning/10 border-warning'
                  : 'bg-surface border-border hover:border-primary'
                }`}
            >
              {syl}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <FeedbackDisplay
          type={feedback.type}
          message={feedback.message}
          subMessage={feedback.sub}
        />
      )}

      {/* Hint Ladder */}
      <HintLadder
        hints={getHints(currentItem)}
        currentLevel={hintLevel}
        maxLevel={maxHints}
        onRequestHint={() => setHintLevel(prev => prev + 1)}
      />
    </GameShell>
  );
}
