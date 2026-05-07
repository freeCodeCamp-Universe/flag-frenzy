import { describe, expect, it } from 'vitest';

import {
  createDefaultProgress,
  recordLevelCompletion,
  sanitizeProgress,
} from './progression';
import { campaignLevels } from '../levels/campaign';

describe('progression engine', () => {
  it('starts with level one unlocked', () => {
    expect(createDefaultProgress()).toEqual({
      completedLevelIds: [],
      highScores: {},
      highestUnlockedLevel: 1,
      version: 1,
    });
  });

  it('records completion, unlocks the next level, and stores high score', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    expect(
      recordLevelCompletion({
        level,
        levelNumber: 1,
        progress: createDefaultProgress(),
        score: 625,
      }),
    ).toEqual({
      completedLevelIds: ['level-01'],
      highScores: {
        'level-01': 625,
      },
      highestUnlockedLevel: 2,
      version: 1,
    });
  });

  it('keeps the best score for a level', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    const progress = recordLevelCompletion({
      level,
      levelNumber: 1,
      progress: createDefaultProgress(),
      score: 625,
    });

    expect(
      recordLevelCompletion({
        level,
        levelNumber: 1,
        progress,
        score: 400,
      }).highScores['level-01'],
    ).toBe(625);
  });

  it('normalizes invalid scores and caps the final unlock', () => {
    const level = campaignLevels[29];

    if (level === undefined) {
      throw new Error('Expected level 30.');
    }

    expect(
      recordLevelCompletion({
        level,
        levelNumber: 30,
        progress: createDefaultProgress(),
        score: Number.NaN,
      }),
    ).toEqual({
      completedLevelIds: ['level-30'],
      highScores: {
        'level-30': 0,
      },
      highestUnlockedLevel: 30,
      version: 1,
    });
  });

  it('falls back when high scores are null', () => {
    expect(
      sanitizeProgress({
        completedLevelIds: [],
        highScores: null,
        highestUnlockedLevel: 2,
        version: 1,
      }),
    ).toEqual(createDefaultProgress());
  });

  it('sanitizes invalid persisted data', () => {
    expect(sanitizeProgress({ nope: true })).toEqual(createDefaultProgress());
    expect(
      sanitizeProgress({
        completedLevelIds: ['level-01', 'level-01', ''],
        highScores: {
          'level-01': 100,
          'level-02': Number.NaN,
        },
        highestUnlockedLevel: 99,
        version: 1,
      }),
    ).toEqual({
      completedLevelIds: ['level-01'],
      highScores: {
        'level-01': 100,
      },
      highestUnlockedLevel: 30,
      version: 1,
    });
  });
});
