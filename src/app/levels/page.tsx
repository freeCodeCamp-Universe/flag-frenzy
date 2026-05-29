'use client';

import { LevelSelectScreen } from '../../components/LevelSelectScreen';
import { useFlagFrenzy } from '../FlagFrenzyProvider';

export default function LevelsPage() {
  const { levels, startLevel, unlockedCount } = useFlagFrenzy();

  return (
    <LevelSelectScreen
      levels={levels}
      onSelectLevel={startLevel}
      unlockedCount={unlockedCount}
    />
  );
}
