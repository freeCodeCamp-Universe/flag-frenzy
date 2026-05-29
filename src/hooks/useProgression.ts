import { useEffect, useState } from 'react';

import { createDefaultProgress, recordLevelCompletion } from '../engine/progression';
import type { GameLevel, GameProgress } from '../game/types';
import { loadProgress, saveProgress } from '../utils/progressStorage';

export function useProgression() {
  const [progress, setProgress] = useState<GameProgress>(() => createDefaultProgress());
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHasLoadedProgress(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) {
      return;
    }

    saveProgress(progress);
  }, [hasLoadedProgress, progress]);

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
