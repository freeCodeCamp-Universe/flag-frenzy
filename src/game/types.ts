export type GameStatus = 'idle' | 'playing' | 'paused' | 'complete';
export type LevelStatus = 'locked' | 'unlocked' | 'unlocking';

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
