import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';

import {
  applyMatchAttempt,
  createMatchAttempt,
  getHintForFlag,
  getMatchFeedback,
  isMatchLocked,
  validateMatches,
} from '../engine/matching';
import { calculateLevelScore } from '../engine/scoring';
import type { GameLevel, MatchAttempt, PlayerMatches } from '../game/types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { CountryBank } from './gameplay/CountryBank';
import { FlagCard } from './gameplay/FlagCard';
import { GameplayHud } from './gameplay/GameplayHud';
import { LevelSummary } from './gameplay/LevelSummary';

interface FlagMatchEngineProps {
  initialLevelIndex?: number;
  levels: GameLevel[];
}

export interface AttemptState extends MatchAttempt {
  attemptId: number;
}

export function FlagMatchEngine({
  initialLevelIndex = 0,
  levels,
}: FlagMatchEngineProps) {
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex);
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [playerMatches, setPlayerMatches] = useState<PlayerMatches>({});
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [incorrectAttemptCount, setIncorrectAttemptCount] = useState(0);
  const [revealedHintFlagIds, setRevealedHintFlagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const playAudioFeedback = useAudioFeedback();
  const level = getPlayableLevel(levels, levelIndex);
  const selectedCountryName = level.countries.find(
    (country) => country.id === selectedCountryId,
  )?.name;
  const validation = useMemo(
    () => validateMatches(level, playerMatches),
    [level, playerMatches],
  );
  const score = calculateLevelScore({
    elapsedSeconds,
    hintsUsed: revealedHintFlagIds.size,
    incorrectAttempts: incorrectAttemptCount,
    level,
    validation,
  });
  const isFinalLevel = levelIndex >= levels.length - 1;

  useEffect(() => {
    if (validation.isPerfect) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [validation.isPerfect]);

  useEffect(() => {
    if (validation.isPerfect) {
      playAudioFeedback('complete');
    }
  }, [playAudioFeedback, validation.isPerfect]);

  function resetBoard() {
    setSelectedCountryId(undefined);
    setPlayerMatches({});
    setAttempts({});
    setElapsedSeconds(0);
    setIncorrectAttemptCount(0);
    setRevealedHintFlagIds(new Set());
  }

  function submitMatch(flagId: string, countryId: string) {
    if (isMatchLocked(level, playerMatches, flagId)) {
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
      setRevealedHintFlagIds((currentIds) => new Set(currentIds).add(flagId));
    }

    playAudioFeedback(attempt.feedback);
    setSelectedCountryId(undefined);
  }

  function handleFlagClick(flagId: string) {
    if (selectedCountryId !== undefined) {
      submitMatch(flagId, selectedCountryId);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, flagId: string) {
    event.preventDefault();

    const countryId = event.dataTransfer.getData('text/plain');

    if (countryId.length > 0) {
      submitMatch(flagId, countryId);
    }
  }

  function handleNextLevel() {
    if (isFinalLevel) {
      resetBoard();
      return;
    }

    setLevelIndex((currentIndex) => currentIndex + 1);
    resetBoard();
  }

  function revealHint(flagId: string) {
    setRevealedHintFlagIds((currentIds) => new Set(currentIds).add(flagId));
  }

  return (
    <section
      aria-labelledby="flag-engine-title"
      className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5"
    >
      <GameplayHud
        currentLevel={levelIndex + 1}
        isComplete={validation.isPerfect}
        mode={level.mode}
        score={score.totalScore}
        timeLimitSeconds={level.timeLimitSeconds}
        totalLevels={levels.length}
        validation={validation}
      />

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"
          exit={{ opacity: 0, x: -24 }}
          initial={{ opacity: 0, x: 24 }}
          key={level.id}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {level.flags.map((flag) => {
              const hint = getHintForFlag(level, flag.id);
              const isHintRevealed = revealedHintFlagIds.has(flag.id);
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
                  hint={hint}
                  isHintRevealed={isHintRevealed}
                  isLocked={locked}
                  onClick={() => {
                    handleFlagClick(flag.id);
                  }}
                  onDrop={(event) => {
                    handleDrop(event, flag.id);
                  }}
                  onRevealHint={() => {
                    revealHint(flag.id);
                  }}
                  selectedCountryName={selectedCountryName}
                />
              );
            })}
          </div>

          <CountryBank
            countries={level.countries}
            selectedCountryId={selectedCountryId}
            onSelect={setSelectedCountryId}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {validation.isPerfect ? (
          <LevelSummary
            elapsedSeconds={elapsedSeconds}
            hintsUsed={revealedHintFlagIds.size}
            incorrectAttempts={incorrectAttemptCount}
            isFinalLevel={isFinalLevel}
            onNextLevel={handleNextLevel}
            score={score}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function getPlayableLevel(levels: GameLevel[], index: number): GameLevel {
  const level = levels[index];

  if (level === undefined) {
    throw new Error(`No playable level exists at index ${String(index)}.`);
  }

  return level;
}
