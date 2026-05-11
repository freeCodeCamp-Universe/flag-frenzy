import { motion } from 'framer-motion';

import type { LevelScoreBreakdown } from '../../engine/scoring';
import { getAnimationTransition, popVariants } from '../../utils/animation';

interface LevelSummaryProps {
  elapsedSeconds: number;
  hintsUsed: number;
  incorrectAttempts: number;
  isFinalLevel: boolean;
  onNextLevel: () => void;
  score: LevelScoreBreakdown;
}

export function LevelSummary({
  elapsedSeconds,
  hintsUsed,
  incorrectAttempts,
  isFinalLevel,
  onNextLevel,
  score,
}: LevelSummaryProps) {
  return (
    <motion.section
      animate="visible"
      aria-labelledby="level-summary-title"
      className="mt-5 rounded border border-fcc-success bg-fcc-background p-4"
      exit="hidden"
      initial="hidden"
      transition={getAnimationTransition(0.24)}
      variants={popVariants}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-base text-fcc-success">level cleared</p>
          <h3 id="level-summary-title" className="text-2xl font-bold">
            Level Summary
          </h3>
        </div>
        <p
          aria-label={`Final score: ${String(score.totalScore)}`}
          className="font-mono text-4xl font-bold text-fcc-cta"
        >
          {score.totalScore}
        </p>
      </div>

      <dl className="mt-4 grid gap-2 font-mono text-base sm:grid-cols-2 lg:grid-cols-3">
        <SummaryStat label="Base" value={score.baseScore} />
        <SummaryStat label="Speed" value={score.speedBonus} />
        <SummaryStat label="No hints" value={score.hintBonus} />
        <SummaryStat label="Penalty" value={-score.incorrectPenalty} />
        <SummaryStat label="Hints used" value={hintsUsed} />
        <SummaryStat label="Time" value={`${String(elapsedSeconds)}s`} />
        <SummaryStat label="Retries" value={incorrectAttempts} />
      </dl>

      <motion.button
        className="mt-4 rounded bg-fcc-cta px-4 py-2 font-mono font-bold text-fcc-background outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-background"
        onClick={onNextLevel}
        type="button"
        whileHover={{ y: -2, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {isFinalLevel ? 'Replay Level' : 'Next Level'}
      </motion.button>
    </motion.section>
  );
}

interface SummaryStatProps {
  label: string;
  value: number | string;
}

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <div className="rounded border border-fcc-border bg-fcc-panel px-3 py-2">
      <dt className="text-fcc-muted">{label}</dt>
      <dd aria-label={`${label}: ${String(value)}`} className="text-xl font-bold">
        {value}
      </dd>
    </div>
  );
}
