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

const maxActiveFlags = 4;

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
  const playableLevel = useMemo(() => createPlayableLevel(level), [level]);
  const boardFlags = useMemo(
    () => shuffleItems(playableLevel.flags, `${playableLevel.id}:flags`),
    [playableLevel],
  );
  const countryOptions = useMemo(
    () => createCountryOptions(playableLevel, levels),
    [playableLevel, levels],
  );
  const countriesById = useMemo(
    () => new Map(countryOptions.map((country) => [country.id, country])),
    [countryOptions],
  );
  const matchedCountryIds = useMemo(
    () => new Set(Object.values(playerMatches)),
    [playerMatches],
  );
  const availableCountries = useMemo(
    () => countryOptions.filter((country) => !matchedCountryIds.has(country.id)),
    [countryOptions, matchedCountryIds],
  );
  const selectedCountryName = countryOptions.find(
    (country) => country.id === selectedCountryId,
  )?.name;
  const validation = useMemo(
    () => validateMatches(playableLevel, playerMatches),
    [playableLevel, playerMatches],
  );
  const score = calculateLevelScore({
    elapsedSeconds,
    incorrectAttempts: incorrectAttemptCount,
    level: playableLevel,
    validation,
  });
  const isFinalLevel = levelIndex >= levels.length - 1;
  const isTimeExpired =
    playableLevel.mode === 'timed' &&
    playableLevel.timeLimitSeconds !== undefined &&
    elapsedSeconds >= playableLevel.timeLimitSeconds &&
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
    if (!isLevelEnded || completedLevelIdRef.current === playableLevel.id) {
      return;
    }

    completedLevelIdRef.current = playableLevel.id;
    onLevelComplete?.({
      elapsedSeconds,
      incorrectAttempts: incorrectAttemptCount,
      isFinalLevel,
      isPassed: validation.isPerfect,
      level: playableLevel,
      levelIndex,
      levelNumber: levelIndex + 1,
      score,
    });
  }, [
    elapsedSeconds,
    incorrectAttemptCount,
    isFinalLevel,
    isLevelEnded,
    levelIndex,
    onLevelComplete,
    playableLevel,
    score,
    validation.isPerfect,
  ]);

  function submitMatch(flagId: string, countryId: string) {
    if (isPaused || isMatchLocked(playableLevel, playerMatches, flagId)) {
      return;
    }

    const attempt = createMatchAttempt(playableLevel, flagId, countryId);

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
        activeCorrectCount={validation.correctCount}
        activeTotalCount={validation.totalCount}
        currentLevel={levelIndex + 1}
        elapsedSeconds={elapsedSeconds}
        isComplete={validation.isPerfect}
        mode={playableLevel.mode}
        onPause={pauseGame}
        score={score.totalScore}
        timeLimitSeconds={playableLevel.timeLimitSeconds}
        totalLevels={levels.length}
        validation={validation}
      />

      <AnimatePresence mode="wait">
        <motion.div
          animate="center"
          className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"
          exit="exit"
          initial="enter"
          key={playableLevel.id}
          transition={getAnimationTransition(0.24)}
          variants={levelAdvanceVariants}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {boardFlags.map((flag) => {
              const attempt = attempts[flag.id];
              const locked = isMatchLocked(playableLevel, playerMatches, flag.id);
              const feedback = locked
                ? getMatchFeedback(playableLevel, playerMatches, flag.id)
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
                  revealedCountryName={
                    locked
                      ? countriesById.get(playableLevel.correctMatches[flag.id] ?? '')
                          ?.name
                      : undefined
                  }
                  selectedCountryName={selectedCountryName}
                />
              );
            })}
          </div>

          <CountryBank
            countries={availableCountries}
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

function createPlayableLevel(level: GameLevel): GameLevel {
  const flags = level.flags.slice(0, maxActiveFlags);
  const flagIds = new Set(flags.map((flag) => flag.id));
  const correctCountryIds = new Set(
    flags.flatMap((flag) => {
      const countryId = level.correctMatches[flag.id];

      return countryId === undefined ? [] : [countryId];
    }),
  );
  const countries = level.countries.filter((country) =>
    correctCountryIds.has(country.id),
  );
  const correctMatches = Object.fromEntries(
    Object.entries(level.correctMatches).filter(([flagId]) => flagIds.has(flagId)),
  );

  return {
    ...level,
    countries,
    correctMatches,
    flags,
    optionCount: countries.length,
    targetScore:
      level.mode === 'score' && level.targetScore !== undefined
        ? countries.length * 125
        : undefined,
  };
}

function createCountryOptions(level: GameLevel, levels: GameLevel[]): CountryOption[] {
  const correctCountryIds = new Set(Object.values(level.correctMatches));
  const distractors = getDistractorCountries(levels, correctCountryIds, 3);

  return shuffleItems(
    [...level.countries, ...distractors],
    `${level.id}:${level.flags.map((flag) => flag.id).join(':')}:countries`,
  );
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

  return shuffleItems([...distractors.values()], 'campaign:distractors').slice(
    0,
    count,
  );
}

function shuffleItems<T>(items: readonly T[], seed: string): T[] {
  const shuffledItems = [...items];
  const nextRandom = createSeededRandom(seed);

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    const currentItem = shuffledItems[index];
    const swapItem = shuffledItems[swapIndex];

    if (currentItem !== undefined && swapItem !== undefined) {
      shuffledItems[index] = swapItem;
      shuffledItems[swapIndex] = currentItem;
    }
  }

  return shuffledItems;
}

function createSeededRandom(seed: string) {
  let state = 0x811c9dc5;

  for (const character of seed) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 0x01000193);
  }

  return () => {
    state += 0x6d2b79f5;
    let nextState = state;
    nextState = Math.imul(nextState ^ (nextState >>> 15), nextState | 1);
    nextState ^= nextState + Math.imul(nextState ^ (nextState >>> 7), nextState | 61);

    return ((nextState ^ (nextState >>> 14)) >>> 0) / 4294967296;
  };
}
