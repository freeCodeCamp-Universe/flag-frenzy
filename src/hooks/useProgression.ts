import { useEffect, useRef, useState } from 'react';

import { createDefaultProgress, recordLevelCompletion } from '../engine/progression';
import type { GameLevel, GameProgress } from '../game/types';
import {
  clearSavedProgress,
  loadProgress,
  saveProgress,
} from '../utils/progressStorage';

export function useProgression() {
  const [progress, setProgress] = useState<GameProgress>(() => createDefaultProgress());
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const shouldSkipNextSaveRef = useRef(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHasLoadedProgress(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) {
      return;
    }

    if (shouldSkipNextSaveRef.current) {
      shouldSkipNextSaveRef.current = false;
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

  function resetProgress() {
    clearSavedProgress();
    shouldSkipNextSaveRef.current = true;
    setProgress(createDefaultProgress());
  }

  return {
    completeLevel,
    progress,
    resetProgress,
  };
}
