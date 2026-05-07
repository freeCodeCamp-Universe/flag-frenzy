import { GameShell } from './components/GameShell';
import { HomeScreen } from './components/HomeScreen';
import { useGameSession } from './hooks/useGameSession';
import { createHomeLevels } from './levels/homeLevels';

export function App() {
  const game = useGameSession();
  const levels = createHomeLevels({
    unlockedThrough: 8,
    unlockingLevel: 9,
  });

  return (
    <main className="min-h-screen bg-fcc-background text-fcc-foreground">
      <GameShell game={game}>
        <HomeScreen levels={levels} />
      </GameShell>
    </main>
  );
}
