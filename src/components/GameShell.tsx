import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router';

import type { AccessibilitySettings } from '../game/types';
import { AccessibilitySettingsPanel } from './AccessibilitySettingsPanel';

type GameShellProps = PropsWithChildren<{
  onAccessibilityChange: (settings: Partial<AccessibilitySettings>) => void;
  settings: AccessibilitySettings;
}>;

export function GameShell({
  children,
  onAccessibilityChange,
  settings,
}: GameShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="relative flex min-h-10 items-center justify-between border-b border-fcc-border pb-3 font-mono text-base">
        <nav aria-label="Primary navigation">
          <Link
            className="font-bold outline-none transition hover:text-fcc-highlight focus-visible:ring-2 focus-visible:ring-focus"
            to="/"
          >
            flag-frenzy
          </Link>
        </nav>
        <div className="relative">
          <button
            aria-expanded={isSettingsOpen}
            className="rounded border border-fcc-border bg-fcc-surface px-3 py-2 font-mono text-base outline-none transition hover:bg-fcc-panel focus-visible:ring-2 focus-visible:ring-focus"
            onClick={() => {
              setIsSettingsOpen((currentValue) => !currentValue);
            }}
            type="button"
          >
            Accessibility
          </button>

          {isSettingsOpen ? (
            <div className="absolute right-0 z-10 mt-2 w-[min(22rem,calc(100vw-2rem))]">
              <AccessibilitySettingsPanel
                settings={settings}
                onChange={onAccessibilityChange}
              />
            </div>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
