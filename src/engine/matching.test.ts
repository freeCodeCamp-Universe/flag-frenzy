import { describe, expect, it } from 'vitest';

import { beginnerLevel } from '../levels/beginner';
import { isCorrectMatch, validateLevel, validateMatches } from './matching';

describe('matching engine', () => {
  it('validates a well-formed level', () => {
    expect(validateLevel(beginnerLevel)).toEqual([]);
  });

  it('checks individual flag-to-country matches', () => {
    expect(isCorrectMatch(beginnerLevel, 'flag-canada', 'country-canada')).toBe(true);
    expect(isCorrectMatch(beginnerLevel, 'flag-canada', 'country-japan')).toBe(false);
  });

  it('scores a complete player submission', () => {
    const result = validateMatches(beginnerLevel, {
      'flag-brazil': 'country-brazil',
      'flag-canada': 'country-canada',
      'flag-france': 'country-france',
      'flag-japan': 'country-japan',
    });

    expect(result.correctCount).toBe(4);
    expect(result.incorrectCount).toBe(0);
    expect(result.isComplete).toBe(true);
    expect(result.isPerfect).toBe(true);
  });

  it('reports incorrect and missing matches', () => {
    const result = validateMatches(beginnerLevel, {
      'flag-brazil': 'country-france',
      'flag-canada': 'country-canada',
    });

    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(3);
    expect(result.isComplete).toBe(false);
    expect(result.isPerfect).toBe(false);
    expect(result.missingFlagIds).toEqual(['flag-japan', 'flag-france']);
  });

  it('reports malformed level references', () => {
    const invalidLevel = {
      ...beginnerLevel,
      correctMatches: {
        ...beginnerLevel.correctMatches,
        'flag-missing': 'country-missing',
      },
    };

    expect(validateLevel(invalidLevel)).toContain(
      'Correct match references unknown flag "flag-missing".',
    );
    expect(validateLevel(invalidLevel)).toContain(
      'Correct match for "flag-missing" references an unknown country.',
    );
  });
});
