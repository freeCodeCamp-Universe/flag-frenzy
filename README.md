# Flag Frenzy

Flag Frenzy is a fast flag-matching game built with Vite, React, TypeScript,
Tailwind CSS, Framer Motion, React Router, and Vitest.

Players match country flags to country names by clicking or dragging country
options onto flag cards. Correct matches lock in. Incorrect matches stay
retryable and apply a scoring penalty. Each board shuffles the flag cards,
shuffles the country bank, and adds extra wrong country options so players have
to identify each flag instead of matching by list order.

## Game Concept

The core loop is simple:

1. Pick a country from the country bank.
2. Match it to the correct flag by clicking a flag card or dragging the country.
3. Build a perfect level clear by locking every flag-country pair.
4. Earn score from correctness and speed.
5. Unlock the next level only after a perfect clear and persist progress locally.

The UI follows freeCodeCamp's dark, high-contrast Command-line Chic style.

## Routes

The app uses React Router for three main pages:

- `/`: centered home screen with Start and Level Select actions
- `/levels`: level select grid with locked/unlocked states and high scores
- `/play?level=N`: active matching board for a campaign level
- `/summary`: result screen after a clear or timed-out attempt

Start opens the next uncompleted level based on saved progress. Level Select
lets players manually choose any unlocked level.

## Flag Matching Logic

Playable levels use the `GameLevel` model:

- `flags`: flag image assets with stable ids
- `countries`: country options with stable ids
- `correctMatches`: map of `flagId -> countryId`

The matching engine is intentionally pure and lives in `src/engine/matching.ts`.
It handles:

- validating level structure
- creating match attempts
- applying correct attempts immutably
- keeping incorrect attempts retryable
- deriving card feedback states

Incorrect attempts do not write into `playerMatches`; only correct answers lock.
This keeps score, completion, and persistence logic clean.

The React board layer shuffles flags and creates the country option bank at
runtime. The option bank includes the correct countries plus distractors from
other campaign levels.

## Scoring

Scoring lives in `src/engine/scoring.ts`.

Score is based on:

- `100` points per correct match
- speed bonus on perfect completion
- penalty for wrong country guesses

The summary screen shows base score, speed, penalty, elapsed time, wrong guesses,
level retries, and final score.

Timed levels end when the timer reaches zero. A timed-out attempt still shows
the summary screen, but it does not record completion, save a high score, or
unlock the next level. The summary button retries the same level. Only a perfect
clear unlocks future levels.

Players can pause during a level. The pause modal lets them resume the current
attempt or quit back to the home screen.

## 30-Level Progression

The campaign data lives in `src/levels/campaign.ts`.

Difficulty ramps by level band:

- Levels 1-10: 3-5 recognizable flags
- Levels 11-20: 5-8 moderate-recognition flags
- Levels 21-25: 8-10 more obscure flags
- Levels 26-30: 10-12 mixed-continent levels

Progression is data-driven and stored in `localStorage` through
`src/utils/progressStorage.ts`.

Persisted progress includes:

- completed level ids
- highest unlocked level
- high scores by level id

Malformed progress is sanitized before use.

Retry counts are session state only. They show how many failed attempts the
player has made for the current level during the active app session.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run checks:

```bash
npm run validate
```

Useful scripts:

- `npm run dev`: start Vite locally
- `npm run build`: typecheck and build production assets
- `npm run preview`: preview the production build
- `npm run test`: run Vitest in watch mode
- `npm run test:run`: run Vitest once
- `npm run typecheck`: run TypeScript project checks
- `npm run lint`: run ESLint with zero warnings
- `npm run format`: format files with Prettier
- `npm run format:check`: check formatting
- `npm run validate`: format check, lint, tests, and build

## Project Structure

```text
src/
  components/      React UI components
  engine/          Pure gameplay, matching, scoring, progression logic
  game/            Shared game types
  hooks/           React hooks
  levels/          Campaign and level data
  state/           Local state defaults
  test/            Test helpers and setup
  utils/           Storage, animation, formatting helpers
```
