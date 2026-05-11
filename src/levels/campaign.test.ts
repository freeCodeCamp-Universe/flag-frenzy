import { describe, expect, it } from 'vitest';

import { validateLevel } from '../engine/matching';
import { campaignLevels } from './campaign';

function getLevelNumber(levelId: string): number {
  return Number(levelId.replace('level-', ''));
}

describe('campaign levels', () => {
  it('defines exactly thirty playable levels', () => {
    expect(campaignLevels).toHaveLength(30);
  });

  it('uses unique ids across levels, flags, and countries', () => {
    const levelIds = new Set(campaignLevels.map((level) => level.id));

    expect(levelIds.size).toBe(campaignLevels.length);

    for (const level of campaignLevels) {
      expect(new Set(level.flags.map((flag) => flag.id)).size).toBe(level.flags.length);
      expect(new Set(level.countries.map((country) => country.id)).size).toBe(
        level.countries.length,
      );
    }
  });

  it('keeps every level structurally valid', () => {
    for (const level of campaignLevels) {
      expect(validateLevel(level)).toEqual([]);
    }
  });

  it('scales flag counts by difficulty band', () => {
    for (const level of campaignLevels) {
      const levelNumber = getLevelNumber(level.id);
      const flagCount = level.flags.length;

      if (levelNumber <= 10) {
        expect(flagCount).toBeGreaterThanOrEqual(3);
        expect(flagCount).toBeLessThanOrEqual(5);
      } else if (levelNumber <= 20) {
        expect(flagCount).toBeGreaterThanOrEqual(5);
        expect(flagCount).toBeLessThanOrEqual(8);
      } else if (levelNumber <= 25) {
        expect(flagCount).toBeGreaterThanOrEqual(8);
        expect(flagCount).toBeLessThanOrEqual(10);
      } else {
        expect(flagCount).toBeGreaterThanOrEqual(10);
        expect(flagCount).toBeLessThanOrEqual(12);
      }
    }
  });

  it('matches countries, flags, options, and correct answers one-to-one', () => {
    for (const level of campaignLevels) {
      expect(level.optionCount).toBe(level.countries.length);
      expect(level.flags).toHaveLength(level.countries.length);
      expect(Object.keys(level.correctMatches)).toHaveLength(level.flags.length);
    }
  });
});
