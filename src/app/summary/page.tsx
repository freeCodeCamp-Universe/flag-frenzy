'use client';

import { redirect } from 'next/navigation';

import { LevelSummary } from '../../components/gameplay/LevelSummary';
import { useFlagFrenzy } from '../FlagFrenzyProvider';

export default function SummaryPage() {
  const { handleNextLevel, levelSummary } = useFlagFrenzy();

  if (levelSummary === undefined) {
    redirect('/');
  }

  return (
    <LevelSummary
      elapsedSeconds={levelSummary.elapsedSeconds}
      incorrectAttempts={levelSummary.incorrectAttempts}
      isFinalLevel={levelSummary.isFinalLevel}
      isPassed={levelSummary.isPassed}
      onNextLevel={handleNextLevel}
      retryCount={levelSummary.retryCount}
      score={levelSummary.score}
    />
  );
}
