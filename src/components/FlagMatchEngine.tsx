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
  MatchValidationResult,
  PlayerMatches,
} from '../game/types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { getAnimationTransition, levelAdvanceVariants } from '../utils/animation';
import { CountryBank } from './gameplay/CountryBank';
import { FlagCard } from './gameplay/FlagCard';
import { GameplayHud } from './gameplay/GameplayHud';
import { tutorialStorageKey } from '../utils/progressStorage';

const maxActiveFlags = 4;
const minCountryOptions = 8;
const maxCountryOptions = 10;

interface AttemptConfig {
  countryOptionIds: string[];
  flagIds: string[];
}

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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [attemptConfig, setAttemptConfig] = useState<AttemptConfig>();
  const completedLevelIdRef = useRef<string | undefined>(undefined);
  const playAudioFeedback = useAudioFeedback();
  const level = getPlayableLevel(levels, levelIndex);
  const playableLevel = useMemo(
    () =>
      attemptConfig === undefined
        ? undefined
        : createPlayableLevel(level, attemptConfig.flagIds),
    [attemptConfig, level],
  );
  const boardFlags = useMemo(
    () =>
      playableLevel === undefined
        ? []
        : shuffleItems(playableLevel.flags, `${playableLevel.id}:flags`),
    [playableLevel],
  );
  const countryOptions = useMemo(
    () =>
      attemptConfig === undefined
        ? []
        : createCountryOptions(levels, attemptConfig.countryOptionIds),
    [attemptConfig, levels],
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
    () =>
      playableLevel === undefined
        ? createEmptyValidation()
        : validateMatches(playableLevel, playerMatches),
    [playableLevel, playerMatches],
  );
  const score = calculateLevelScore({
    elapsedSeconds,
    incorrectAttempts: incorrectAttemptCount,
    level: playableLevel ?? level,
    validation,
  });
  const isFinalLevel = levelIndex >= levels.length - 1;
  const isTimeExpired =
    playableLevel?.mode === 'timed' &&
    playableLevel.timeLimitSeconds !== undefined &&
    elapsedSeconds >= playableLevel.timeLimitSeconds &&
    !validation.isPerfect;
  const isLevelEnded = validation.isPerfect || isTimeExpired;

  useEffect(() => {
    setAttemptConfig(createAttemptConfig(level, levels));
  }, [level, levels]);

  useEffect(() => {
    if (window.localStorage.getItem(tutorialStorageKey) !== 'true') {
      setIsTutorialOpen(true);
    }
  }, []);

  useEffect(() => {
    if (playableLevel === undefined || isLevelEnded || isPaused || isTutorialOpen) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isLevelEnded, isPaused, isTutorialOpen, playableLevel]);

  useEffect(() => {
    if (validation.isPerfect) {
      playAudioFeedback('complete');
    }
  }, [playAudioFeedback, validation.isPerfect]);

  useEffect(() => {
    if (
      playableLevel === undefined ||
      !isLevelEnded ||
      completedLevelIdRef.current === playableLevel.id
    ) {
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
    if (playableLevel === undefined) {
      return;
    }

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

  function dismissTutorial() {
    window.localStorage.setItem(tutorialStorageKey, 'true');
    setIsTutorialOpen(false);
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
        mode={playableLevel?.mode ?? level.mode}
        onPause={pauseGame}
        score={score.totalScore}
        timeLimitSeconds={playableLevel?.timeLimitSeconds ?? level.timeLimitSeconds}
        totalLevels={levels.length}
        validation={validation}
      />

      <ShowInstructionsButton
        onShowTutorial={() => {
          setIsTutorialOpen(true);
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          animate="center"
          className="mt-5 grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]"
          exit="exit"
          initial="enter"
          key={playableLevel?.id ?? level.id}
          transition={getAnimationTransition(0.24)}
          variants={levelAdvanceVariants}
        >
          <CountryBank
            countries={availableCountries}
            selectedCountryId={selectedCountryId}
            selectedCountryName={selectedCountryName}
            onSelect={setSelectedCountryId}
          />

          <div aria-label="Flags" className="grid gap-3 sm:grid-cols-2" role="region">
            {boardFlags.map((flag) => {
              const attempt = attempts[flag.id];
              const locked =
                playableLevel !== undefined &&
                isMatchLocked(playableLevel, playerMatches, flag.id);
              const feedback = locked
                ? getMatchFeedback(playableLevel, playerMatches, flag.id)
                : (attempt?.feedback ?? 'pending');

              return (
                <FlagCard
                  key={flag.id}
                  attempt={attempt}
                  answerName={
                    countriesById.get(playableLevel?.correctMatches[flag.id] ?? '')
                      ?.name
                  }
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
            {playableLevel === undefined ? (
              <div className="rounded border border-fcc-border bg-fcc-panel p-4 font-mono text-base text-fcc-muted">
                Preparing flags...
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isPaused ? <PauseModal onQuit={onQuit} onResume={resumeGame} /> : null}
      </AnimatePresence>
      <AnimatePresence>
        {isTutorialOpen ? <TutorialModal onDismiss={dismissTutorial} /> : null}
      </AnimatePresence>
    </section>
  );
}

interface ShowInstructionsButtonProps {
  onShowTutorial: () => void;
}

function ShowInstructionsButton({ onShowTutorial }: ShowInstructionsButtonProps) {
  return (
    <div className="mt-4 flex justify-start">
      <button
        className="rounded border border-fcc-highlight px-3 py-2 font-mono text-base font-bold text-fcc-highlight outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus"
        onClick={onShowTutorial}
        type="button"
      >
        Show Instructions
      </button>
    </div>
  );
}

interface TutorialModalProps {
  onDismiss: () => void;
}

function TutorialModal({ onDismiss }: TutorialModalProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-labelledby="tutorial-title"
      aria-modal="true"
      className="fixed inset-0 z-30 grid place-items-center bg-fcc-background/85 px-4"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onDismiss();
        }
      }}
      role="dialog"
      transition={getAnimationTransition(0.18)}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded border border-fcc-border bg-fcc-surface p-5"
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={getAnimationTransition(0.2)}
      >
        <p className="font-mono text-base text-fcc-highlight">
          Welcome to Flag Frenzy.
        </p>
        <h2 id="tutorial-title" className="mt-2 text-2xl font-bold">
          How to Play
        </h2>
        <p className="mt-3 font-mono text-base text-fcc-muted">
          Match country names to their flags.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 font-mono text-base">
          <li>Select a country from the Countries list.</li>
          <li>Click the matching flag to make a match.</li>
          <li>Or drag a country onto its matching flag.</li>
          <li>Match all flags correctly to complete the level.</li>
        </ol>
        <button
          className="mt-5 rounded bg-fcc-cta px-4 py-2 font-mono font-bold text-fcc-background outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface"
          onClick={onDismiss}
          type="button"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
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

function createEmptyValidation(): MatchValidationResult {
  return {
    correctCount: 0,
    incorrectCount: 0,
    isComplete: false,
    isPerfect: false,
    missingFlagIds: [],
    results: [],
    totalCount: 0,
  };
}

function createAttemptConfig(level: GameLevel, levels: GameLevel[]): AttemptConfig {
  const activeFlags = shuffleItemsRandom(level.flags).slice(0, maxActiveFlags);
  const activeCountryIds = new Set(
    activeFlags.flatMap((flag) => {
      const countryId = level.correctMatches[flag.id];

      return countryId === undefined ? [] : [countryId];
    }),
  );
  const globalCountries = getUniqueCountries(
    levels.flatMap((campaignLevel) => campaignLevel.countries),
  );
  const activeCountryNames = new Set(
    level.countries
      .filter((country) => activeCountryIds.has(country.id))
      .map((country) => country.name),
  );
  const targetOptionCount = Math.min(
    maxCountryOptions,
    Math.max(minCountryOptions, activeCountryIds.size),
    globalCountries.length,
  );
  const selectedCountryIds = [...activeCountryIds];
  const selectedCountryNames = new Set(activeCountryNames);
  const addDistractors = (countries: CountryOption[]) => {
    for (const country of shuffleItemsRandom(countries)) {
      if (selectedCountryIds.length >= targetOptionCount) {
        return;
      }

      if (selectedCountryNames.has(country.name)) {
        continue;
      }

      selectedCountryIds.push(country.id);
      selectedCountryNames.add(country.name);
    }
  };

  addDistractors(level.countries);
  addDistractors(globalCountries);

  return {
    countryOptionIds: shuffleItemsRandom(selectedCountryIds),
    flagIds: activeFlags.map((flag) => flag.id),
  };
}

function createPlayableLevel(
  level: GameLevel,
  selectedFlagIds: readonly string[],
): GameLevel {
  const selectedFlagIdSet = new Set(selectedFlagIds);
  const flags = level.flags.filter((flag) => selectedFlagIdSet.has(flag.id));
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

function createCountryOptions(
  levels: GameLevel[],
  selectedCountryIds: readonly string[],
): CountryOption[] {
  const countriesById = new Map(
    getUniqueCountries(levels.flatMap((level) => level.countries)).map((country) => [
      country.id,
      country,
    ]),
  );

  return selectedCountryIds.flatMap((countryId) => {
    const country = countriesById.get(countryId);

    return country === undefined ? [] : [country];
  });
}

function getUniqueCountries(countries: readonly CountryOption[]): CountryOption[] {
  const countriesByName = new Map<string, CountryOption>();

  for (const country of countries) {
    if (!countriesByName.has(country.name)) {
      countriesByName.set(country.name, country);
    }
  }

  return [...countriesByName.values()];
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

function shuffleItemsRandom<T>(items: readonly T[]): T[] {
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
