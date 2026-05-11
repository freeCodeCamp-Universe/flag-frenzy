import { motion } from 'framer-motion';

import type { HomeLevel } from '../game/types';

interface LevelGridProps {
  levels: HomeLevel[];
  onSelectLevel: (levelNumber: number) => void;
}

const levelTransition = {
  duration: 0.18,
  ease: 'easeOut',
} as const;

export function LevelGrid({ levels, onSelectLevel }: LevelGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
      {levels.map((level) => (
        <LevelTile key={level.id} level={level} onSelectLevel={onSelectLevel} />
      ))}
    </div>
  );
}

interface LevelTileProps {
  level: HomeLevel;
  onSelectLevel: (levelNumber: number) => void;
}

function LevelTile({ level, onSelectLevel }: LevelTileProps) {
  const isLocked = level.status === 'locked';
  const isUnlocking = level.status === 'unlocking';

  return (
    <motion.button
      animate={
        isUnlocking
          ? {
              boxShadow: '0 0 0 2px rgba(241, 190, 50, 0.25)',
              scale: [0.94, 1.08, 1],
            }
          : { scale: 1 }
      }
      aria-label={`Level ${String(level.number)} ${isLocked ? 'locked' : 'unlocked'}`}
      className={[
        'relative aspect-square rounded border font-mono font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface',
        isLocked
          ? 'cursor-not-allowed border-fcc-border bg-fcc-background text-fcc-muted'
          : isUnlocking
            ? 'border-fcc-cta bg-fcc-panel text-fcc-foreground'
            : 'border-fcc-border bg-fcc-panel text-fcc-foreground',
      ].join(' ')}
      disabled={isLocked}
      initial={isUnlocking ? { opacity: 0.45, rotate: -4, scale: 0.86 } : false}
      onClick={() => {
        onSelectLevel(level.number);
      }}
      transition={isUnlocking ? { duration: 0.52, ease: 'easeOut' } : levelTransition}
      type="button"
      whileHover={isLocked ? undefined : { y: -4, scale: 1.04 }}
      whileTap={isLocked ? undefined : { scale: 0.98 }}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute inset-x-0 top-0 h-1 rounded-t',
          level.accentClassName,
          isLocked ? 'opacity-30' : 'opacity-100',
        ].join(' ')}
      />
      <span>{level.number}</span>
      {level.highScore === undefined ? null : (
        <span className="absolute bottom-1 left-1 right-1 truncate font-mono text-xs text-fcc-success">
          Score: {level.highScore}
        </span>
      )}
      {isLocked ? (
        <span className="sr-only">locked</span>
      ) : (
        <span className="sr-only">unlocked</span>
      )}
    </motion.button>
  );
}
