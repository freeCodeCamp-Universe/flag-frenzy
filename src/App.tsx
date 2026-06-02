import { GameShell } from './components/GameShell';
import { HomeScreen } from './components/HomeScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { LevelSummary } from './components/gameplay/LevelSummary';
import { FlagFrenzyProvider, useFlagFrenzy } from './app/FlagFrenzyProvider';
import { PlayScreen } from './app/play/PlayPage';
import { useState } from 'react';

export function App() {
  const [currentPath, setCurrentPath] = useState(() => getCurrentPath());

  function navigate(href: string) {
    window.history.pushState({}, '', href);
    setCurrentPath(getCurrentPath());
  }

  return (
    <FlagFrenzyProvider navigate={navigate}>
      <main
        className="min-h-screen bg-fcc-background text-fcc-foreground"
        onClickCapture={(event) => {
          const target = event.target;

          if (!(target instanceof Element)) {
            return;
          }

          const link = target.closest('a[href]');

          if (!(link instanceof HTMLAnchorElement)) {
            return;
          }

          const href = link.getAttribute('href');

          if (!href?.startsWith('/')) {
            return;
          }

          event.preventDefault();
          navigate(href);
        }}
      >
        <GameShell>
          <TestRoute currentPath={currentPath} />
        </GameShell>
      </main>
    </FlagFrenzyProvider>
  );
}

interface TestRouteProps {
  currentPath: string;
}

function TestRoute({ currentPath }: TestRouteProps) {
  const {
    goToLevels,
    handleNextLevel,
    levelSummary,
    levels,
    nextLevelNumber,
    resetProgress,
    startLevel,
    unlockedCount,
  } = useFlagFrenzy();
  const path = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.split('?')[1] ?? '');

  if (path === '/levels') {
    return (
      <LevelSelectScreen
        levels={levels}
        onResetProgress={resetProgress}
        onSelectLevel={startLevel}
        unlockedCount={unlockedCount}
      />
    );
  }

  if (path === '/play') {
    return <PlayScreen requestedLevelParam={searchParams.get('level')} />;
  }

  if (path === '/summary' && levelSummary !== undefined) {
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

  return (
    <HomeScreen
      nextLevelNumber={nextLevelNumber}
      onOpenLevelSelect={goToLevels}
      onStartLevel={startLevel}
    />
  );
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}`;
}
