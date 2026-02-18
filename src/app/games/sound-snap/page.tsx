'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { SoundSnapGame } from '@/components/games/SoundSnapGame';
import { selectItems } from '@/lib/engine/adaptive-selector';
import { allContent } from '@/lib/content/seed-data';
import { SoundSnapItem } from '@/lib/content/types';

export default function SoundSnapPage() {
  const { profile, progress } = useApp();
  const [items, setItems] = useState<SoundSnapItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const difficulty = progress.gameProgress.sound_snap.currentDifficulty;
    const selected = selectItems(
      allContent,
      'sound_snap',
      difficulty,
      progress.skillMasteries,
      progress.recentAttempts,
      profile,
      5
    ) as SoundSnapItem[];
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

  return <SoundSnapGame items={items} />;
}
