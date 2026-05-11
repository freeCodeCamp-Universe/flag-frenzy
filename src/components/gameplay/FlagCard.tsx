import { AnimatePresence, motion } from 'framer-motion';
import type { DragEvent } from 'react';

import type { AccessibilitySettings, MatchFeedback, FlagAsset } from '../../game/types';
import {
  checkmarkVariants,
  feedbackVariants,
  getAnimationTransition,
  hintVariants,
} from '../../utils/animation';
import type { AttemptState } from '../FlagMatchEngine';

interface FlagCardProps {
  attempt?: AttemptState;
  feedback: MatchFeedback;
  flag: FlagAsset;
  hint?: string;
  isHintRevealed: boolean;
  isLocked: boolean;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onRevealHint: () => void;
  selectedCountryName?: string;
  settings: AccessibilitySettings;
}

export function FlagCard({
  attempt,
  feedback,
  flag,
  hint,
  isHintRevealed,
  isLocked,
  onClick,
  onDrop,
  onRevealHint,
  selectedCountryName,
  settings,
}: FlagCardProps) {
  const isCorrect = feedback === 'correct';
  const isIncorrect = feedback === 'incorrect';

  return (
    <motion.article
      animate={feedback}
      className={[
        'rounded border bg-fcc-panel p-3 transition',
        isCorrect ? 'border-fcc-success' : '',
        isIncorrect ? 'border-fcc-danger' : '',
        feedback === 'pending' ? 'border-fcc-border' : '',
      ].join(' ')}
      key={`${flag.id}-${String(attempt?.attemptId ?? 0)}`}
      transition={getAnimationTransition(settings, 0.28)}
      variants={feedbackVariants}
    >
      <button
        aria-label={`Match ${flag.alt}`}
        className="block w-full rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-panel disabled:cursor-not-allowed"
        disabled={isLocked}
        onClick={onClick}
        onDragOver={(event) => {
          if (!isLocked) {
            event.preventDefault();
          }
        }}
        onDrop={(event) => {
          if (!isLocked) {
            onDrop(event);
          }
        }}
        type="button"
      >
        <img
          alt={flag.alt}
          className="h-40 w-full rounded border border-fcc-border bg-fcc-background object-contain p-2 sm:h-44"
          src={flag.src}
        />
      </button>

      <div className="mt-3 flex min-h-8 items-center justify-between gap-3 font-mono">
        <span className="text-base text-fcc-muted">
          {isLocked
            ? 'locked'
            : selectedCountryName === undefined
              ? feedback
              : `ready: ${selectedCountryName}`}
        </span>
        <AnimatePresence>
          {isCorrect ? (
            <motion.span
              animate="visible"
              aria-label="correct"
              className="grid size-8 place-items-center rounded bg-fcc-success font-bold text-fcc-background"
              exit="hidden"
              initial="hidden"
              variants={checkmarkVariants}
              transition={getAnimationTransition(settings, 0.18)}
            >
              ✓
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {hint === undefined ? null : (
        <div className="mt-3 border-t border-fcc-border pt-3">
          <button
            className="rounded border border-fcc-highlight px-3 py-2 font-mono text-base text-fcc-highlight outline-none transition hover:bg-fcc-background focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-panel"
            onClick={onRevealHint}
            type="button"
          >
            Hint
          </button>
          <AnimatePresence>
            {isHintRevealed ? (
              <motion.p
                animate="visible"
                className="mt-3 text-base text-fcc-muted"
                exit="hidden"
                initial="hidden"
                variants={hintVariants}
                transition={getAnimationTransition(settings, 0.24)}
              >
                Hint: {hint}
              </motion.p>
            ) : null}
          </AnimatePresence>
          {isIncorrect ? (
            <motion.p
              animate="visible"
              className="mt-2 font-mono text-base text-fcc-danger"
              initial="hidden"
              variants={hintVariants}
              transition={getAnimationTransition(settings, 0.24)}
            >
              Not quite. Use the hint and try another country.
            </motion.p>
          ) : null}
        </div>
      )}
    </motion.article>
  );
}
