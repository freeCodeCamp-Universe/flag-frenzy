import { AnimatePresence, motion } from 'framer-motion';

import type { GameLevel, MatchValidationResult } from '../../game/types';

interface GameplayHudProps {
  currentLevel: number;
  isComplete: boolean;
  isFinalLevel: boolean;
  mode: GameLevel['mode'];
  onNextLevel: () => void;
  score: number;
  timeLimitSeconds?: number;
  totalLevels: number;
  validation: MatchValidationResult;
}

export function GameplayHud({
  currentLevel,
  isComplete,
  isFinalLevel,
  mode,
  onNextLevel,
  score,
  timeLimitSeconds,
  totalLevels,
  validation,
}: GameplayHudProps) {
  return (
    <div className="border-b border-fcc-border pb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-base text-fcc-highlight">
            level {String(currentLevel)}/{String(totalLevels)} / {mode}
          </p>
          <h2 id="flag-engine-title" className="text-2xl font-bold">
            Match flags
          </h2>
        </div>

        <dl className="grid grid-cols-3 gap-2 font-mono text-base">
          <Stat
            label="Correct"
            value={`${String(validation.correctCount)}/${String(validation.totalCount)}`}
          />
          <Stat label="Score" value={String(score)} />
          <Stat
            label={mode === 'timed' ? 'Timer' : 'Goal'}
            value={
              mode === 'timed'
                ? `${String(timeLimitSeconds ?? 0)}s`
                : `${String(validation.totalCount * 125)} pts`
            }
          />
        </dl>
      </div>

      <AnimatePresence>
        {isComplete ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-3 rounded border border-fcc-success bg-fcc-background p-3 sm:flex-row sm:items-center sm:justify-between"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
          >
            <p className="font-mono text-base text-fcc-success">
              Level cleared. Nice work.
            </p>
            <motion.button
              className="rounded bg-fcc-cta px-4 py-2 font-mono font-bold text-fcc-background outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-background"
              onClick={onNextLevel}
              type="button"
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isFinalLevel ? 'Replay Level' : 'Next Level'}
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="min-w-24 rounded border border-fcc-border bg-fcc-background px-3 py-2">
      <dt className="text-fcc-muted">{label}</dt>
      <dd
        aria-label={`${label}: ${value}`}
        className="text-xl font-bold text-fcc-foreground"
      >
        {value}
      </dd>
    </div>
  );
}
