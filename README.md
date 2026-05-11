# Flag Frenzy

Flag Frenzy is a fast flag-matching game built with Vite, React, TypeScript,
Tailwind CSS, Framer Motion, and Vitest.

Players match country flags to country names by clicking or dragging country
options onto flag cards. Correct matches lock in. Incorrect matches stay
retryable, reveal a hint, and apply a scoring penalty.

## Game Concept

The core loop is simple:

1. Pick a country from the country bank.
2. Match it to the correct flag by clicking a flag card or dragging the country.
3. Build a perfect level clear by locking every flag-country pair.
4. Earn score from correctness, speed, and clearing without hints.
5. Unlock the next level and persist progress locally.

The UI follows freeCodeCamp's dark, high-contrast Command-line Chic style.

## Flag Matching Logic

Playable levels use the `GameLevel` model:

- `flags`: flag image assets with stable ids
- `countries`: country options with stable ids
- `correctMatches`: map of `flagId -> countryId`
- `hints`: optional hints keyed by flag or country

The matching engine is intentionally pure and lives in `src/engine/matching.ts`.
It handles:

- validating level structure
- creating match attempts
- applying correct attempts immutably
- keeping incorrect attempts retryable
- deriving card feedback states
- resolving hints

Incorrect attempts do not write into `playerMatches`; only correct answers lock.
This keeps score, completion, and persistence logic clean.

## Scoring

Scoring lives in `src/engine/scoring.ts`.

Score is based on:

- `100` points per correct match
- speed bonus on perfect completion
- no-hints bonus on perfect completion
- retry penalty for incorrect attempts

The score screen shows the full breakdown: base score, speed, no-hints bonus,
penalty, hints used, elapsed time, retries, and final score.

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
