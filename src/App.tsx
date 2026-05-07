import { motion } from 'framer-motion';

import { GameShell } from './components/GameShell';
import { useGameSession } from './hooks/useGameSession';

export function App() {
  const game = useGameSession();

  return (
    <main className="min-h-screen bg-fcc-background text-fcc-foreground">
      <GameShell game={game}>
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="rounded border border-fcc-border bg-fcc-panel p-5">
            <p className="font-mono text-fcc-muted">round 01 / beginner</p>
            <h1 className="mt-2 text-4xl font-bold">Flag Frenzy</h1>
            <p className="mt-4 max-w-2xl text-fcc-foreground">
              Identify flags under pressure, build streaks, and climb through
              increasingly spicy geography rounds.
            </p>
            <button
              className="mt-6 rounded bg-fcc-cta px-5 py-3 font-mono font-bold text-fcc-background outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#198eee] focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-background"
              type="button"
            >
              Start run
            </button>
          </div>

          <aside className="rounded border border-fcc-border bg-fcc-surface p-5">
            <h2 className="font-mono text-xl font-bold">Session</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 font-mono">
              <div>
                <dt className="text-fcc-muted">Score</dt>
                <dd className="text-2xl text-fcc-success">{game.score}</dd>
              </div>
              <div>
                <dt className="text-fcc-muted">Lives</dt>
                <dd className="text-2xl text-fcc-danger">{game.lives}</dd>
              </div>
            </dl>
          </aside>
        </motion.section>
      </GameShell>
    </main>
  );
}
