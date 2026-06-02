import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import type { HomeLevel } from '../game/types';
import { LevelGrid } from './LevelGrid';

interface LevelSelectScreenProps {
  levels: HomeLevel[];
  onResetProgress: () => void;
  onSelectLevel: (levelNumber: number) => void;
  unlockedCount: number;
}

const screenTransition = {
  duration: 0.36,
  ease: 'easeOut',
} as const;

export function LevelSelectScreen({
  levels,
  onResetProgress,
  onSelectLevel,
  unlockedCount,
}: LevelSelectScreenProps) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  function closeResetDialog() {
    setIsResetDialogOpen(false);
  }

  function confirmResetProgress() {
    closeResetDialog();
    onResetProgress();
  }

  return (
    <>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5"
        initial={{ opacity: 0, y: 18 }}
        transition={screenTransition}
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Levels</h1>
            <p className="mt-2 font-mono text-base text-fcc-success">
              {unlockedCount} unlocked
            </p>
          </div>
          <button
            className="rounded border border-fcc-danger bg-fcc-background px-4 py-3 font-mono font-bold text-fcc-danger outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface"
            onClick={() => {
              setIsResetDialogOpen(true);
            }}
            type="button"
          >
            Reset Progress
          </button>
        </div>
        <LevelGrid levels={levels} onSelectLevel={onSelectLevel} />
      </motion.section>

      {isResetDialogOpen ? (
        <ResetProgressDialog
          onCancel={closeResetDialog}
          onConfirm={confirmResetProgress}
        />
      ) : null}
    </>
  );
}

interface ResetProgressDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function ResetProgressDialog({ onCancel, onConfirm }: ResetProgressDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-labelledby="reset-progress-title"
      aria-modal="true"
      className="fixed inset-0 z-30 grid place-items-center bg-fcc-background/85 px-4"
      initial={{ opacity: 0 }}
      role="dialog"
      transition={screenTransition}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded border border-fcc-danger bg-fcc-surface p-5"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={screenTransition}
      >
        <p className="font-mono text-base text-fcc-danger">Destructive action</p>
        <h2 id="reset-progress-title" className="mt-2 text-2xl font-bold">
          Reset Progress
        </h2>
        <p className="mt-3 text-base text-fcc-muted">
          This will erase completed levels, unlocked progress, saved high scores, and
          tutorial completion. You will start again with only level 1 unlocked.
        </p>
        <div className="mt-5 flex flex-col gap-3 xs:flex-row">
          <button
            ref={cancelButtonRef}
            className="rounded border border-fcc-highlight bg-fcc-background px-4 py-3 font-mono font-bold text-fcc-highlight outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded border border-fcc-danger bg-fcc-danger px-4 py-3 font-mono font-bold text-fcc-background outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface"
            onClick={onConfirm}
            type="button"
          >
            Reset Progress
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
