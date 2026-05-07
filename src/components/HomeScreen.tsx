import { motion } from 'framer-motion';

import { LevelGrid } from './LevelGrid';
import { MotionButton } from './MotionButton';
import type { HomeLevel } from '../game/types';

interface HomeScreenProps {
  levels: HomeLevel[];
}

const screenTransition = {
  duration: 0.36,
  ease: 'easeOut',
} as const;

export function HomeScreen({ levels }: HomeScreenProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(25rem,1.08fr)] lg:items-start"
      initial={{ opacity: 0, y: 18 }}
      transition={screenTransition}
    >
      <section className="relative overflow-hidden rounded border border-fcc-border bg-fcc-panel">
        <div className="flag-rush absolute inset-x-0 top-0 h-3" aria-hidden="true" />
        <div className="relative p-5 pt-8 sm:p-7 sm:pt-10">
          <p className="font-mono text-base font-bold uppercase tracking-normal text-fcc-highlight">
            world flags / speed match
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-fcc-foreground sm:text-6xl">
            Flag Frenzy
          </h1>
          <p className="mt-4 max-w-xl text-xl text-fcc-muted">
            Match flags to countries quickly
          </p>

          <div className="mt-8 flex flex-col gap-3 xs:flex-row">
            <MotionButton intent="primary">Start</MotionButton>
            <MotionButton intent="secondary">Level Select</MotionButton>
          </div>

          <div
            aria-hidden="true"
            className="mt-8 grid h-24 grid-cols-6 overflow-hidden rounded border border-fcc-border"
          >
            <span className="bg-flag-red" />
            <span className="bg-flag-white" />
            <span className="bg-flag-blue" />
            <span className="bg-flag-yellow" />
            <span className="bg-flag-green" />
            <span className="bg-flag-red" />
          </div>
        </div>
      </section>

      <section className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-base text-fcc-muted">select stage</p>
            <h2 className="text-2xl font-bold">Levels</h2>
          </div>
          <p className="font-mono text-base text-fcc-success">8 unlocked</p>
        </div>
        <LevelGrid levels={levels} />
      </section>
    </motion.section>
  );
}
