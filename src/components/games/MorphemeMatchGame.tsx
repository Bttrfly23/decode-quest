'use client';

import { useState, useEffect, useCallback } from 'react';
import { MorphemeMatchItem, ItemAttempt, SessionSummary } from '@/lib/content/types';
import { useApp } from '../AppProvider';
import { GameShell } from '../ui/GameShell';
import { HintLadder } from '../ui/HintLadder';
import { FeedbackDisplay } from '../ui/FeedbackDisplay';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SessionRecap } from '../ui/SessionRecap';
import { speak } from '@/lib/audio';
import { getRandomMessage } from '@/lib/content/messages';

interface MorphemeMatchGameProps {
  items: MorphemeMatchItem[];
}

type Phase = 'build' | 'meaning';

export function MorphemeMatchGame({ items }: MorphemeMatchGameProps) {
  const { progress, settings, recordAttempt, finishSession, markTutorialShown } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('build');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'tryagain' | 'scaffold'; message: string; sub?: string } | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [startTime] = useState(Date.now());
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [sessionAttempts, setSessionAttempts] = useState<ItemAttempt[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [buildCorrect, setBuildCorrect] = useState(false);
  const [meaningChoices, setMeaningChoices] = useState<string[]>([]);

  const maxHints = settings.extendedHintLadder ? 4 : 3;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!progress.tutorialsShown.includes('morpheme_match')) {
      setShowTutorial(true);
    }
  }, [progress.tutorialsShown]);

  useEffect(() => {
    if (currentItem) {
      setPhase('build');
      setSelectedParts([]);
      setHintLevel(0);
      setFeedback(null);
      setBuildCorrect(false);
      setItemStartTime(Date.now());
      // Shuffle meaning choices
      setMeaningChoices(
        [currentItem.meaning, ...currentItem.meaningDistractors].sort(() => Math.random() - 0.5)
      );
    }
  }, [currentIndex, currentItem]);

  const getHints = useCallback((item: MorphemeMatchItem): string[] => {
    const firstMorpheme = item.morphemes[0];
    const firstMeaning = item.morphemeMeanings[firstMorpheme] || '';
    const hints = [
      `"${firstMorpheme}" means "${firstMeaning}". Start with that.`,
      `Try combining: ${item.morphemes.join(' + ')}`,
      `The word is "${item.targetWord}".`,
    ];
    if (settings.extendedHintLadder) {
      const meanings = item.morphemes.map(m => `"${m}" = ${item.morphemeMeanings[m] || m}`);
      hints.push(`Parts: ${meanings.join(', ')}`);
    }
    return hints;
  }, [settings.extendedHintLadder]);

  const shuffledMorphemes = useCallback((item: MorphemeMatchItem): string[] => {
    return [...item.morphemes].sort(() => Math.random() - 0.5);
  }, []);

  const [tiles, setTiles] = useState<string[]>([]);

  useEffect(() => {
    if (currentItem) {
      setTiles(shuffledMorphemes(currentItem));
    }
  }, [currentIndex, currentItem, shuffledMorphemes]);

  const handleMorphemeSelect = (morpheme: string) => {
    if (feedback) return;
    setSelectedParts(prev => [...prev, morpheme]);
    speak(morpheme, { rate: 0.8 });
  };

  const handleRemoveLast = () => {
    if (feedback) return;
    setSelectedParts(prev => prev.slice(0, -1));
  };

  const handleCheckBuild = () => {
    if (feedback) return;
    const builtWord = selectedParts.join('');
    const isCorrect = builtWord === currentItem.targetWord;

    if (isCorrect) {
      setBuildCorrect(true);
      setFeedback({ type: 'correct', message: `"${currentItem.targetWord}" — now pick the meaning.` });
      speak(currentItem.targetWord, { rate: 0.8 });
      setTimeout(() => {
        setFeedback(null);
        setPhase('meaning');
      }, 1500);
    } else {
      setFeedback({
        type: 'tryagain',
        message: 'Not quite — try a different order.',
        sub: 'Use a hint to learn what each part means.',
      });
      setTimeout(() => {
        setFeedback(null);
        setSelectedParts([]);
      }, 2000);
    }
  };

  const handleSelectMeaning = (meaning: string) => {
    if (feedback) return;

    const timeMs = Date.now() - itemStartTime;
    const isCorrect = meaning === currentItem.meaning;

    const attempt: ItemAttempt = {
      itemId: currentItem.id,
      gameType: 'morpheme_match',
      timestamp: Date.now(),
      correct: isCorrect && buildCorrect,
      hintsUsed: hintLevel,
      timeMs,
    };

    if (isCorrect) {
      const xp = 15 + (hintLevel === 0 ? 5 : 0);
      setSessionXP(prev => prev + xp);
      setFeedback({ type: 'correct', message: getRandomMessage('encouragement') });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);

      setTimeout(() => advanceItem(), 1500);
    } else {
      setFeedback({
        type: 'tryagain',
        message: 'Not that meaning — try again.',
        sub: 'Think about what each word part means.',
      });
      recordAttempt(attempt, currentItem.skill, currentItem.pattern);
      setSessionAttempts(prev => [...prev, attempt]);
      setSessionXP(prev => prev + 2);

      setTimeout(() => setFeedback(null), 2000);
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
      gamesPlayed: ['morpheme_match'],
      totalItems: items.length,
      correctItems: correct,
      hintsUsed: totalHints,
      xpEarned: sessionXP,
      improvements: correct > items.length * 0.7 ? ['Morpheme awareness'] : [],
      nextFocus: correct < items.length * 0.6
        ? ['More prefix and suffix practice']
        : ['Greek and Latin roots'],
    };

    finishSession(summary);
    setSessionSummary(summary);
    setSessionComplete(true);
  };

  if (showTutorial) {
    return (
      <TutorialOverlay
        title="Morpheme Match"
        steps={[
          'You\'ll see word parts (morphemes) like prefixes, roots, and suffixes.',
          'Tap them in order to build a real word.',
          'Then pick the correct meaning from three choices.',
          'Hints will explain what each part means.',
        ]}
        onDismiss={() => {
          setShowTutorial(false);
          markTutorialShown('morpheme_match');
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
      title="Morpheme Match"
      icon="🧩"
      currentItem={currentIndex}
      totalItems={items.length}
      xp={sessionXP}
    >
      <div className="text-center mb-6">
        <p className="text-text-muted text-sm">
          {phase === 'build'
            ? 'Tap word parts to build a real word'
            : 'What does this word mean?'}
        </p>
      </div>

      {phase === 'build' && (
        <>
          {/* Build area */}
          <div className="bg-surface border-2 border-border rounded-xl p-4 mb-6 min-h-[4rem]">
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {selectedParts.length === 0 ? (
                <span className="text-text-muted text-sm">Tap parts below to build the word</span>
              ) : (
                selectedParts.map((part, i) => (
                  <span
                    key={i}
                    className="bg-accent text-white px-4 py-2 rounded-lg text-lg font-bold"
                  >
                    {part}
                  </span>
                ))
              )}
            </div>
            {selectedParts.length > 0 && (
              <button
                onClick={handleRemoveLast}
                className="mt-2 text-sm text-text-muted hover:text-foreground"
              >
                ← Remove last
              </button>
            )}
          </div>

          {/* Morpheme tiles */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {tiles.map((morpheme, i) => (
              <button
                key={`${morpheme}-${i}`}
                onClick={() => handleMorphemeSelect(morpheme)}
                className="bg-surface border-2 border-border rounded-xl px-5 py-3
                  text-lg font-bold hover:border-accent transition-colors game-tile"
              >
                {morpheme}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckBuild}
            disabled={selectedParts.length === 0}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg
              hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Word
          </button>
        </>
      )}

      {phase === 'meaning' && (
        <div className="space-y-3">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-accent">{currentItem.targetWord}</span>
          </div>
          {meaningChoices.map((meaning, i) => (
            <button
              key={i}
              onClick={() => handleSelectMeaning(meaning)}
              className="w-full p-4 rounded-xl text-left text-lg
                bg-surface border-2 border-border hover:border-accent transition-colors game-tile"
            >
              {meaning}
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
