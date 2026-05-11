import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { createMemoryStorage } from './test/createMemoryStorage';
import { progressStorageKey } from './utils/progressStorage';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    window.history.pushState({}, '', '/');
  });

  it('renders the Flag Frenzy home screen', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Flag Frenzy' })).toBeInTheDocument();
    expect(screen.getByText('Match flags to countries quickly')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Level Select' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Accessibility' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Levels' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Level 1 unlocked' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('status: idle')).not.toBeInTheDocument();
  });

  it('opens level select and renders locked and unlocked states', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Level Select' }));

    expect(screen.getByRole('heading', { name: 'Levels' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Level \d+/ })).toHaveLength(30);
    expect(screen.getByRole('button', { name: 'Level 1 unlocked' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Level 2 locked' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Level 30 locked' })).toBeDisabled();
  });

  it('starts a selected unlocked level from level select', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Level Select' }));
    await user.click(screen.getByRole('button', { name: 'Level 1 unlocked' }));

    expect(screen.getByText('level 1/30 / timed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument();
  });

  it('matches flags to countries by click and shows feedback', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByText('level 1/30 / timed')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Canada' }));

    expect(screen.getByText('Canada selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Canada' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByLabelText('correct')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByLabelText('Score: 100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeDisabled();
  });

  it('starts the next uncompleted level from saved progress', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        completedLevelIds: ['level-01'],
        highScores: {
          'level-01': 400,
        },
        highestUnlockedLevel: 2,
        version: 1,
      }),
    );

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByText('level 2/30 / timed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'United States' })).toBeInTheDocument();
  });

  it('keeps incorrect matches retryable and reveals a hint', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    await user.click(screen.getByRole('button', { name: 'Japan' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByText('incorrect')).toBeInTheDocument();
    expect(
      screen.getByText('Hint: The maple leaf is the giveaway.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Not quite. Use the hint and try another country.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 0/4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeDisabled();
  });

  it('matches flags to countries by drag and drop', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(screen.getByRole('button', { name: 'Canada' }), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByRole('button', { name: 'Match Flag of Canada' }), {
      dataTransfer,
    });

    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeDisabled();
  });

  it('reveals optional hints on demand', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(
      screen.queryByText('Hint: The maple leaf is the giveaway.'),
    ).not.toBeInTheDocument();

    const firstHintButton = screen.getAllByRole('button', { name: 'Hint' })[0];

    if (firstHintButton === undefined) {
      throw new Error('Expected at least one hint button.');
    }

    await user.click(firstHintButton);

    expect(
      screen.getByText('Hint: The maple leaf is the giveaway.'),
    ).toBeInTheDocument();
  });

  it('advances to the next level after a perfect round', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));
    await user.click(screen.getByRole('button', { name: 'Japan' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Japan' }));
    await user.click(screen.getByRole('button', { name: 'Brazil' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Brazil' }));
    await user.click(screen.getByRole('button', { name: 'France' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of France' }));

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).toContain('level-01');

    await user.click(screen.getByRole('button', { name: 'Next Level' }));

    expect(await screen.findByText('level 2/30 / timed')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'United States' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'flag-frenzy' }));
    await user.click(screen.getByRole('button', { name: 'Level Select' }));

    expect(screen.getByRole('button', { name: 'Level 2 unlocked' })).toBeEnabled();
  });
});

function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>();

  return {
    clearData: (format?: string) => {
      if (format === undefined) {
        store.clear();
        return;
      }

      store.delete(format);
    },
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [] as unknown as FileList,
    getData: (format: string) => store.get(format) ?? '',
    items: [] as unknown as DataTransferItemList,
    setData: (format: string, data: string) => {
      store.set(format, data);
    },
    setDragImage: () => undefined,
    types: [],
  };
}
