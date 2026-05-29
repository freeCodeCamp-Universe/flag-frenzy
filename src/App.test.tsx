import {
  fireEvent,
  render,
  screen,
  act,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { createMemoryStorage } from './test/createMemoryStorage';
import { progressStorageKey } from './utils/progressStorage';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('renders level select when opened directly at /levels', () => {
    window.history.pushState({}, '', '/levels');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Levels' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Level \d+/ })).toHaveLength(30);
  });

  it('points primary navigation at the home route', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'flag-frenzy' })).toHaveAttribute(
      'href',
      '/',
    );
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
    expect(screen.getByRole('heading', { name: 'Countries' })).toBeInTheDocument();
    const countriesPanel = within(
      screen.getByRole('complementary', { name: 'Countries' }),
    );
    const countryButtons = countriesPanel.getAllByRole('button');
    const levelOneCountryNames = new Set(['Canada', 'Japan', 'Brazil', 'France']);

    expect(countriesPanel.getByText('Canada')).toBeInTheDocument();
    expect(countryButtons.length).toBeGreaterThan(levelOneCountryNames.size);
    expect(
      countryButtons.some((button) => !levelOneCountryNames.has(button.textContent)),
    ).toBe(true);

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
    expect(screen.queryByText('locked')).not.toBeInTheDocument();
    expect(screen.getAllByText('Canada').length).toBeGreaterThan(0);
    expect(countriesPanel.queryByText('Canada')).not.toBeInTheDocument();
  });

  it('shuffles in extra wrong country options on the game board', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const countryButtons = within(
      screen.getByRole('complementary', { name: 'Countries' }),
    ).getAllByRole('button');
    const levelOneCountryNames = new Set(['Canada', 'Japan', 'Brazil', 'France']);

    expect(countryButtons.length).toBeGreaterThan(levelOneCountryNames.size);
    expect(
      countryButtons.some((button) => !levelOneCountryNames.has(button.textContent)),
    ).toBe(true);
  });

  it('pauses, resumes, and quits from the pause modal', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getByRole('dialog', { name: 'Pause Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quit' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resume' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Pause Menu' }),
    );
    expect(screen.getByText('level 1/30 / timed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Quit' }));

    expect(screen.getByRole('heading', { name: 'Flag Frenzy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
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

  it('keeps incorrect matches retryable', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    await user.click(screen.getByRole('button', { name: 'Japan' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByText('incorrect')).toBeInTheDocument();
    expect(screen.getByText('Not quite. Try another country.')).toBeInTheDocument();
    expect(
      within(screen.getByRole('complementary', { name: 'Countries' })).getByText(
        'Canada',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hint' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 0/4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match Flag of Canada' })).toBeDisabled();
  });

  it('shows summary on timeout without unlocking the next level', async () => {
    vi.useFakeTimers();

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    vi.useRealTimers();

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByText('time expired')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Level' })).toBeInTheDocument();
    expect(screen.getByLabelText('Retries: 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrong guesses: 0')).toBeInTheDocument();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).not.toContain('level-01');

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Level' }));
    expect(screen.getByText('level 1/30 / timed')).toBeInTheDocument();
    expect(
      within(screen.getByRole('complementary', { name: 'Countries' })).getByText(
        'Canada',
      ),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    vi.useRealTimers();

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Retries: 2')).toBeInTheDocument();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).not.toContain('level-01');

    fireEvent.click(screen.getByRole('link', { name: 'flag-frenzy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Level Select' }));

    expect(screen.getByRole('button', { name: 'Level 2 locked' })).toBeDisabled();
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
    expect(
      within(screen.getByRole('complementary', { name: 'Countries' })).getByText(
        'United States',
      ),
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
