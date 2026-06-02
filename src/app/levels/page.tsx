'use client';

import { LevelSelectScreen } from '../../components/LevelSelectScreen';
import { useFlagFrenzy } from '../FlagFrenzyProvider';

export default function LevelsPage() {
  const { levels, resetProgress, startLevel, unlockedCount } = useFlagFrenzy();

  return (
    <LevelSelectScreen
      levels={levels}
      onResetProgress={resetProgress}
      onSelectLevel={startLevel}
      unlockedCount={unlockedCount}
    />
  );
}
