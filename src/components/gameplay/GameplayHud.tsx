import { motion } from 'framer-motion';

import type { GameLevel, MatchValidationResult } from '../../game/types';
import { statPulseVariants } from '../../utils/animation';

interface GameplayHudProps {
  activeCorrectCount: number;
  activeTotalCount: number;
  currentLevel: number;
  elapsedSeconds: number;
  isComplete: boolean;
  mode: GameLevel['mode'];
  onPause: () => void;
  score: number;
  timeLimitSeconds?: number;
  totalLevels: number;
  validation: MatchValidationResult;
}

export function GameplayHud({
  activeCorrectCount,
  activeTotalCount,
  currentLevel,
  elapsedSeconds,
  isComplete,
  mode,
  onPause,
  score,
  timeLimitSeconds,
  totalLevels,
  validation,
}: GameplayHudProps) {
  const remainingSeconds =
    mode === 'timed'
      ? Math.max(0, (timeLimitSeconds ?? 0) - elapsedSeconds)
      : undefined;

  return (
    <div className="border-b border-fcc-border pb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-base text-fcc-highlight">
            Level {String(currentLevel)} of {String(totalLevels)}, {mode}
          </p>
          <h2 id="flag-engine-title" className="text-2xl font-bold">
            Match flags
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <dl className="grid grid-cols-3 gap-2 font-mono text-base">
            <Stat
              pulseKey={activeCorrectCount}
              label="Correct"
              value={`${String(activeCorrectCount)} of ${String(activeTotalCount)}`}
              valueLabel={`${String(activeCorrectCount)} of ${String(
                activeTotalCount,
              )} matches completed`}
            />
            <Stat label="Score" pulseKey={score} value={String(score)} />
            <Stat
              label={mode === 'timed' ? 'Timer' : 'Goal'}
              pulseKey={remainingSeconds ?? validation.totalCount}
              value={
                mode === 'timed'
                  ? `${String(remainingSeconds ?? 0)}s`
                  : `${String(activeTotalCount * 125)} pts`
              }
            />
          </dl>
          <button
            className="min-h-[4.25rem] rounded border border-fcc-highlight bg-fcc-background px-4 py-2 font-mono font-bold text-fcc-highlight outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus"
            disabled={isComplete}
            onClick={onPause}
            type="button"
          >
            Pause
          </button>
        </div>
      </div>

      {isComplete ? (
        <p className="mt-4 font-mono text-base text-fcc-success">
          Level complete. Review your score below.
        </p>
      ) : null}
    </div>
  );
}

interface StatProps {
  label: string;
  pulseKey: number;
  value: string;
  valueLabel?: string;
}

function Stat({ label, pulseKey, value, valueLabel }: StatProps) {
  return (
    <motion.div
      animate="changed"
      className="min-w-24 rounded border border-fcc-border bg-fcc-background px-3 py-2 will-change-transform"
      key={`${label}-${String(pulseKey)}`}
      variants={statPulseVariants}
    >
      <dt className="text-fcc-muted">{label}</dt>
      <dd
        aria-label={`${label}: ${valueLabel ?? value}`}
        className="text-xl font-bold text-fcc-foreground"
      >
        {value}
      </dd>
    </motion.div>
  );
}
