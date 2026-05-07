import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';

import {
  applyMatchAttempt,
  createMatchAttempt,
  getHintForFlag,
  getMatchFeedback,
  validateMatches,
} from '../engine/matching';
import type { GameLevel, MatchAttempt, PlayerMatches } from '../game/types';
import { CountryBank } from './gameplay/CountryBank';
import { FlagCard } from './gameplay/FlagCard';
import { GameplayHud } from './gameplay/GameplayHud';

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
  const [revealedHintFlagIds, setRevealedHintFlagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const level = getPlayableLevel(levels, levelIndex);
  const selectedCountryName = level.countries.find(
    (country) => country.id === selectedCountryId,
  )?.name;
  const validation = useMemo(
    () => validateMatches(level, playerMatches),
    [level, playerMatches],
  );
  const score = validation.correctCount * 100;
  const isFinalLevel = levelIndex >= levels.length - 1;

  function resetBoard() {
    setSelectedCountryId(undefined);
    setPlayerMatches({});
    setAttempts({});
    setRevealedHintFlagIds(new Set());
  }

  function submitMatch(flagId: string, countryId: string) {
    const attempt = createMatchAttempt(level, flagId, countryId);

    setPlayerMatches((currentMatches) => applyMatchAttempt(currentMatches, attempt));
    setAttempts((currentAttempts) => ({
      ...currentAttempts,
      [flagId]: {
        ...attempt,
        attemptId: (currentAttempts[flagId]?.attemptId ?? 0) + 1,
      },
    }));
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
        isFinalLevel={isFinalLevel}
        mode={level.mode}
        onNextLevel={handleNextLevel}
        score={score}
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

              return (
                <FlagCard
                  key={flag.id}
                  attempt={attempts[flag.id]}
                  feedback={getMatchFeedback(level, playerMatches, flag.id)}
                  flag={flag}
                  hint={hint}
                  isHintRevealed={isHintRevealed}
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
