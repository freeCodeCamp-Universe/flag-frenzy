export type GameStatus = 'idle' | 'playing' | 'paused' | 'complete';
export type LevelStatus = 'locked' | 'unlocked' | 'unlocking';
export type LevelMode = 'timed' | 'score';

export interface GameSession {
  lives: number;
  score: number;
  status: GameStatus;
}

export interface HomeLevel {
  accentClassName: string;
  id: string;
  number: number;
  status: LevelStatus;
}

export interface FlagAsset {
  alt: string;
  id: string;
  src: string;
}

export interface CountryOption {
  id: string;
  name: string;
}

export interface LevelHint {
  countryId?: string;
  flagId?: string;
  text: string;
}

export interface GameLevel {
  complexity: number;
  correctMatches: Record<string, string>;
  countries: CountryOption[];
  flags: FlagAsset[];
  hints?: LevelHint[];
  id: string;
  mode: LevelMode;
  optionCount: number;
  targetScore?: number;
  timeLimitSeconds?: number;
}

export type PlayerMatches = Record<string, string>;

export interface MatchResult {
  correctCountryId: string;
  flagId: string;
  isCorrect: boolean;
  selectedCountryId?: string;
}

export interface MatchValidationResult {
  correctCount: number;
  incorrectCount: number;
  isComplete: boolean;
  isPerfect: boolean;
  missingFlagIds: string[];
  results: MatchResult[];
  totalCount: number;
}
