import type { GameProgress } from '../game/types';
import { createDefaultProgress, sanitizeProgress } from '../engine/progression';

export const progressStorageKey = 'flag-frenzy:progress:v1';

export function loadProgress(storage: Storage = window.localStorage): GameProgress {
  const rawProgress = storage.getItem(progressStorageKey);

  if (rawProgress === null) {
    return createDefaultProgress();
  }

  try {
    return sanitizeProgress(JSON.parse(rawProgress));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(
  progress: GameProgress,
  storage: Storage = window.localStorage,
): void {
  storage.setItem(progressStorageKey, JSON.stringify(sanitizeProgress(progress)));
}

export function clearProgress(storage: Storage = window.localStorage): void {
  storage.removeItem(progressStorageKey);
}
