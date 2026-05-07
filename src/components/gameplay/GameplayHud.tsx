import type { GameLevel, MatchValidationResult } from '../../game/types';

interface GameplayHudProps {
  currentLevel: number;
  isComplete: boolean;
  mode: GameLevel['mode'];
  score: number;
  timeLimitSeconds?: number;
  totalLevels: number;
  validation: MatchValidationResult;
}

export function GameplayHud({
  currentLevel,
  isComplete,
  mode,
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
