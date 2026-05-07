import { describe, expect, it } from 'vitest';

import { createDefaultProgress } from '../engine/progression';
import { createMemoryStorage } from '../test/createMemoryStorage';
import {
  clearProgress,
  loadProgress,
  progressStorageKey,
  saveProgress,
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
});
