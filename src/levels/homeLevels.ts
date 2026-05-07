import type { HomeLevel, LevelStatus } from '../game/types';

interface CreateHomeLevelsOptions {
  unlockedThrough: number;
  unlockingLevel?: number;
}

const levelAccentClassNames = [
  'bg-flag-red',
  'bg-flag-white',
  'bg-flag-blue',
  'bg-flag-yellow',
  'bg-flag-green',
] as const;

export function createHomeLevels({
  unlockedThrough,
  unlockingLevel,
}: CreateHomeLevelsOptions): HomeLevel[] {
  return Array.from({ length: 30 }, (_, index) => {
    const number = index + 1;
    const status = getLevelStatus({
      number,
      unlockedThrough,
      unlockingLevel,
    });

    return {
      id: `level-${String(number)}`,
      number,
      status,
      accentClassName: getLevelAccentClassName(index),
    };
  });
}

interface GetLevelStatusOptions {
  number: number;
  unlockedThrough: number;
  unlockingLevel?: number;
}

function getLevelAccentClassName(index: number): string {
  return (
    levelAccentClassNames[index % levelAccentClassNames.length] ??
    levelAccentClassNames[0]
  );
}

function getLevelStatus({
  number,
  unlockedThrough,
  unlockingLevel,
}: GetLevelStatusOptions): LevelStatus {
  if (number === unlockingLevel) {
    return 'unlocking';
  }

  if (number <= unlockedThrough) {
    return 'unlocked';
  }

  return 'locked';
}
