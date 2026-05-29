import { describe, expect, it } from 'vitest';

import { validateLevel } from '../engine/matching';
import { campaignLevels } from './campaign';
import { flagDescriptions } from './flagDescriptions';

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

      if (levelNumber <= 25) {
        expect(flagCount).toBeGreaterThanOrEqual(8);
        expect(flagCount).toBeLessThanOrEqual(10);
      } else {
        expect(flagCount).toBeGreaterThanOrEqual(10);
        expect(flagCount).toBeLessThanOrEqual(12);
      }
    }
  });

  it('gives level one a replayable source pool', () => {
    expect(campaignLevels[0]?.flags.length).toBeGreaterThan(4);
  });

  it('matches countries, flags, options, and correct answers one-to-one', () => {
    for (const level of campaignLevels) {
      expect(level.optionCount).toBe(level.countries.length);
      expect(level.flags).toHaveLength(level.countries.length);
      expect(Object.keys(level.correctMatches)).toHaveLength(level.flags.length);
    }
  });

  it('uses descriptive flag alt text that does not reveal answers', () => {
    const countryNamesById = new Map(
      campaignLevels.flatMap((level) =>
        level.countries.map((country) => [country.id, country.name]),
      ),
    );

    for (const level of campaignLevels) {
      for (const flag of level.flags) {
        const countryName = countryNamesById.get(level.correctMatches[flag.id] ?? '');

        if (countryName === undefined) {
          throw new Error(`Missing country for flag "${flag.id}".`);
        }

        expect(flag.alt).not.toMatch(/^Flag of /);
        expect(flag.alt.length).toBeGreaterThan(30);
        expect(flag.alt.toLowerCase()).not.toContain(countryName.toLowerCase());
      }
    }
  });

  it('keeps descriptions for every campaign flag slug', () => {
    const flagSlugs = new Set(
      campaignLevels.flatMap((level) =>
        level.flags.map((flag) => flag.id.replace('flag-', '')),
      ),
    );

    for (const slug of flagSlugs) {
      expect(flagDescriptions[slug]).toBeTruthy();
    }
  });
});
