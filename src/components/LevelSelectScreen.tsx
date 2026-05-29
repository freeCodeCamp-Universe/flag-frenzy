import { motion } from 'framer-motion';

import type { HomeLevel } from '../game/types';
import { LevelGrid } from './LevelGrid';

interface LevelSelectScreenProps {
  levels: HomeLevel[];
  onSelectLevel: (levelNumber: number) => void;
  unlockedCount: number;
}

const screenTransition = {
  duration: 0.36,
  ease: 'easeOut',
} as const;

export function LevelSelectScreen({
  levels,
  onSelectLevel,
  unlockedCount,
}: LevelSelectScreenProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5"
      initial={{ opacity: 0, y: 18 }}
      transition={screenTransition}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Levels</h1>
        </div>
        <p className="font-mono text-base text-fcc-success">{unlockedCount} unlocked</p>
      </div>
      <LevelGrid levels={levels} onSelectLevel={onSelectLevel} />
    </motion.section>
  );
}
