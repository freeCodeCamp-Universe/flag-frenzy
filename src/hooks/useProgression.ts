import { useEffect, useState } from 'react';

import { recordLevelCompletion } from '../engine/progression';
import type { GameLevel, GameProgress } from '../game/types';
import { loadProgress, saveProgress } from '../utils/progressStorage';

export function useProgression() {
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());

  useEffect(() => {
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
