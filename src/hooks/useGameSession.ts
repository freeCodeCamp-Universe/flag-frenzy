import { useMemo } from 'react';

import { createInitialSession } from '../state/gameState';

export function useGameSession() {
  return useMemo(() => createInitialSession(), []);
}
