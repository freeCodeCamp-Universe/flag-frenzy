'use client';

import { HomeScreen } from '../components/HomeScreen';
import { useFlagFrenzy } from './FlagFrenzyProvider';

export default function HomePage() {
  const { goToLevels, nextLevelNumber, startLevel } = useFlagFrenzy();

  return (
    <HomeScreen
      nextLevelNumber={nextLevelNumber}
      onOpenLevelSelect={goToLevels}
      onStartLevel={startLevel}
    />
  );
}
