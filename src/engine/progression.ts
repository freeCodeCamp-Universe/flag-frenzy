import type { GameLevel, GameProgress } from '../game/types';

export const MAX_CAMPAIGN_LEVEL = 30;

interface RecordLevelCompletionOptions {
  level: GameLevel;
  levelNumber: number;
  progress: GameProgress;
  score: number;
}

export function createDefaultProgress(): GameProgress {
  return {
    completedLevelIds: [],
    highScores: {},
    highestUnlockedLevel: 1,
    version: 1,
  };
}

export function recordLevelCompletion({
  level,
  levelNumber,
  progress,
  score,
}: RecordLevelCompletionOptions): GameProgress {
  const completedLevelIds = new Set(progress.completedLevelIds);
  completedLevelIds.add(level.id);

  return {
    ...progress,
    completedLevelIds: [...completedLevelIds],
    highScores: {
      ...progress.highScores,
      [level.id]: Math.max(progress.highScores[level.id] ?? 0, normalizeScore(score)),
    },
    highestUnlockedLevel: Math.min(
      MAX_CAMPAIGN_LEVEL,
      Math.max(progress.highestUnlockedLevel, levelNumber + 1),
    ),
  };
}

export function sanitizeProgress(value: unknown): GameProgress {
  if (!isProgressShape(value)) {
    return createDefaultProgress();
  }

  return {
    completedLevelIds: value.completedLevelIds.filter(
      (levelId, index, levelIds) =>
        levelId.length > 0 && levelIds.indexOf(levelId) === index,
    ),
    highScores: Object.fromEntries(
      Object.entries(value.highScores).filter(([, score]) => Number.isFinite(score)),
    ),
    highestUnlockedLevel: clampLevel(value.highestUnlockedLevel),
    version: 1,
  };
}

function clampLevel(level: number): number {
  return Math.min(MAX_CAMPAIGN_LEVEL, Math.max(1, Math.trunc(level)));
}

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.trunc(score));
}

function isProgressShape(value: unknown): value is GameProgress {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const progress = value as Record<string, unknown>;
  const highScores = progress.highScores;

  return (
    progress.version === 1 &&
    Array.isArray(progress.completedLevelIds) &&
    progress.completedLevelIds.every((levelId) => typeof levelId === 'string') &&
    typeof highScores === 'object' &&
    highScores !== null &&
    Object.values(highScores).every((score) => typeof score === 'number') &&
    typeof progress.highestUnlockedLevel === 'number'
  );
}
