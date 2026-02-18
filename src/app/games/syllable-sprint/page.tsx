'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { SyllableSprintGame } from '@/components/games/SyllableSprintGame';
import { selectItems } from '@/lib/engine/adaptive-selector';
import { allContent } from '@/lib/content/seed-data';
import { SyllableSprintItem } from '@/lib/content/types';

export default function SyllableSprintPage() {
  const { profile, progress } = useApp();
  const [items, setItems] = useState<SyllableSprintItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const difficulty = progress.gameProgress.syllable_sprint.currentDifficulty;
    const selected = selectItems(
      allContent,
      'syllable_sprint',
      difficulty,
      progress.skillMasteries,
      progress.recentAttempts,
      profile,
      5
    ) as SyllableSprintItem[];
    setItems(selected);
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return <SyllableSprintGame items={items} />;
}
