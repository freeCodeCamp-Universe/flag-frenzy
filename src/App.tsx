import { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router';

import { GameShell } from './components/GameShell';
import { FlagMatchEngine } from './components/FlagMatchEngine';
import type { LevelCompletionSummary } from './components/FlagMatchEngine';
import { HomeScreen } from './components/HomeScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { LevelSummary } from './components/gameplay/LevelSummary';
import { useProgression } from './hooks/useProgression';
import { campaignLevels } from './levels/campaign';
import { createHomeLevels } from './levels/homeLevels';

interface LevelResultSummary extends LevelCompletionSummary {
  retryCount: number;
}

export function App() {
  return (
    <BrowserRouter>
      <FlagFrenzyRoutes />
    </BrowserRouter>
  );
}

function FlagFrenzyRoutes() {
  const { completeLevel, progress } = useProgression();
  const navigate = useNavigate();
  const [levelSummary, setLevelSummary] = useState<LevelResultSummary>();
  const [retryCountsByLevelId, setRetryCountsByLevelId] = useState<
    Record<string, number>
  >({});
  const levels = createHomeLevels({
    highScores: progress.highScores,
    unlockedThrough: progress.highestUnlockedLevel,
  });
  const nextLevelNumber = getNextUncompletedLevelNumber(progress.completedLevelIds);

  function handleLevelComplete(summary: LevelCompletionSummary) {
    if (summary.isPassed) {
      completeLevel(summary.level, summary.levelNumber, summary.score.totalScore);
      setLevelSummary({
        ...summary,
        retryCount: retryCountsByLevelId[summary.level.id] ?? 0,
      });
      void navigate('/summary');
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
    void navigate('/summary');
  }

  function handleNextLevel() {
    if (levelSummary === undefined) {
      void navigate('/');
      return;
    }

    const nextLevelNumber = levelSummary.isPassed
      ? levelSummary.isFinalLevel
        ? levelSummary.levelNumber
        : levelSummary.levelNumber + 1
      : levelSummary.levelNumber;

    void navigate(`/play?level=${String(nextLevelNumber)}`);
  }

  return (
    <main className="min-h-screen bg-fcc-background text-fcc-foreground">
      <GameShell>
        <Routes>
          <Route element={<HomeScreen nextLevelNumber={nextLevelNumber} />} path="/" />
          <Route
            element={
              <LevelSelectScreen
                levels={levels}
                unlockedCount={progress.highestUnlockedLevel}
              />
            }
            path="/levels"
          />
          <Route
            element={<PlayPage onLevelComplete={handleLevelComplete} />}
            path="/play"
          />
          <Route
            element={
              levelSummary === undefined ? (
                <Navigate replace to="/" />
              ) : (
                <LevelSummary
                  elapsedSeconds={levelSummary.elapsedSeconds}
                  incorrectAttempts={levelSummary.incorrectAttempts}
                  isFinalLevel={levelSummary.isFinalLevel}
                  isPassed={levelSummary.isPassed}
                  onNextLevel={handleNextLevel}
                  retryCount={levelSummary.retryCount}
                  score={levelSummary.score}
                />
              )
            }
            path="/summary"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </GameShell>
    </main>
  );
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

interface PlayPageProps {
  onLevelComplete: (summary: LevelCompletionSummary) => void;
}

function PlayPage({ onLevelComplete }: PlayPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedLevel = Number(searchParams.get('level') ?? '1');
  const levelIndex = Number.isInteger(requestedLevel)
    ? Math.min(Math.max(requestedLevel, 1), campaignLevels.length) - 1
    : 0;

  return (
    <FlagMatchEngine
      key={levelIndex}
      initialLevelIndex={levelIndex}
      levels={campaignLevels}
      onLevelComplete={onLevelComplete}
      onQuit={() => {
        void navigate('/');
      }}
    />
  );
}
