import type { GameLevel, GameProgress } from '../game/types';

export const maxCampaignLevel = 30;

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
}: {
  level: GameLevel;
  levelNumber: number;
  progress: GameProgress;
  score: number;
}): GameProgress {
  const completedLevelIds = new Set(progress.completedLevelIds);
  completedLevelIds.add(level.id);

  return {
    ...progress,
    completedLevelIds: [...completedLevelIds],
    highScores: {
      ...progress.highScores,
      [level.id]: Math.max(progress.highScores[level.id] ?? 0, score),
    },
    highestUnlockedLevel: Math.min(
      maxCampaignLevel,
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
  return Math.min(maxCampaignLevel, Math.max(1, Math.trunc(level)));
}

function isProgressShape(value: unknown): value is GameProgress {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const progress = value as Partial<GameProgress>;

  return (
    progress.version === 1 &&
    Array.isArray(progress.completedLevelIds) &&
    progress.completedLevelIds.every((levelId) => typeof levelId === 'string') &&
    typeof progress.highScores === 'object' &&
    Object.values(progress.highScores).every((score) => typeof score === 'number') &&
    typeof progress.highestUnlockedLevel === 'number'
  );
}
