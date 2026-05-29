import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import { GameShell } from '../components/GameShell';
import './globals.css';
import { NextFlagFrenzyProvider } from './FlagFrenzyProvider';

export const metadata: Metadata = {
  description: 'Match flags to countries quickly.',
  title: 'Flag Frenzy',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <NextFlagFrenzyProvider>
          <main className="min-h-screen bg-fcc-background text-fcc-foreground">
            <GameShell>{children}</GameShell>
          </main>
        </NextFlagFrenzyProvider>
      </body>
    </html>
  );
}
