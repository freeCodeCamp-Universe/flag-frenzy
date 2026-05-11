import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

import { MotionButton } from './MotionButton';

interface HomeScreenProps {
  nextLevelNumber: number;
}

const screenTransition = {
  duration: 0.36,
  ease: 'easeOut',
} as const;

export function HomeScreen({ nextLevelNumber }: HomeScreenProps) {
  const navigate = useNavigate();

  function startLevel() {
    void navigate(`/play?level=${String(nextLevelNumber)}`);
  }

  function openLevelSelect() {
    void navigate('/levels');
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-3xl place-items-center"
      initial={{ opacity: 0, y: 18 }}
      transition={screenTransition}
    >
      <section className="relative w-full overflow-hidden rounded border border-fcc-border bg-fcc-panel">
        <div className="relative p-5 pt-8 text-center sm:p-7 sm:pt-10">
          <h1 className="mt-3 text-5xl font-bold leading-tight text-fcc-foreground sm:text-6xl">
            Flag Frenzy
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xl text-fcc-muted">
            Match flags to countries quickly
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 xs:flex-row">
            <MotionButton
              intent="primary"
              onClick={() => {
                startLevel();
              }}
            >
              Start
            </MotionButton>
            <MotionButton intent="secondary" onClick={openLevelSelect}>
              Level Select
            </MotionButton>
          </div>
        </div>
      </section>
    </motion.section>
  );
}
