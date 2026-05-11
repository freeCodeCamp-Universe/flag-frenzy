import type { GameLevel, MatchValidationResult } from '../game/types';

export interface ScoreInput {
  elapsedSeconds: number;
  incorrectAttempts: number;
  level: GameLevel;
  validation: MatchValidationResult;
}

export interface LevelScoreBreakdown {
  baseScore: number;
  incorrectPenalty: number;
  speedBonus: number;
  totalScore: number;
}

const pointsPerCorrectMatch = 100;
const incorrectPenalty = 10;
const speedBonusPerSecond = 5;

export function calculateLevelScore({
  elapsedSeconds,
  incorrectAttempts,
  level,
  validation,
}: ScoreInput): LevelScoreBreakdown {
  const baseScore = validation.correctCount * pointsPerCorrectMatch;
  const speedBonus = validation.isPerfect
    ? calculateSpeedBonus(level, normalizeCount(elapsedSeconds))
    : 0;
  const penalty = Math.min(
    normalizeCount(incorrectAttempts) * incorrectPenalty,
    baseScore + speedBonus,
  );
  const totalScore = Math.max(0, baseScore + speedBonus - penalty);

  return {
    baseScore,
    incorrectPenalty: penalty,
    speedBonus,
    totalScore,
  };
}

export function calculateSpeedBonus(level: GameLevel, elapsedSeconds: number): number {
  const normalizedElapsedSeconds = normalizeCount(elapsedSeconds);
  const budgetSeconds =
    level.timeLimitSeconds ??
    Math.max(level.flags.length * 10, normalizedElapsedSeconds);
  const remainingSeconds = Math.max(0, budgetSeconds - normalizedElapsedSeconds);

  return remainingSeconds * speedBonusPerSecond;
}

export function getIncorrectAttemptCount(
  attempts: Record<string, { feedback: 'correct' | 'incorrect' | 'pending' }>,
): number {
  return Object.values(attempts).filter((attempt) => attempt.feedback === 'incorrect')
    .length;
}

function normalizeCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}
