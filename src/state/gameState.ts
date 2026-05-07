import type { GameSession } from '../game/types';

export function createInitialSession(): GameSession {
  return {
    lives: 3,
    score: 0,
    status: 'idle',
  };
}
