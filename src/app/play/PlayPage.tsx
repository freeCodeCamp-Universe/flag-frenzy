'use client';

import { useSearchParams } from 'next/navigation';

import { FlagMatchEngine } from '../../components/FlagMatchEngine';
import { campaignLevels } from '../../levels/campaign';
import { useFlagFrenzy } from '../FlagFrenzyProvider';

export function PlayPage() {
  const searchParams = useSearchParams();

  return <PlayScreen requestedLevelParam={searchParams.get('level')} />;
}

interface PlayScreenProps {
  requestedLevelParam: string | null;
}

export function PlayScreen({ requestedLevelParam }: PlayScreenProps) {
  const { handleLevelComplete } = useFlagFrenzy();
  const { goHome } = useFlagFrenzy();
  const requestedLevel = Number(requestedLevelParam ?? '1');
  const levelIndex = Number.isInteger(requestedLevel)
    ? Math.min(Math.max(requestedLevel, 1), campaignLevels.length) - 1
    : 0;

  return (
    <FlagMatchEngine
      key={levelIndex}
      initialLevelIndex={levelIndex}
      levels={campaignLevels}
      onLevelComplete={handleLevelComplete}
      onQuit={() => {
        goHome();
      }}
    />
  );
}
