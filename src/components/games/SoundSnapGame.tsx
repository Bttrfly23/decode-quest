'use client';

import { useState, useEffect, useCallback } from 'react';
import { SoundSnapItem, ItemAttempt, SessionSummary } from '@/lib/content/types';
import { useApp } from '../AppProvider';
import { GameShell } from '../ui/GameShell';
import { HintLadder } from '../ui/HintLadder';
import { FeedbackDisplay } from '../ui/FeedbackDisplay';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SessionRecap } from '../ui/SessionRecap';
import { speak, speakInstruction } from '@/lib/audio';
import { detectGuessing } from '@/lib/engine/error-detection';
import { getRandomMessage } from '@/lib/content/messages';

interface SoundSnapGameProps {
  items: SoundSnapItem[];
}

export function SoundSnapGame({ items }: SoundSnapGameProps) {
  const { progress, settings, recordAttempt, finishSession, markTutorialShown } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'tryagain' | 'scaffold'; message: string; sub?: string } | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [sessionAttempts, setSessionAttempts] = useState<ItemAttempt[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const maxHints = settings.extendedHintLadder ? 4 : 3;
  const currentItem = items[currentIndex];

  // Show tutorial on first play
  useEffect(() => {
    if (!progress.tutorialsShown.includes('sound_snap')) {
      setShowTutorial(true);
    }
    setStartTime(Date.now());
    setItemStartTime(Date.now());
  }, [progress.tutorialsShown]);

  const getHints = useCallback((item: SoundSnapItem): string[] => {
    const hints = [
      `Listen carefully — the sound is in the word "${item.word}".`,
      `The correct answer sounds like "${item.targetPronunciation}".`,
      `Look for the pattern "${item.target}" in "${item.word}".`,
    ];
    if (settings.extendedHintLadder) {
      hints.push(`The answer is "${item.target}" — it makes the "${item.targetPronunciation}" sound.`);
    }
    return hints;
  }, [settings.extendedHintLadder]);

  const buildChoices = useCallback((item: SoundSnapItem): string[] => {
    const all = item.mode === 'grapheme_to_sound'
      ? [item.targetPronunciation, ...item.distractorPronunciations]
      : [item.target, ...item.distractors];

    // Shuffle
    return [...all].sort(() => Math.random() - 0.5);
  }, []);

  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    if (currentItem) {
      setChoices(buildChoices(currentItem));
      setHintLevel(0);
      setFeedback(null);
      setSelected(null);
      setIsRevealing(false);
      setItemStartTime(Date.now());
    }
  }, [currentIndex, currentItem, buildChoices]);

  const handleSelect = (choice: string) => {
    if (isRevealing || feedback) return;

    setSelected(choice);
    const timeMs = Date.now() - itemStartTime;
    const correctAnswer = currentItem.mode === 'grapheme_to_sound'
      ? currentItem.targetPronunciation
      : currentItem.target;
    const isCorrect = choice === correctAnswer;

    const attempt: ItemAttempt = {
      itemId: currentItem.id,
      gameType: 'sound_snap',
      timestamp: Date.now(),
      correct: isCorrect,
      hintsUsed: hintLevel,
      timeMs,
    };

    // Check for guessing
    const isGuessing = detectGuessing(attempt, sessionAttempts);

    if (isCorrect) {
      const xp = 10 + (hintLevel === 0 ? 5 : 0);
      setSessionXP(prev => prev + xp);
      setFeedback({ type: 'correct', message: getRandomMessage('encouragement') });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);

      setIsRevealing(true);
      setTimeout(() => advanceItem(), 1500);
    } else if (isGuessing) {
      setFeedback({
        type: 'scaffold',
        message: "Let's slow down and work through this step by step.",
        sub: `Listen to the sound in "${currentItem.word}" and match it carefully.`,
      });
      setSessionAttempts(prev => [...prev, attempt]);
      setSessionXP(prev => prev + 2);
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);

      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 2500);
    } else {
      setFeedback({
        type: 'tryagain',
        message: "Not quite — try again.",
        sub: 'Use a hint if you need help.',
      });
      setSessionAttempts(prev => [...prev, attempt]);
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);

      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
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
      gamesPlayed: ['sound_snap'],
      totalItems: items.length,
      correctItems: correct,
      hintsUsed: totalHints,
      xpEarned: sessionXP,
      improvements: correct > items.length * 0.7 ? ['Sound-letter matching'] : [],
      nextFocus: correct < items.length * 0.6 ? ['More digraph and vowel team practice'] : ['New patterns'],
    };

    finishSession(summary);
    setSessionSummary(summary);
    setSessionComplete(true);
  };

  const handlePlaySound = () => {
    if (currentItem.mode === 'grapheme_to_sound') {
      speak(currentItem.targetPronunciation, { rate: 0.7 });
    } else {
      speak(currentItem.targetPronunciation, { rate: 0.7 });
    }
  };

  if (showTutorial) {
    return (
      <TutorialOverlay
        title="Sound Snap"
        steps={[
          'You\'ll see a letter pattern or hear a sound.',
          'Pick the matching sound or letter pattern from the choices.',
          'Use hints if you need them — no penalty for learning.',
          'Take your time. Accuracy matters more than speed.',
        ]}
        onDismiss={() => {
          setShowTutorial(false);
          markTutorialShown('sound_snap');
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
      title="Sound Snap"
      icon="🎵"
      currentItem={currentIndex}
      totalItems={items.length}
      xp={sessionXP}
    >
      {/* Prompt */}
      <div className="text-center mb-8">
        {currentItem.mode === 'grapheme_to_sound' ? (
          <>
            <p className="text-text-muted text-sm mb-3">What sound does this make?</p>
            <div className="text-5xl font-bold text-primary mb-2">{currentItem.target}</div>
            <p className="text-sm text-text-muted">as in &quot;{currentItem.word}&quot;</p>
          </>
        ) : (
          <>
            <p className="text-text-muted text-sm mb-3">Which letters make this sound?</p>
            <button
              onClick={handlePlaySound}
              className="text-5xl bg-primary-light/20 rounded-2xl p-6 mb-2 hover:bg-primary-light/30 transition-colors"
              aria-label={`Play sound: ${currentItem.targetPronunciation}`}
            >
              🔊
            </button>
            <p className="text-sm text-text-muted">Tap to hear the sound</p>
          </>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, i) => {
          const correctAnswer = currentItem.mode === 'grapheme_to_sound'
            ? currentItem.targetPronunciation
            : currentItem.target;
          const isCorrectChoice = choice === correctAnswer;
          const isSelected = selected === choice;

          let buttonStyle = 'bg-surface border-2 border-border hover:border-primary';
          if (isRevealing && isCorrectChoice) {
            buttonStyle = 'bg-success-light/30 border-2 border-success';
          } else if (isSelected && !isRevealing) {
            buttonStyle = isCorrectChoice
              ? 'bg-success-light/30 border-2 border-success'
              : 'bg-warning/10 border-2 border-warning';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(choice)}
              disabled={isRevealing}
              className={`${buttonStyle} rounded-xl p-4 text-lg font-medium text-left
                transition-colors game-tile`}
            >
              {currentItem.mode === 'grapheme_to_sound' ? (
                <span className="flex items-center gap-3">
                  <span
                    className="text-2xl cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(choice, { rate: 0.7 });
                    }}
                    role="button"
                    aria-label={`Play sound: ${choice}`}
                  >
                    🔊
                  </span>
                  <span>{choice}</span>
                </span>
              ) : (
                <span className="text-2xl font-bold">{choice}</span>
              )}
            </button>
          );
        })}
      </div>

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
