import { describe, expect, it } from 'vitest';

import { validateMatches } from './matching';
import {
  calculateLevelScore,
  calculateSpeedBonus,
  getIncorrectAttemptCount,
} from './scoring';
import { campaignLevels } from '../levels/campaign';

describe('scoring engine', () => {
  it('awards correctness and speed bonuses', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    const validation = validateMatches(level, level.correctMatches);

    expect(
      calculateLevelScore({
        elapsedSeconds: 20,
        incorrectAttempts: 0,
        level,
        validation,
      }),
    ).toEqual({
      baseScore: 400,
      incorrectPenalty: 0,
      speedBonus: 125,
      totalScore: 525,
    });
  });

  it('does not award speed bonuses before a perfect level', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    const validation = validateMatches(level, {
      'flag-canada': 'country-canada',
    });
    const score = calculateLevelScore({
      elapsedSeconds: 5,
      incorrectAttempts: 0,
      level,
      validation,
    });

    expect(score).toMatchObject({
      baseScore: 100,
      speedBonus: 0,
      totalScore: 100,
    });
  });

  it('applies incorrect attempt penalties without dropping below zero', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    const validation = validateMatches(level, {});
    const score = calculateLevelScore({
      elapsedSeconds: 40,
      incorrectAttempts: 20,
      level,
      validation,
    });

    expect(score.incorrectPenalty).toBe(0);
    expect(score.totalScore).toBe(0);
  });

  it('calculates speed bonuses across every campaign level', () => {
    for (const level of campaignLevels) {
      expect(calculateSpeedBonus(level, 10)).toBeGreaterThanOrEqual(0);
      expect(
        calculateLevelScore({
          elapsedSeconds: 10,
          incorrectAttempts: 0,
          level,
          validation: validateMatches(level, level.correctMatches),
        }).totalScore,
      ).toBeGreaterThan(0);
    }
  });

  it('counts incorrect attempts from interaction state', () => {
    expect(
      getIncorrectAttemptCount({
        'flag-brazil': {
          feedback: 'incorrect',
        },
        'flag-canada': {
          feedback: 'correct',
        },
      }),
    ).toBe(1);
  });

  it('normalizes invalid scoring inputs', () => {
    const level = campaignLevels[0];

    if (level === undefined) {
      throw new Error('Expected level 1.');
    }

    const validation = validateMatches(level, level.correctMatches);
    const score = calculateLevelScore({
      elapsedSeconds: Number.NaN,
      incorrectAttempts: -10,
      level,
      validation,
    });

    expect(score.incorrectPenalty).toBe(0);
    expect(score.speedBonus).toBe(225);
  });
});
