import type {
  GameLevel,
  MatchResult,
  MatchValidationResult,
  PlayerMatches,
} from '../game/types';

export function validateLevel(level: GameLevel): string[] {
  const errors: string[] = [];
  const flagIds = new Set(level.flags.map((flag) => flag.id));
  const countryIds = new Set(level.countries.map((country) => country.id));
  const expectedFlagIds = Object.keys(level.correctMatches);

  if (level.flags.length === 0) {
    errors.push('Level must include at least one flag.');
  }

  if (level.countries.length === 0) {
    errors.push('Level must include at least one country.');
  }

  if (level.optionCount < level.flags.length) {
    errors.push('Option count cannot be lower than the number of flags.');
  }

  for (const flagId of expectedFlagIds) {
    const countryId = level.correctMatches[flagId];

    if (!flagIds.has(flagId)) {
      errors.push(`Correct match references unknown flag "${flagId}".`);
    }

    if (countryId === undefined || !countryIds.has(countryId)) {
      errors.push(`Correct match for "${flagId}" references an unknown country.`);
    }
  }

  for (const flagId of flagIds) {
    if (level.correctMatches[flagId] === undefined) {
      errors.push(`Flag "${flagId}" is missing a correct match.`);
    }
  }

  return errors;
}

export function validateMatches(
  level: GameLevel,
  playerMatches: PlayerMatches,
): MatchValidationResult {
  const results = level.flags.map<MatchResult>((flag) => {
    const selectedCountryId = playerMatches[flag.id];
    const correctCountryId = level.correctMatches[flag.id];

    if (correctCountryId === undefined) {
      throw new Error(`Level "${level.id}" is missing a match for "${flag.id}".`);
    }

    return {
      correctCountryId,
      flagId: flag.id,
      isCorrect: selectedCountryId === correctCountryId,
      selectedCountryId,
    };
  });

  const correctCount = results.filter((result) => result.isCorrect).length;
  const missingFlagIds = results
    .filter((result) => result.selectedCountryId === undefined)
    .map((result) => result.flagId);
  const totalCount = results.length;

  return {
    correctCount,
    incorrectCount: totalCount - correctCount,
    isComplete: missingFlagIds.length === 0,
    isPerfect: correctCount === totalCount && missingFlagIds.length === 0,
    missingFlagIds,
    results,
    totalCount,
  };
}

export function isCorrectMatch(
  level: GameLevel,
  flagId: string,
  countryId: string,
): boolean {
  return level.correctMatches[flagId] === countryId;
}
