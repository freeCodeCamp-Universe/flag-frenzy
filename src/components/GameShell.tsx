import type { PropsWithChildren } from 'react';

import type { GameSession } from '../game/types';

type GameShellProps = PropsWithChildren<{
  game: GameSession;
}>;

export function GameShell({ children, game }: GameShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex min-h-10 items-center justify-between border-b border-fcc-border pb-3 font-mono text-base">
        <span className="font-bold">flag-frenzy</span>
        <span className="text-fcc-muted">status: {game.status}</span>
      </header>
      {children}
    </div>
  );
}
