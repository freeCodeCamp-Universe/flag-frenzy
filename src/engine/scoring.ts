import type { GameLevel, MatchValidationResult } from '../game/types';

export interface ScoreInput {
  elapsedSeconds: number;
  hintsUsed: number;
  incorrectAttempts: number;
  level: GameLevel;
  validation: MatchValidationResult;
}

export interface LevelScoreBreakdown {
  baseScore: number;
  hintBonus: number;
  incorrectPenalty: number;
  speedBonus: number;
  totalScore: number;
}

const pointsPerCorrectMatch = 100;
const noHintBonusPerFlag = 25;
const incorrectPenalty = 10;
const speedBonusPerSecond = 5;

export function calculateLevelScore({
  elapsedSeconds,
  hintsUsed,
  incorrectAttempts,
  level,
  validation,
}: ScoreInput): LevelScoreBreakdown {
  const baseScore = validation.correctCount * pointsPerCorrectMatch;
  const speedBonus = validation.isPerfect
    ? calculateSpeedBonus(level, elapsedSeconds)
    : 0;
  const hintBonus =
    validation.isPerfect && hintsUsed === 0
      ? validation.totalCount * noHintBonusPerFlag
      : 0;
  const penalty = Math.min(
    incorrectAttempts * incorrectPenalty,
    baseScore + speedBonus + hintBonus,
  );
  const totalScore = Math.max(0, baseScore + speedBonus + hintBonus - penalty);

  return {
    baseScore,
    hintBonus,
    incorrectPenalty: penalty,
    speedBonus,
    totalScore,
  };
}

export function calculateSpeedBonus(level: GameLevel, elapsedSeconds: number): number {
  const budgetSeconds =
    level.timeLimitSeconds ?? Math.max(level.flags.length * 10, elapsedSeconds);
  const remainingSeconds = Math.max(0, budgetSeconds - elapsedSeconds);

  return remainingSeconds * speedBonusPerSecond;
}

export function getIncorrectAttemptCount(
  attempts: Record<string, { feedback: string }>,
): number {
  return Object.values(attempts).filter((attempt) => attempt.feedback === 'incorrect')
    .length;
}
