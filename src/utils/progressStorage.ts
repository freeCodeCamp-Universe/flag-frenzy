import type { GameProgress } from '../game/types';
import { createDefaultProgress, sanitizeProgress } from '../engine/progression';

export const progressStorageKey = 'flag-frenzy:progress:v1';
export const tutorialStorageKey = 'flag-frenzy:tutorial-complete:v1';
const flagFrenzyStorageKeyPrefix = 'flag-frenzy:';

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

export function clearSavedProgress(storage: Storage = window.localStorage): void {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (key?.startsWith(flagFrenzyStorageKeyPrefix)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}
