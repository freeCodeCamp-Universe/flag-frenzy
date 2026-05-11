import type {
  GameLevel,
  MatchAttempt,
  MatchFeedback,
  MatchResult,
  MatchValidationResult,
  PlayerMatches,
} from '../game/types';

export function validateLevel(level: GameLevel): string[] {
  const errors: string[] = [];
  const flagIdList = level.flags.map((flag) => flag.id);
  const countryIdList = level.countries.map((country) => country.id);
  const flagIds = new Set(flagIdList);
  const countryIds = new Set(countryIdList);
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

  if (level.optionCount !== level.countries.length) {
    errors.push('Option count must match the number of countries.');
  }

  for (const duplicateFlagId of getDuplicateIds(flagIdList)) {
    errors.push(`Duplicate flag id "${duplicateFlagId}".`);
  }

  for (const duplicateCountryId of getDuplicateIds(countryIdList)) {
    errors.push(`Duplicate country id "${duplicateCountryId}".`);
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

export function createMatchAttempt(
  level: GameLevel,
  flagId: string,
  selectedCountryId: string,
): MatchAttempt {
  const correctCountryId = level.correctMatches[flagId];

  if (correctCountryId === undefined) {
    throw new Error(`Level "${level.id}" is missing a match for "${flagId}".`);
  }

  return {
    correctCountryId,
    feedback: selectedCountryId === correctCountryId ? 'correct' : 'incorrect',
    flagId,
    selectedCountryId,
  };
}

export function applyMatchAttempt(
  playerMatches: PlayerMatches,
  attempt: MatchAttempt,
): PlayerMatches {
  if (attempt.feedback === 'incorrect') {
    return { ...playerMatches };
  }

  return {
    ...playerMatches,
    [attempt.flagId]: attempt.selectedCountryId,
  };
}

export function isMatchLocked(
  level: GameLevel,
  playerMatches: PlayerMatches,
  flagId: string,
): boolean {
  return getMatchFeedback(level, playerMatches, flagId) === 'correct';
}

export function getMatchFeedback(
  level: GameLevel,
  playerMatches: PlayerMatches,
  flagId: string,
): MatchFeedback {
  const selectedCountryId = playerMatches[flagId];

  if (selectedCountryId === undefined) {
    return 'pending';
  }

  return isCorrectMatch(level, flagId, selectedCountryId) ? 'correct' : 'incorrect';
}

export function isCorrectMatch(
  level: GameLevel,
  flagId: string,
  countryId: string,
): boolean {
  return level.correctMatches[flagId] === countryId;
}

function getDuplicateIds(ids: string[]): string[] {
  return ids.filter((id, index) => ids.indexOf(id) !== index);
}
