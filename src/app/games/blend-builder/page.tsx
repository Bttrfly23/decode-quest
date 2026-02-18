'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { BlendBuilderGame } from '@/components/games/BlendBuilderGame';
import { selectItems } from '@/lib/engine/adaptive-selector';
import { allContent } from '@/lib/content/seed-data';
import { BlendBuilderItem } from '@/lib/content/types';

export default function BlendBuilderPage() {
  const { profile, progress } = useApp();
  const [items, setItems] = useState<BlendBuilderItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const difficulty = progress.gameProgress.blend_builder.currentDifficulty;
    const selected = selectItems(
      allContent,
      'blend_builder',
      difficulty,
      progress.skillMasteries,
      progress.recentAttempts,
      profile,
      5
    ) as BlendBuilderItem[];
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

  return <BlendBuilderGame items={items} />;
}
