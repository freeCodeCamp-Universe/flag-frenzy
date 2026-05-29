import type { PropsWithChildren } from 'react';
import Link from 'next/link';

export function GameShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="relative flex min-h-10 items-center justify-between border-b border-fcc-border pb-3 font-mono text-base">
        <nav aria-label="Primary navigation">
          <Link
            className="font-bold outline-none transition hover:text-fcc-highlight focus-visible:ring-2 focus-visible:ring-focus"
            href="/"
          >
            flag-frenzy
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
