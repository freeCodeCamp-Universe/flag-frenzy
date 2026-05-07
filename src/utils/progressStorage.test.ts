import { describe, expect, it } from 'vitest';

import { createDefaultProgress } from '../engine/progression';
import { clearProgress, loadProgress, saveProgress } from './progressStorage';

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

    storage.setItem('flag-frenzy:progress:v1', '{bad');

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

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}
