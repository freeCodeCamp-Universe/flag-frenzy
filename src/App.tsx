import { AccessibilitySettingsPanel } from './components/AccessibilitySettingsPanel';
import { GameShell } from './components/GameShell';
import { FlagMatchEngine } from './components/FlagMatchEngine';
import { HomeScreen } from './components/HomeScreen';
import { useAccessibilitySettings } from './hooks/useAccessibilitySettings';
import { useGameSession } from './hooks/useGameSession';
import { useProgression } from './hooks/useProgression';
import { campaignLevels } from './levels/campaign';
import { createHomeLevels } from './levels/homeLevels';

export function App() {
  const { settings, updateSettings } = useAccessibilitySettings();
  const game = useGameSession();
  const { completeLevel, progress } = useProgression();
  const levels = createHomeLevels({
    highScores: progress.highScores,
    unlockedThrough: progress.highestUnlockedLevel,
  });

  return (
    <main className="min-h-screen bg-fcc-background text-fcc-foreground">
      <GameShell game={game}>
        <AccessibilitySettingsPanel settings={settings} onChange={updateSettings} />
        <HomeScreen levels={levels} unlockedCount={progress.highestUnlockedLevel} />
        <FlagMatchEngine
          accessibilitySettings={settings}
          levels={campaignLevels}
          onLevelComplete={completeLevel}
        />
      </GameShell>
    </main>
  );
}
