'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  LearnerProfile,
  ProgressData,
  AppSettings,
  GameType,
  ItemAttempt,
  SkillMastery,
  SessionSummary,
  Badge,
} from '@/lib/content/types';
import {
  loadProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  createDefaultSettings,
  loadLearnerProfile,
  addAttempt,
  upsertSkillMastery,
  addSessionSummary,
  addBadge,
  resetProgress as resetStoredProgress,
} from '@/lib/storage';
import {
  scoreAttempt,
  updateSkillMastery,
  calculateXP,
  updateGameProgress,
} from '@/lib/engine';

interface AppContextType {
  profile: LearnerProfile | null;
  progress: ProgressData;
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  recordAttempt: (attempt: ItemAttempt, skill: string, pattern: string) => void;
  finishSession: (summary: SessionSummary) => void;
  earnBadge: (badge: Badge) => void;
  markTutorialShown: (gameType: GameType) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile + stored data on mount
  useEffect(() => {
    async function init() {
      const loadedProfile = await loadLearnerProfile();
      setProfile(loadedProfile);

      const storedProgress = loadProgress();
      setProgress(storedProgress);

      const storedSettings = loadSettings();
      // Apply profile defaults on first load only
      if (!storedSettings.profileLoaded && loadedProfile) {
        const profileSettings = createDefaultSettings(loadedProfile);
        setSettings(profileSettings);
        saveSettings(profileSettings);
      } else {
        setSettings(storedSettings);
      }

      setIsLoading(false);
    }
    init();
  }, []);

  // Apply settings to body element
  useEffect(() => {
    if (!settings) return;
    const body = document.body;

    // Font family
    body.classList.remove('font-opendyslexic', 'font-system');
    if (settings.fontFamily === 'opendyslexic') body.classList.add('font-opendyslexic');
    if (settings.fontFamily === 'system') body.classList.add('font-system');

    // Font size
    body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
    body.classList.add(`font-size-${settings.fontSize}`);

    // Spacing
    body.classList.remove('spacing-normal', 'spacing-wide', 'spacing-wider');
    body.classList.add(`spacing-${settings.letterSpacing}`);

    // Line height
    body.classList.remove('line-normal', 'line-relaxed', 'line-loose');
    body.classList.add(`line-${settings.lineHeight}`);

    // High contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  const updateSettingsHandler = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const recordAttemptHandler = useCallback((attempt: ItemAttempt, skill: string, pattern: string) => {
    setProgress(prev => {
      if (!prev) return prev;

      const attemptScore = scoreAttempt(attempt, profile);
      const xp = calculateXP(attempt, prev.gameProgress[attempt.gameType].currentDifficulty, attemptScore);

      // Update skill mastery
      const existingMastery = prev.skillMasteries.find(m => m.skill === skill && m.pattern === pattern) ?? null;
      const newMastery = updateSkillMastery(existingMastery, attempt, attemptScore);

      // Update game progress
      const updatedGameProgress = updateGameProgress(
        prev.gameProgress[attempt.gameType],
        attempt,
        [...prev.recentAttempts, attempt]
      );

      let updated = addAttempt(prev, attempt);
      updated = upsertSkillMastery(updated, skill, pattern, newMastery);
      updated = {
        ...updated,
        totalXP: updated.totalXP + xp,
        gameProgress: {
          ...updated.gameProgress,
          [attempt.gameType]: updatedGameProgress,
        },
      };

      saveProgress(updated);
      return updated;
    });
  }, [profile]);

  const finishSessionHandler = useCallback((summary: SessionSummary) => {
    setProgress(prev => {
      if (!prev) return prev;
      const updated = addSessionSummary(prev, summary);
      saveProgress(updated);
      return updated;
    });
  }, []);

  const earnBadgeHandler = useCallback((badge: Badge) => {
    setProgress(prev => {
      if (!prev) return prev;
      const updated = addBadge(prev, badge);
      saveProgress(updated);
      return updated;
    });
  }, []);

  const markTutorialShown = useCallback((gameType: GameType) => {
    setProgress(prev => {
      if (!prev) return prev;
      if (prev.tutorialsShown.includes(gameType)) return prev;
      const updated = { ...prev, tutorialsShown: [...prev.tutorialsShown, gameType] };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const resetProgressHandler = useCallback(() => {
    resetStoredProgress();
    const fresh = loadProgress();
    setProgress(fresh);
  }, []);

  if (isLoading || !progress || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">DecodeQuest</div>
          <div className="text-text-muted">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        progress,
        settings,
        isLoading,
        updateSettings: updateSettingsHandler,
        recordAttempt: recordAttemptHandler,
        finishSession: finishSessionHandler,
        earnBadge: earnBadgeHandler,
        markTutorialShown,
        resetProgress: resetProgressHandler,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
