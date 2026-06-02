import { describe, expect, it } from 'vitest';

import { createDefaultProgress } from '../engine/progression';
import { createMemoryStorage } from '../test/createMemoryStorage';
import {
  clearSavedProgress,
  clearProgress,
  loadProgress,
  progressStorageKey,
  saveProgress,
  tutorialStorageKey,
} from './progressStorage';

describe('progress storage', () => {
  it('loads default progress when storage is empty', () => {
    expect(loadProgress(createMemoryStorage())).toEqual(createDefaultProgress());
  });

  it('saves and loads progress', () => {
    const storage = createMemoryStorage();
    const progress = {
      completedLevelIds: ['level-01'],
      highScores: {
        'level-01': 625,
      },
      highestUnlockedLevel: 2,
      version: 1 as const,
    };

    saveProgress(progress, storage);

    expect(loadProgress(storage)).toEqual(progress);
  });

  it('falls back to default progress for malformed JSON', () => {
    const storage = createMemoryStorage();

    storage.setItem(progressStorageKey, '{bad');

    expect(loadProgress(storage)).toEqual(createDefaultProgress());
  });

  it('clears persisted progress', () => {
    const storage = createMemoryStorage();

    saveProgress(
      {
        completedLevelIds: ['level-01'],
        highScores: {
          'level-01': 625,
        },
        highestUnlockedLevel: 2,
        version: 1,
      },
      storage,
    );
    clearProgress(storage);

    expect(loadProgress(storage)).toEqual(createDefaultProgress());
  });

  it('clears only Flag Frenzy storage keys for a full progress reset', () => {
    const storage = createMemoryStorage();

    saveProgress(
      {
        completedLevelIds: ['level-01'],
        highScores: {
          'level-01': 625,
        },
        highestUnlockedLevel: 2,
        version: 1,
      },
      storage,
    );
    storage.setItem(tutorialStorageKey, 'true');
    storage.setItem('flag-frenzy:future-setting:v1', 'enabled');
    storage.setItem('unrelated-app:progress:v1', 'keep-me');

    clearSavedProgress(storage);

    expect(storage.getItem(progressStorageKey)).toBeNull();
    expect(storage.getItem(tutorialStorageKey)).toBeNull();
    expect(storage.getItem('flag-frenzy:future-setting:v1')).toBeNull();
    expect(storage.getItem('unrelated-app:progress:v1')).toBe('keep-me');
    expect(loadProgress(storage)).toEqual(createDefaultProgress());
  });
});
