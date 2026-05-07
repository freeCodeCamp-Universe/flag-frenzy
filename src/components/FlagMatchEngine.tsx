import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';

import {
  applyMatchAttempt,
  createMatchAttempt,
  getHintForFlag,
  getMatchFeedback,
  validateMatches,
} from '../engine/matching';
import type {
  CountryOption,
  FlagAsset,
  GameLevel,
  MatchAttempt,
  MatchFeedback,
  PlayerMatches,
} from '../game/types';

interface FlagMatchEngineProps {
  level: GameLevel;
}

interface AttemptState extends MatchAttempt {
  attemptId: number;
}

export function FlagMatchEngine({ level }: FlagMatchEngineProps) {
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [playerMatches, setPlayerMatches] = useState<PlayerMatches>({});
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const validation = useMemo(
    () => validateMatches(level, playerMatches),
    [level, playerMatches],
  );

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

  return (
    <section
      aria-labelledby="flag-engine-title"
      className="rounded border border-fcc-border bg-fcc-surface p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 border-b border-fcc-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-base text-fcc-highlight">live round</p>
          <h2 id="flag-engine-title" className="text-2xl font-bold">
            Match flags
          </h2>
        </div>
        <p className="font-mono text-base text-fcc-muted">
          {validation.correctCount}/{validation.totalCount} correct
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-3 sm:grid-cols-2">
          {level.flags.map((flag) => (
            <FlagCard
              key={flag.id}
              attempt={attempts[flag.id]}
              feedback={getMatchFeedback(level, playerMatches, flag.id)}
              flag={flag}
              hint={getHintForFlag(level, flag.id)}
              onClick={() => {
                handleFlagClick(flag.id);
              }}
              onDrop={(event) => {
                handleDrop(event, flag.id);
              }}
            />
          ))}
        </div>

        <CountryBank
          countries={level.countries}
          selectedCountryId={selectedCountryId}
          onSelect={setSelectedCountryId}
        />
      </div>
    </section>
  );
}

interface FlagCardProps {
  attempt?: AttemptState;
  feedback: MatchFeedback;
  flag: FlagAsset;
  hint?: string;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
}

function FlagCard({ attempt, feedback, flag, hint, onClick, onDrop }: FlagCardProps) {
  const isCorrect = feedback === 'correct';
  const isIncorrect = feedback === 'incorrect';

  return (
    <motion.button
      animate={
        isIncorrect
          ? { x: [0, -8, 8, -4, 4, 0] }
          : isCorrect
            ? { scale: [1, 1.03, 1] }
            : { x: 0, scale: 1 }
      }
      aria-label={`Match ${flag.alt}`}
      className={[
        'min-h-64 rounded border bg-fcc-panel p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface',
        isCorrect ? 'border-fcc-success' : '',
        isIncorrect ? 'border-fcc-danger' : '',
        feedback === 'pending' ? 'border-fcc-border' : '',
      ].join(' ')}
      key={`${flag.id}-${String(attempt?.attemptId ?? 0)}`}
      onClick={onClick}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={onDrop}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      type="button"
    >
      <img
        alt={flag.alt}
        className="h-36 w-full rounded border border-fcc-border bg-fcc-background object-contain p-2"
        src={flag.src}
      />
      <div className="mt-3 flex min-h-8 items-center justify-between gap-3 font-mono">
        <span className="text-base text-fcc-muted">{feedback}</span>
        {isCorrect ? (
          <motion.span
            animate={{ opacity: 1, scale: 1 }}
            aria-label="correct"
            className="grid size-8 place-items-center rounded bg-fcc-success font-bold text-fcc-background"
            initial={{ opacity: 0, scale: 0.3 }}
          >
            ✓
          </motion.span>
        ) : null}
      </div>
      {hint === undefined ? null : (
        <p className="mt-3 border-t border-fcc-border pt-3 text-base text-fcc-muted">
          Hint: {hint}
        </p>
      )}
    </motion.button>
  );
}

interface CountryBankProps {
  countries: CountryOption[];
  onSelect: (countryId: string) => void;
  selectedCountryId?: string;
}

function CountryBank({ countries, onSelect, selectedCountryId }: CountryBankProps) {
  return (
    <aside
      aria-label="Country options"
      className="rounded border border-fcc-border p-3"
    >
      <h3 className="font-mono text-xl font-bold">Countries</h3>
      <div className="mt-3 grid gap-2">
        {countries.map((country) => {
          const isSelected = country.id === selectedCountryId;

          return (
            <motion.button
              className={[
                'rounded border px-3 py-3 text-left font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface',
                isSelected
                  ? 'border-fcc-cta bg-fcc-cta text-fcc-background'
                  : 'border-fcc-border bg-fcc-background text-fcc-foreground',
              ].join(' ')}
              draggable
              key={country.id}
              onClick={() => {
                onSelect(country.id);
              }}
              onDragStartCapture={(event) => {
                event.dataTransfer.setData('text/plain', country.id);
              }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              {country.name}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
