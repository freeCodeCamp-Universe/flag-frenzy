export type GameStatus = 'idle' | 'playing' | 'paused' | 'complete';

export interface GameSession {
  lives: number;
  score: number;
  status: GameStatus;
}
