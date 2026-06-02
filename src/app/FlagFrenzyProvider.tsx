'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useRouter } from 'next/navigation';

import type { LevelCompletionSummary } from '../components/FlagMatchEngine';
import type { GameSettings } from '../game/types';
import { useGameSettings } from '../hooks/useGameSettings';
import { useProgression } from '../hooks/useProgression';
import { campaignLevels } from '../levels/campaign';
import { createHomeLevels } from '../levels/homeLevels';
import type { HomeLevel } from '../game/types';

interface LevelResultSummary extends LevelCompletionSummary {
  retryCount: number;
}

interface FlagFrenzyContextValue {
  goHome: () => void;
  goToLevels: () => void;
  handleLevelComplete: (summary: LevelCompletionSummary) => void;
  handleNextLevel: () => void;
  levelSummary: LevelResultSummary | undefined;
  levels: HomeLevel[];
  nextLevelNumber: number;
  resetProgress: () => void;
  setSoundEffects: (soundEffects: boolean) => void;
  settings: GameSettings;
  startLevel: (levelNumber: number) => void;
  unlockedCount: number;
}

const FlagFrenzyContext = createContext<FlagFrenzyContextValue | undefined>(undefined);

interface FlagFrenzyProviderProps extends PropsWithChildren {
  navigate: (href: string) => void;
}

export function NextFlagFrenzyProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <FlagFrenzyProvider
      navigate={(href) => {
        router.push(href);
      }}
    >
      {children}
    </FlagFrenzyProvider>
  );
}

export function FlagFrenzyProvider({ children, navigate }: FlagFrenzyProviderProps) {
  const { setSoundEffects, settings } = useGameSettings();
  const {
    completeLevel,
    progress,
    resetProgress: resetSavedProgress,
  } = useProgression();
  const [levelSummary, setLevelSummary] = useState<LevelResultSummary>();
  const [retryCountsByLevelId, setRetryCountsByLevelId] = useState<
    Record<string, number>
  >({});
  const levels = useMemo(
    () =>
      createHomeLevels({
        highScores: progress.highScores,
        unlockedThrough: progress.highestUnlockedLevel,
      }),
    [progress.highScores, progress.highestUnlockedLevel],
  );
  const nextLevelNumber = getNextUncompletedLevelNumber(progress.completedLevelIds);

  const startLevel = useCallback(
    (levelNumber: number) => {
      navigate(`/play?level=${String(levelNumber)}`);
    },
    [navigate],
  );

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToLevels = useCallback(() => {
    navigate('/levels');
  }, [navigate]);

  const resetProgress = useCallback(() => {
    resetSavedProgress();
    setSoundEffects(true);
    setLevelSummary(undefined);
    setRetryCountsByLevelId({});
    navigate('/');
  }, [navigate, resetSavedProgress, setSoundEffects]);

  const handleLevelComplete = useCallback(
    (summary: LevelCompletionSummary) => {
      if (summary.isPassed) {
        completeLevel(summary.level, summary.levelNumber, summary.score.totalScore);
        setLevelSummary({
          ...summary,
          retryCount: retryCountsByLevelId[summary.level.id] ?? 0,
        });
        navigate('/summary');
        return;
      }

      const retryCount = (retryCountsByLevelId[summary.level.id] ?? 0) + 1;

      setRetryCountsByLevelId((currentCounts) => ({
        ...currentCounts,
        [summary.level.id]: retryCount,
      }));
      setLevelSummary({
        ...summary,
        retryCount,
      });
      navigate('/summary');
    },
    [completeLevel, navigate, retryCountsByLevelId],
  );

  const handleNextLevel = useCallback(() => {
    if (levelSummary === undefined) {
      navigate('/');
      return;
    }

    const nextLevelNumber = levelSummary.isPassed
      ? levelSummary.isFinalLevel
        ? levelSummary.levelNumber
        : levelSummary.levelNumber + 1
      : levelSummary.levelNumber;

    startLevel(nextLevelNumber);
  }, [levelSummary, navigate, startLevel]);

  const value = useMemo(
    () => ({
      goHome,
      goToLevels,
      handleLevelComplete,
      handleNextLevel,
      levelSummary,
      levels,
      nextLevelNumber,
      resetProgress,
      setSoundEffects,
      settings,
      startLevel,
      unlockedCount: progress.highestUnlockedLevel,
    }),
    [
      goHome,
      goToLevels,
      handleLevelComplete,
      handleNextLevel,
      levelSummary,
      levels,
      nextLevelNumber,
      progress.highestUnlockedLevel,
      resetProgress,
      setSoundEffects,
      settings,
      startLevel,
    ],
  );

  return (
    <FlagFrenzyContext.Provider value={value}>{children}</FlagFrenzyContext.Provider>
  );
}

export function useFlagFrenzy() {
  const context = useContext(FlagFrenzyContext);

  if (context === undefined) {
    throw new Error('useFlagFrenzy must be used within FlagFrenzyProvider.');
  }

  return context;
}

export function useSettings() {
  const { setSoundEffects, settings } = useFlagFrenzy();

  return {
    setSoundEffects,
    settings,
  };
}

function getNextUncompletedLevelNumber(completedLevelIds: string[]): number {
  const completedIds = new Set(completedLevelIds);
  const nextLevelIndex = campaignLevels.findIndex(
    (level) => !completedIds.has(level.id),
  );

  if (nextLevelIndex === -1) {
    return campaignLevels.length;
  }

  return nextLevelIndex + 1;
}
