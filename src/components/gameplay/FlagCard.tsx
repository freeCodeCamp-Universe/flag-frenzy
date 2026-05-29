import { AnimatePresence, motion } from 'framer-motion';
import type { DragEvent } from 'react';

import type { MatchFeedback, FlagAsset } from '../../game/types';
import {
  checkmarkVariants,
  feedbackVariants,
  getAnimationTransition,
} from '../../utils/animation';
import type { AttemptState } from '../FlagMatchEngine';

interface FlagCardProps {
  attempt?: AttemptState;
  feedback: MatchFeedback;
  flag: FlagAsset;
  isLocked: boolean;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  revealedCountryName?: string;
  selectedCountryName?: string;
}

export function FlagCard({
  attempt,
  feedback,
  flag,
  isLocked,
  onClick,
  onDrop,
  revealedCountryName,
  selectedCountryName,
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
      transition={getAnimationTransition(0.28)}
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
            ? (revealedCountryName ?? '')
            : selectedCountryName === undefined
              ? feedback === 'pending'
                ? ''
                : feedback
              : ''}
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
              transition={getAnimationTransition(0.18)}
            >
              ✓
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {isIncorrect ? (
        <div className="mt-3 border-t border-fcc-border pt-3">
          <p className="font-mono text-base text-fcc-danger">
            Not quite. Try another country.
          </p>
        </div>
      ) : null}
    </motion.article>
  );
}
