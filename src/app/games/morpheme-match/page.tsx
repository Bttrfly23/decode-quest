'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { MorphemeMatchGame } from '@/components/games/MorphemeMatchGame';
import { selectItems } from '@/lib/engine/adaptive-selector';
import { allContent } from '@/lib/content/seed-data';
import { MorphemeMatchItem } from '@/lib/content/types';

export default function MorphemeMatchPage() {
  const { profile, progress } = useApp();
  const [items, setItems] = useState<MorphemeMatchItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const difficulty = progress.gameProgress.morpheme_match.currentDifficulty;
    const selected = selectItems(
      allContent,
      'morpheme_match',
      difficulty,
      progress.skillMasteries,
      progress.recentAttempts,
      profile,
      5
    ) as MorphemeMatchItem[];
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

  return <MorphemeMatchGame items={items} />;
}
