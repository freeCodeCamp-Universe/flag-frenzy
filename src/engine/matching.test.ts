import { describe, expect, it } from 'vitest';

import { beginnerLevel } from '../levels/beginner';
import {
  applyMatchAttempt,
  createMatchAttempt,
  getMatchFeedback,
  isCorrectMatch,
  isMatchLocked,
  validateLevel,
  validateMatches,
} from './matching';

describe('matching engine', () => {
  it('validates a well-formed level', () => {
    expect(validateLevel(beginnerLevel)).toEqual([]);
  });

  it('checks individual flag-to-country matches', () => {
    expect(isCorrectMatch(beginnerLevel, 'flag-canada', 'country-canada')).toBe(true);
    expect(isCorrectMatch(beginnerLevel, 'flag-canada', 'country-japan')).toBe(false);
  });

  it('creates reusable match attempts', () => {
    expect(
      createMatchAttempt(beginnerLevel, 'flag-canada', 'country-canada'),
    ).toMatchObject({
      correctCountryId: 'country-canada',
      feedback: 'correct',
      flagId: 'flag-canada',
      selectedCountryId: 'country-canada',
    });

    expect(
      createMatchAttempt(beginnerLevel, 'flag-canada', 'country-japan'),
    ).toMatchObject({
      correctCountryId: 'country-canada',
      feedback: 'incorrect',
      flagId: 'flag-canada',
      selectedCountryId: 'country-japan',
    });
  });

  it('applies attempts without mutating previous player matches', () => {
    const currentMatches = {
      'flag-japan': 'country-japan',
    };
    const attempt = createMatchAttempt(beginnerLevel, 'flag-canada', 'country-canada');

    expect(applyMatchAttempt(currentMatches, attempt)).toEqual({
      'flag-canada': 'country-canada',
      'flag-japan': 'country-japan',
    });
    expect(currentMatches).toEqual({
      'flag-japan': 'country-japan',
    });
  });

  it('does not lock incorrect attempts into player matches', () => {
    const currentMatches = {
      'flag-japan': 'country-japan',
    };
    const attempt = createMatchAttempt(beginnerLevel, 'flag-canada', 'country-japan');

    expect(applyMatchAttempt(currentMatches, attempt)).toEqual({
      'flag-japan': 'country-japan',
    });
    expect(isMatchLocked(beginnerLevel, currentMatches, 'flag-canada')).toBe(false);
  });

  it('identifies locked correct matches', () => {
    expect(
      isMatchLocked(beginnerLevel, { 'flag-canada': 'country-canada' }, 'flag-canada'),
    ).toBe(true);
  });

  it('derives feedback for pending, correct, and incorrect matches', () => {
    expect(getMatchFeedback(beginnerLevel, {}, 'flag-canada')).toBe('pending');
    expect(
      getMatchFeedback(
        beginnerLevel,
        { 'flag-canada': 'country-canada' },
        'flag-canada',
      ),
    ).toBe('correct');
    expect(
      getMatchFeedback(
        beginnerLevel,
        { 'flag-canada': 'country-japan' },
        'flag-canada',
      ),
    ).toBe('incorrect');
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

  it('reports duplicate ids and mismatched option counts', () => {
    const firstCountry = beginnerLevel.countries[0];
    const firstFlag = beginnerLevel.flags[0];

    if (firstCountry === undefined || firstFlag === undefined) {
      throw new Error('Expected beginner level fixtures.');
    }

    const invalidLevel = {
      ...beginnerLevel,
      countries: [
        ...beginnerLevel.countries,
        {
          ...firstCountry,
        },
      ],
      flags: [
        ...beginnerLevel.flags,
        {
          ...firstFlag,
        },
      ],
    };

    expect(validateLevel(invalidLevel)).toEqual(
      expect.arrayContaining([
        'Duplicate country id "country-canada".',
        'Duplicate flag id "flag-canada".',
        'Option count must match the number of countries.',
      ]),
    );
  });
});
