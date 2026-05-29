import { useEffect, useState } from 'react';

import { createDefaultProgress, recordLevelCompletion } from '../engine/progression';
import type { GameLevel, GameProgress } from '../game/types';
import { loadProgress, saveProgress } from '../utils/progressStorage';

export function useProgression() {
  const [progress, setProgress] = useState<GameProgress>(() => {
    if (typeof window === 'undefined') {
      return createDefaultProgress();
    }

    return loadProgress();
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    saveProgress(progress);
  }, [progress]);

  function completeLevel(level: GameLevel, levelNumber: number, score: number) {
    setProgress((currentProgress) =>
      recordLevelCompletion({
        level,
        levelNumber,
        progress: currentProgress,
        score,
      }),
    );
  }

  return {
    completeLevel,
    progress,
  };
}
