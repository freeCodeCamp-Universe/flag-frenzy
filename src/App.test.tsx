import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  it('renders the Flag Frenzy home screen', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Flag Frenzy' })).toBeInTheDocument();
    expect(screen.getByText('Match flags to countries quickly')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Level Select' })).toBeInTheDocument();
  });

  it('renders thirty levels with locked and unlocked states', () => {
    render(<App />);

    expect(screen.getAllByRole('button', { name: /Level \d+/ })).toHaveLength(30);
    expect(screen.getByRole('button', { name: 'Level 1 unlocked' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Level 2 locked' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Level 30 locked' })).toBeDisabled();
  });

  it('matches flags to countries by click and shows feedback', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText('level 1/30 / timed')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByLabelText('correct')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByLabelText('Score: 100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeDisabled();
  });

  it('keeps incorrect matches retryable and reveals a hint', async () => {
    const user = userEvent.setup();

    render(<App />);

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

  it('matches flags to countries by drag and drop', () => {
    render(<App />);

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

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));
    await user.click(screen.getByRole('button', { name: 'Japan' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Japan' }));
    await user.click(screen.getByRole('button', { name: 'Brazil' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Brazil' }));
    await user.click(screen.getByRole('button', { name: 'France' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of France' }));
    await user.click(screen.getByRole('button', { name: 'Next Level' }));

    expect(await screen.findByText('level 2/30 / timed')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'United States' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Level 2 unlocked' })).toBeEnabled();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).toContain('level-01');
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

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}
