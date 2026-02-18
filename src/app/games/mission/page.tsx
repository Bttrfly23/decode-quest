'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { SoundSnapGame } from '@/components/games/SoundSnapGame';
import { BlendBuilderGame } from '@/components/games/BlendBuilderGame';
import { SyllableSprintGame } from '@/components/games/SyllableSprintGame';
import { MorphemeMatchGame } from '@/components/games/MorphemeMatchGame';
import { buildMission, selectItems } from '@/lib/engine/adaptive-selector';
import { allContent } from '@/lib/content/seed-data';
import {
  GameType,
  SoundSnapItem,
  BlendBuilderItem,
  SyllableSprintItem,
  MorphemeMatchItem,
  ContentItem,
} from '@/lib/content/types';
import { gameDisplayNames, gameIcons } from '@/lib/content/messages';

export default function MissionPage() {
  const { profile, progress, settings } = useApp();
  const [mission, setMission] = useState<GameType[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameItems, setGameItems] = useState<ContentItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const missionGames = buildMission(profile, progress, settings.sessionMinutes);
    setMission(missionGames);

    if (missionGames.length > 0) {
      loadGameItems(missionGames[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGameItems = (gameType: GameType) => {
    const difficulty = progress.gameProgress[gameType].currentDifficulty;
    const items = selectItems(
      allContent,
      gameType,
      difficulty,
      progress.skillMasteries,
      progress.recentAttempts,
      profile,
      5
    );
    setGameItems(items);
    setIsReady(true);
  };

  const handleGameComplete = () => {
    const nextIndex = currentGameIndex + 1;
    if (nextIndex < mission.length) {
      setCurrentGameIndex(nextIndex);
      setIsReady(false);
      loadGameItems(mission[nextIndex]);
    }
    // Session recap is handled by individual game components
  };

  if (!isReady || mission.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Preparing Mission...</div>
          <div className="text-text-muted">Selecting items for your session</div>
        </div>
      </div>
    );
  }

  const currentGame = mission[currentGameIndex];

  // Render the appropriate game component
  switch (currentGame) {
    case 'sound_snap':
      return <SoundSnapGame items={gameItems as SoundSnapItem[]} />;
    case 'blend_builder':
      return <BlendBuilderGame items={gameItems as BlendBuilderItem[]} />;
    case 'syllable_sprint':
      return <SyllableSprintGame items={gameItems as SyllableSprintItem[]} />;
    case 'morpheme_match':
      return <MorphemeMatchGame items={gameItems as MorphemeMatchItem[]} />;
    default:
      return null;
  }
}
