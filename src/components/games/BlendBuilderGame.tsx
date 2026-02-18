'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlendBuilderItem, ItemAttempt, SessionSummary } from '@/lib/content/types';
import { useApp } from '../AppProvider';
import { GameShell } from '../ui/GameShell';
import { HintLadder } from '../ui/HintLadder';
import { FeedbackDisplay } from '../ui/FeedbackDisplay';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SessionRecap } from '../ui/SessionRecap';
import { speak, speakPhonemes, speakSlowBlend, speakSmoothBlend } from '@/lib/audio';
import { detectGuessing, classifyError, getErrorFeedback } from '@/lib/engine/error-detection';
import { getRandomMessage } from '@/lib/content/messages';

interface BlendBuilderGameProps {
  items: BlendBuilderItem[];
}

export function BlendBuilderGame({ items }: BlendBuilderGameProps) {
  const { profile, progress, settings, recordAttempt, finishSession, markTutorialShown } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'tryagain' | 'scaffold'; message: string; sub?: string } | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [startTime] = useState(Date.now());
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [sessionAttempts, setSessionAttempts] = useState<ItemAttempt[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [forcedScaffold, setForcedScaffold] = useState(false);

  const maxHints = settings.extendedHintLadder ? 4 : 3;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!progress.tutorialsShown.includes('blend_builder')) {
      setShowTutorial(true);
    }
  }, [progress.tutorialsShown]);

  const getAllTiles = useCallback((item: BlendBuilderItem): string[] => {
    const all = [...item.phonemes, ...item.distractorPhonemes];
    return [...all].sort(() => Math.random() - 0.5);
  }, []);

  const [tiles, setTiles] = useState<string[]>([]);

  useEffect(() => {
    if (currentItem) {
      setTiles(getAllTiles(currentItem));
      setSelectedPhonemes([]);
      setHintLevel(0);
      setFeedback(null);
      setIsRevealing(false);
      setForcedScaffold(false);
      setItemStartTime(Date.now());
    }
  }, [currentIndex, currentItem, getAllTiles]);

  const getHints = useCallback((item: BlendBuilderItem): string[] => {
    const hints = [
      `The first sound is "${item.phonemes[0]}".`,
      `Try building it in chunks: "${item.phonemes.slice(0, Math.ceil(item.phonemes.length / 2)).join('-')}"...`,
      `The word is "${item.targetWord}" — tap the sounds in order.`,
    ];
    if (settings.extendedHintLadder) {
      hints.push(`The sounds are: ${item.phonemes.join(', ')}. Tap them in that order.`);
    }
    return hints;
  }, [settings.extendedHintLadder]);

  const handleTileSelect = (phoneme: string, tileIndex: number) => {
    if (isRevealing || feedback) return;

    // If forcing scaffold, phonemes must be tapped carefully
    setSelectedPhonemes(prev => [...prev, phoneme]);
    // Speak each phoneme as tapped
    speak(phoneme, { rate: 0.7 });
  };

  const handleRemoveLast = () => {
    if (isRevealing || feedback) return;
    setSelectedPhonemes(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isRevealing || feedback || selectedPhonemes.length === 0) return;

    const timeMs = Date.now() - itemStartTime;
    const isCorrect = selectedPhonemes.join('') === currentItem.phonemes.join('');

    const attempt: ItemAttempt = {
      itemId: currentItem.id,
      gameType: 'blend_builder',
      timestamp: Date.now(),
      correct: isCorrect,
      hintsUsed: hintLevel,
      timeMs,
    };

    const isGuessing = detectGuessing(attempt, sessionAttempts);

    if (isCorrect) {
      const xp = 15 + (hintLevel === 0 ? 5 : 0);
      setSessionXP(prev => prev + xp);
      setFeedback({ type: 'correct', message: getRandomMessage('encouragement') });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);

      // Play the blended word
      speakSmoothBlend(currentItem.smoothBlend);

      setIsRevealing(true);
      setTimeout(() => advanceItem(), 2000);
    } else if (isGuessing) {
      attempt.wasGuessing = true;
      setForcedScaffold(true);
      setFeedback({
        type: 'scaffold',
        message: "Let's slow down and tap each sound one at a time.",
        sub: 'Tap the sounds you hear in order. No rush.',
      });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);
      setSessionXP(prev => prev + 2);

      setTimeout(() => {
        setFeedback(null);
        setSelectedPhonemes([]);
      }, 2500);
    } else {
      // Check error type
      const errorType = classifyError(selectedPhonemes, currentItem.phonemes, profile);
      const errorFeedback = getErrorFeedback(errorType);

      setFeedback({
        type: 'tryagain',
        message: errorFeedback ?? "Not quite — try rearranging the sounds.",
        sub: 'Use a hint if you need help.',
      });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);

      setTimeout(() => {
        setFeedback(null);
        setSelectedPhonemes([]);
      }, 2500);
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
      gamesPlayed: ['blend_builder'],
      totalItems: items.length,
      correctItems: correct,
      hintsUsed: totalHints,
      xpEarned: sessionXP,
      improvements: correct > items.length * 0.7 ? ['Phoneme blending'] : [],
      nextFocus: correct < items.length * 0.6
        ? ['More blending practice with simpler words']
        : ['Harder blending patterns'],
    };

    finishSession(summary);
    setSessionSummary(summary);
    setSessionComplete(true);
  };

  const handleSlowBlend = () => speakSlowBlend(currentItem.slowBlend);
  const handleSmoothBlend = () => speakSmoothBlend(currentItem.smoothBlend);

  if (showTutorial) {
    return (
      <TutorialOverlay
        title="Blend Builder"
        steps={[
          'You\'ll see sound tiles at the bottom.',
          'Tap them in order to build the word.',
          'Use "Slow Blend" to hear the sounds stretched out.',
          'Submit when you think the order is correct.',
          'Hints are always available if you get stuck.',
        ]}
        onDismiss={() => {
          setShowTutorial(false);
          markTutorialShown('blend_builder');
        }}
      />
    );
  }

  if (sessionComplete && sessionSummary) {
    return <SessionRecap summary={sessionSummary} />;
  }

  if (!currentItem) return null;

  return (
    <GameShell
      title="Blend Builder"
      icon="🔗"
      currentItem={currentIndex}
      totalItems={items.length}
      xp={sessionXP}
    >
      {/* Nonword label */}
      {currentItem.isNonword && (
        <div className="text-center mb-2">
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
            Practice Word
          </span>
        </div>
      )}

      {/* Prompt */}
      <div className="text-center mb-6">
        <p className="text-text-muted text-sm mb-3">Build the word by tapping sounds in order</p>
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={handleSlowBlend}
            className="px-4 py-2 bg-primary-light/20 rounded-lg text-sm font-medium
              hover:bg-primary-light/30 transition-colors"
          >
            🔊 Slow Blend
          </button>
          <button
            onClick={handleSmoothBlend}
            className="px-4 py-2 bg-primary-light/20 rounded-lg text-sm font-medium
              hover:bg-primary-light/30 transition-colors"
          >
            🔊 Smooth
          </button>
        </div>
      </div>

      {/* Build area */}
      <div className="bg-surface border-2 border-border rounded-xl p-4 mb-6 min-h-[4rem]">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {selectedPhonemes.length === 0 ? (
            <span className="text-text-muted text-sm">Tap sounds below to build the word</span>
          ) : (
            selectedPhonemes.map((p, i) => (
              <span
                key={i}
                className="bg-primary text-white px-4 py-2 rounded-lg text-lg font-bold"
              >
                {p}
              </span>
            ))
          )}
        </div>
        {selectedPhonemes.length > 0 && (
          <button
            onClick={handleRemoveLast}
            className="mt-2 text-sm text-text-muted hover:text-foreground"
          >
            ← Remove last
          </button>
        )}
      </div>

      {/* Sound tiles */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {tiles.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            onClick={() => handleTileSelect(tile, i)}
            disabled={isRevealing}
            className="phoneme-tile bg-surface border-2 border-border rounded-xl px-5 py-3
              text-lg font-bold hover:border-primary"
          >
            {tile}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={selectedPhonemes.length === 0 || isRevealing}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg
          hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Check Answer
      </button>

      {/* Forced scaffold indicator */}
      {forcedScaffold && (
        <div className="mt-2 text-center text-sm text-accent">
          Scaffold mode: tap each sound carefully
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
      {!isRevealing && (
        <HintLadder
          hints={getHints(currentItem)}
          currentLevel={hintLevel}
          maxLevel={maxHints}
          onRequestHint={() => setHintLevel(prev => prev + 1)}
        />
      )}
    </GameShell>
  );
}
