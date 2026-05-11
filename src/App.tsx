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
import type { AccessibilitySettings } from './game/types';
import { useAccessibilitySettings } from './hooks/useAccessibilitySettings';
import { useProgression } from './hooks/useProgression';
import { campaignLevels } from './levels/campaign';
import { createHomeLevels } from './levels/homeLevels';

export function App() {
  return (
    <BrowserRouter>
      <FlagFrenzyRoutes />
    </BrowserRouter>
  );
}

function FlagFrenzyRoutes() {
  const { settings, updateSettings } = useAccessibilitySettings();
  const { completeLevel, progress } = useProgression();
  const navigate = useNavigate();
  const [levelSummary, setLevelSummary] = useState<LevelCompletionSummary>();
  const levels = createHomeLevels({
    highScores: progress.highScores,
    unlockedThrough: progress.highestUnlockedLevel,
  });

  function handleLevelComplete(summary: LevelCompletionSummary) {
    completeLevel(summary.level, summary.levelNumber, summary.score.totalScore);
    setLevelSummary(summary);
    void navigate('/summary');
  }

  function handleNextLevel() {
    if (levelSummary === undefined) {
      void navigate('/');
      return;
    }

    const nextLevelNumber = levelSummary.isFinalLevel
      ? levelSummary.levelNumber
      : levelSummary.levelNumber + 1;

    void navigate(`/play?level=${String(nextLevelNumber)}`);
  }

  return (
    <main className="min-h-screen bg-fcc-background text-fcc-foreground">
      <GameShell settings={settings} onAccessibilityChange={updateSettings}>
        <Routes>
          <Route element={<HomeScreen />} path="/" />
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
            element={
              <PlayPage
                accessibilitySettings={settings}
                onLevelComplete={handleLevelComplete}
              />
            }
            path="/play"
          />
          <Route
            element={
              levelSummary === undefined ? (
                <Navigate replace to="/" />
              ) : (
                <LevelSummary
                  elapsedSeconds={levelSummary.elapsedSeconds}
                  hintsUsed={levelSummary.hintsUsed}
                  incorrectAttempts={levelSummary.incorrectAttempts}
                  isFinalLevel={levelSummary.isFinalLevel}
                  onNextLevel={handleNextLevel}
                  score={levelSummary.score}
                  settings={settings}
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

interface PlayPageProps {
  accessibilitySettings: AccessibilitySettings;
  onLevelComplete: (summary: LevelCompletionSummary) => void;
}

function PlayPage({ accessibilitySettings, onLevelComplete }: PlayPageProps) {
  const [searchParams] = useSearchParams();
  const requestedLevel = Number(searchParams.get('level') ?? '1');
  const levelIndex = Number.isInteger(requestedLevel)
    ? Math.min(Math.max(requestedLevel, 1), campaignLevels.length) - 1
    : 0;

  return (
    <FlagMatchEngine
      key={levelIndex}
      accessibilitySettings={accessibilitySettings}
      initialLevelIndex={levelIndex}
      levels={campaignLevels}
      onLevelComplete={onLevelComplete}
    />
  );
}
