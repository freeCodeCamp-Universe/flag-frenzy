import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';

import {
  applyMatchAttempt,
  createMatchAttempt,
  getMatchFeedback,
  isMatchLocked,
  validateMatches,
} from '../engine/matching';
import { calculateLevelScore } from '../engine/scoring';
import type {
  CountryOption,
  GameLevel,
  MatchAttempt,
  PlayerMatches,
} from '../game/types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { getAnimationTransition, levelAdvanceVariants } from '../utils/animation';
import { CountryBank } from './gameplay/CountryBank';
import { FlagCard } from './gameplay/FlagCard';
import { GameplayHud } from './gameplay/GameplayHud';

interface FlagMatchEngineProps {
  initialLevelIndex?: number;
  levels: GameLevel[];
  onLevelComplete?: (summary: LevelCompletionSummary) => void;
  onQuit: () => void;
}

export interface AttemptState extends MatchAttempt {
  attemptId: number;
}

export interface LevelCompletionSummary {
  elapsedSeconds: number;
  incorrectAttempts: number;
  isFinalLevel: boolean;
  isPassed: boolean;
  level: GameLevel;
  levelIndex: number;
  levelNumber: number;
  score: ReturnType<typeof calculateLevelScore>;
}

export function FlagMatchEngine({
  initialLevelIndex = 0,
  levels,
  onLevelComplete,
  onQuit,
}: FlagMatchEngineProps) {
  const levelIndex = initialLevelIndex;
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [playerMatches, setPlayerMatches] = useState<PlayerMatches>({});
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [incorrectAttemptCount, setIncorrectAttemptCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const completedLevelIdRef = useRef<string | undefined>(undefined);
  const playAudioFeedback = useAudioFeedback();
  const level = getPlayableLevel(levels, levelIndex);
  const boardFlags = useMemo(() => shuffleItems(level.flags), [level]);
  const countryOptions = useMemo(
    () => createCountryOptions(level, levels),
    [level, levels],
  );
  const selectedCountryName = countryOptions.find(
    (country) => country.id === selectedCountryId,
  )?.name;
  const validation = useMemo(
    () => validateMatches(level, playerMatches),
    [level, playerMatches],
  );
  const score = calculateLevelScore({
    elapsedSeconds,
    incorrectAttempts: incorrectAttemptCount,
    level,
    validation,
  });
  const isFinalLevel = levelIndex >= levels.length - 1;
  const isTimeExpired =
    level.mode === 'timed' &&
    level.timeLimitSeconds !== undefined &&
    elapsedSeconds >= level.timeLimitSeconds &&
    !validation.isPerfect;
  const isLevelEnded = validation.isPerfect || isTimeExpired;

  useEffect(() => {
    if (isLevelEnded || isPaused) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isLevelEnded, isPaused]);

  useEffect(() => {
    if (validation.isPerfect) {
      playAudioFeedback('complete');
    }
  }, [playAudioFeedback, validation.isPerfect]);

  useEffect(() => {
    if (!isLevelEnded || completedLevelIdRef.current === level.id) {
      return;
    }

    completedLevelIdRef.current = level.id;
    onLevelComplete?.({
      elapsedSeconds,
      incorrectAttempts: incorrectAttemptCount,
      isFinalLevel,
      isPassed: validation.isPerfect,
      level,
      levelIndex,
      levelNumber: levelIndex + 1,
      score,
    });
  }, [
    elapsedSeconds,
    incorrectAttemptCount,
    isFinalLevel,
    isLevelEnded,
    level,
    levelIndex,
    onLevelComplete,
    score,
    validation.isPerfect,
  ]);

  function submitMatch(flagId: string, countryId: string) {
    if (isPaused || isMatchLocked(level, playerMatches, flagId)) {
      return;
    }

    const attempt = createMatchAttempt(level, flagId, countryId);

    setPlayerMatches((currentMatches) => applyMatchAttempt(currentMatches, attempt));
    setAttempts((currentAttempts) => ({
      ...currentAttempts,
      [flagId]: {
        ...attempt,
        attemptId: (currentAttempts[flagId]?.attemptId ?? 0) + 1,
      },
    }));

    if (attempt.feedback === 'incorrect') {
      setIncorrectAttemptCount((currentCount) => currentCount + 1);
    }

    playAudioFeedback(attempt.feedback);
    setSelectedCountryId(undefined);
  }

  function handleFlagClick(flagId: string) {
    if (!isPaused && selectedCountryId !== undefined) {
      submitMatch(flagId, selectedCountryId);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, flagId: string) {
    event.preventDefault();

    if (isPaused) {
      return;
    }

    const countryId = event.dataTransfer.getData('text/plain');

    if (countryId.length > 0) {
      submitMatch(flagId, countryId);
    }
  }

  function pauseGame() {
    setIsPaused(true);
  }

  function resumeGame() {
    setIsPaused(false);
  }

  return (
    <section
      aria-labelledby="flag-engine-title"
      className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5"
    >
      <GameplayHud
        currentLevel={levelIndex + 1}
        elapsedSeconds={elapsedSeconds}
        isComplete={validation.isPerfect}
        mode={level.mode}
        onPause={pauseGame}
        score={score.totalScore}
        timeLimitSeconds={level.timeLimitSeconds}
        totalLevels={levels.length}
        validation={validation}
      />

      <AnimatePresence mode="wait">
        <motion.div
          animate="center"
          className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"
          exit="exit"
          initial="enter"
          key={level.id}
          transition={getAnimationTransition(0.24)}
          variants={levelAdvanceVariants}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {boardFlags.map((flag) => {
              const attempt = attempts[flag.id];
              const locked = isMatchLocked(level, playerMatches, flag.id);
              const feedback = locked
                ? getMatchFeedback(level, playerMatches, flag.id)
                : (attempt?.feedback ?? 'pending');

              return (
                <FlagCard
                  key={flag.id}
                  attempt={attempt}
                  feedback={feedback}
                  flag={flag}
                  isLocked={locked}
                  onClick={() => {
                    handleFlagClick(flag.id);
                  }}
                  onDrop={(event) => {
                    handleDrop(event, flag.id);
                  }}
                  selectedCountryName={selectedCountryName}
                />
              );
            })}
          </div>

          <CountryBank
            countries={countryOptions}
            selectedCountryId={selectedCountryId}
            selectedCountryName={selectedCountryName}
            onSelect={setSelectedCountryId}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isPaused ? <PauseModal onQuit={onQuit} onResume={resumeGame} /> : null}
      </AnimatePresence>
    </section>
  );
}

interface PauseModalProps {
  onQuit: () => void;
  onResume: () => void;
}

function PauseModal({ onQuit, onResume }: PauseModalProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-labelledby="pause-title"
      aria-modal="true"
      className="fixed inset-0 z-20 grid place-items-center bg-fcc-background/85 px-4"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
      transition={getAnimationTransition(0.18)}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded border border-fcc-border bg-fcc-surface p-5"
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={getAnimationTransition(0.2)}
      >
        <h2 id="pause-title" className="mt-2 text-2xl font-bold">
          Pause Menu
        </h2>
        <p className="mt-3 text-base text-fcc-muted">
          Resume the current level or quit to return to the home screen.
        </p>
        <div className="mt-5 flex flex-col gap-3 xs:flex-row">
          <button
            className="rounded border border-fcc-cta bg-fcc-cta px-4 py-3 font-mono font-bold text-fcc-background outline-none transition focus-visible:ring-2 focus-visible:ring-focus"
            onClick={onResume}
            type="button"
          >
            Resume
          </button>
          <button
            className="rounded border border-fcc-danger bg-fcc-background px-4 py-3 font-mono font-bold text-fcc-danger outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus"
            onClick={onQuit}
            type="button"
          >
            Quit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getPlayableLevel(levels: GameLevel[], index: number): GameLevel {
  const level = levels[index];

  if (level === undefined) {
    throw new Error(`No playable level exists at index ${String(index)}.`);
  }

  return level;
}

function createCountryOptions(level: GameLevel, levels: GameLevel[]): CountryOption[] {
  const correctCountryIds = new Set(Object.values(level.correctMatches));
  const distractors = getDistractorCountries(levels, correctCountryIds, 3);

  return shuffleItems([...level.countries, ...distractors]);
}

function getDistractorCountries(
  levels: GameLevel[],
  excludedCountryIds: Set<string>,
  count: number,
): CountryOption[] {
  const distractors = new Map<string, CountryOption>();

  for (const level of levels) {
    for (const country of level.countries) {
      if (!excludedCountryIds.has(country.id) && !distractors.has(country.id)) {
        distractors.set(country.id, country);
      }
    }
  }

  return shuffleItems([...distractors.values()]).slice(0, count);
}

function shuffleItems<T>(items: readonly T[]): T[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];
    const swapItem = shuffledItems[swapIndex];

    if (currentItem !== undefined && swapItem !== undefined) {
      shuffledItems[index] = swapItem;
      shuffledItems[swapIndex] = currentItem;
    }
  }

  return shuffledItems;
}
