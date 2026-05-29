import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { campaignLevels } from './levels/campaign';
import { createMemoryStorage } from './test/createMemoryStorage';
import { progressStorageKey } from './utils/progressStorage';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(getActiveFlagButtons()).toHaveLength(4);
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
    const countryButtonNames = countryButtons.map((button) => button.textContent);
    const activeFlagNames = getActiveFlagNames();
    const selectedCountryName = activeFlagNames[0];

    if (selectedCountryName === undefined) {
      throw new Error('Expected at least one active flag.');
    }

    expect(countriesPanel.getByText(selectedCountryName)).toBeInTheDocument();
    expect(countryButtons).toHaveLength(8);
    expect(countryButtonNames).toEqual(expect.arrayContaining(activeFlagNames));
    expect(
      countryButtonNames.filter((name) => !activeFlagNames.includes(name)),
    ).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: selectedCountryName }));

    expect(screen.getByText(`${selectedCountryName} selected`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: selectedCountryName })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(
      screen.getByRole('button', { name: `Match Flag of ${selectedCountryName}` }),
    );

    expect(screen.getByLabelText('correct')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(screen.getByLabelText('Score: 100')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Match Flag of ${selectedCountryName}` }),
    ).toBeDisabled();
    expect(screen.queryByText('locked')).not.toBeInTheDocument();
    expect(screen.getAllByText(selectedCountryName).length).toBeGreaterThan(0);
    expect(countriesPanel.queryByText(selectedCountryName)).not.toBeInTheDocument();
  });

  it('fills small levels with global distractor countries', () => {
    window.history.pushState({}, '', '/play?level=2');

    render(<App />);

    const activeFlagNames = getActiveFlagNames();
    const countryPanelNames = getCountryPanelNames();

    expect(activeFlagNames).toHaveLength(4);
    expect(countryPanelNames).toHaveLength(8);
    expect(countryPanelNames).toEqual(expect.arrayContaining(activeFlagNames));
    expect(
      countryPanelNames.filter((name) => !activeFlagNames.includes(name)),
    ).toHaveLength(4);
    expect(new Set(countryPanelNames).size).toBe(countryPanelNames.length);
  });

  it('shows distractor countries without duplicating panel options', () => {
    window.history.pushState({}, '', '/play?level=11');

    render(<App />);

    const activeFlagNames = getActiveFlagNames();
    const countryPanelNames = getCountryPanelNames();

    expect(activeFlagNames).toHaveLength(4);
    expect(countryPanelNames.length).toBeGreaterThanOrEqual(8);
    expect(countryPanelNames.length).toBeLessThanOrEqual(10);
    expect(countryPanelNames).toEqual(expect.arrayContaining(activeFlagNames));
    expect(
      countryPanelNames.filter((name) => !activeFlagNames.includes(name)).length,
    ).toBeGreaterThanOrEqual(4);
    expect(new Set(countryPanelNames).size).toBe(countryPanelNames.length);
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
    expect(getActiveFlagButtons()).toHaveLength(4);
  });

  it('keeps incorrect matches retryable', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const targetCountryName = getActiveFlagNames()[0];
    const wrongCountryName = getCountryPanelNames().find(
      (countryName) => countryName !== targetCountryName,
    );

    if (targetCountryName === undefined || wrongCountryName === undefined) {
      throw new Error('Expected a target flag and a wrong country option.');
    }

    await user.click(screen.getByRole('button', { name: wrongCountryName }));
    await user.click(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
    );

    expect(screen.getByText('incorrect')).toBeInTheDocument();
    expect(screen.getByText('Not quite. Try another country.')).toBeInTheDocument();
    expect(
      within(screen.getByRole('complementary', { name: 'Countries' })).getByText(
        targetCountryName,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hint' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Correct: 0/4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
    ).toBeEnabled();

    await user.click(screen.getByRole('button', { name: targetCountryName }));
    await user.click(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
    );

    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
    ).toBeDisabled();
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
    const targetCountryName = getActiveFlagNames()[0];

    if (targetCountryName === undefined) {
      throw new Error('Expected at least one active flag.');
    }

    fireEvent.dragStart(screen.getByRole('button', { name: targetCountryName }), {
      dataTransfer,
    });
    fireEvent.drop(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
      {
        dataTransfer,
      },
    );

    expect(screen.getByLabelText('Correct: 1/4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Match Flag of ${targetCountryName}` }),
    ).toBeDisabled();
  });

  it('completes level two after the first four active flags', async () => {
    const user = userEvent.setup();

    window.history.pushState({}, '', '/play?level=2');

    render(<App />);

    expect(screen.getByText('level 2/30 / timed')).toBeInTheDocument();
    expect(getActiveFlagButtons()).toHaveLength(4);
    expect(new Set(getActiveFlagNames()).size).toBe(4);
    expect(getCountryPanelNames()).toEqual(
      expect.arrayContaining(getActiveFlagNames()),
    );
    expect(getCountryPanelNames()).toHaveLength(8);

    await completeActiveFlags(user);

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).toContain('level-02');
    expect(screen.queryByLabelText('Correct: 0/1')).not.toBeInTheDocument();
  });

  it('keeps active flags stable during an attempt', async () => {
    const user = userEvent.setup();

    window.history.pushState({}, '', '/play?level=2');

    render(<App />);

    const initialFlagNames = getActiveFlagNames();
    const firstCountryName = initialFlagNames[0];
    const secondFlagButton = getActiveFlagButtons()[1];

    if (firstCountryName === undefined || secondFlagButton === undefined) {
      throw new Error('Expected at least two active flags.');
    }

    await user.click(screen.getByRole('button', { name: firstCountryName }));
    await user.click(secondFlagButton);

    expect(getActiveFlagNames()).toEqual(initialFlagNames);
  });

  it('selects active flags from the full level pool', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    window.history.pushState({}, '', '/play?level=1');

    render(<App />);

    await waitFor(() => {
      expect(getActiveFlagButtons()).toHaveLength(4);
    });

    const firstFourLevelOneNames =
      campaignLevels[0]?.countries.slice(0, 4).map((country) => country.name) ?? [];

    expect(getActiveFlagNames()).not.toEqual(
      expect.arrayContaining(firstFourLevelOneNames),
    );

    randomSpy.mockRestore();
  });

  it('can select a different flag set when replaying a level', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    window.history.pushState({}, '', '/play?level=1');

    const firstRender = render(<App />);

    await waitFor(() => {
      expect(getActiveFlagButtons()).toHaveLength(4);
    });

    const firstFlagNames = getActiveFlagNames();
    firstRender.unmount();
    randomSpy.mockReturnValue(0.99);
    window.history.pushState({}, '', '/play?level=1');

    render(<App />);

    await waitFor(() => {
      expect(getActiveFlagButtons()).toHaveLength(4);
    });

    expect(getActiveFlagNames()).not.toEqual(firstFlagNames);
  });

  it('keeps country options stable and only removes correct matches', async () => {
    const user = userEvent.setup();

    window.history.pushState({}, '', '/play?level=11');

    render(<App />);

    const initialFlagNames = getActiveFlagNames();
    const initialCountryNames = getCountryPanelNames();
    const targetFlagName = initialFlagNames[0];
    const distractorName = initialCountryNames.find(
      (countryName) => !initialFlagNames.includes(countryName),
    );

    if (targetFlagName === undefined || distractorName === undefined) {
      throw new Error('Expected active and distractor country options.');
    }

    await user.click(screen.getByRole('button', { name: distractorName }));
    await user.click(
      screen.getByRole('button', { name: `Match Flag of ${targetFlagName}` }),
    );

    expect(getCountryPanelNames()).toEqual(initialCountryNames);
    expect(getActiveFlagNames()).toEqual(initialFlagNames);

    await user.click(screen.getByRole('button', { name: targetFlagName }));
    await user.click(
      screen.getByRole('button', { name: `Match Flag of ${targetFlagName}` }),
    );

    expect(getCountryPanelNames()).not.toContain(targetFlagName);
    expect(getCountryPanelNames()).toContain(distractorName);
  });

  it('completes a level while distractor countries are still visible', async () => {
    const user = userEvent.setup();

    window.history.pushState({}, '', '/play?level=11');

    render(<App />);

    expect(getActiveFlagButtons()).toHaveLength(4);
    expect(getCountryPanelNames().length).toBeGreaterThanOrEqual(8);

    await completeActiveFlags(user);

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Correct: 0/1')).not.toBeInTheDocument();
  });

  it('advances to the next level after a perfect round', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    await completeActiveFlags(user);

    expect(
      await screen.findByRole('heading', { name: 'Level Summary' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('flag-frenzy:progress:v1')).toContain('level-01');

    await user.click(screen.getByRole('button', { name: 'Next Level' }));

    expect(await screen.findByText('level 2/30 / timed')).toBeInTheDocument();
    expect(getActiveFlagButtons()).toHaveLength(4);

    await user.click(screen.getByRole('link', { name: 'flag-frenzy' }));
    await user.click(screen.getByRole('button', { name: 'Level Select' }));

    expect(screen.getByRole('button', { name: 'Level 2 unlocked' })).toBeEnabled();
  });
});

function getActiveFlagButtons(): HTMLButtonElement[] {
  return screen.getAllByRole<HTMLButtonElement>('button', {
    name: /^Match Flag of /,
  });
}

function getActiveFlagNames(): string[] {
  return getActiveFlagButtons().map((button) => {
    const countryName = button
      .getAttribute('aria-label')
      ?.replace('Match Flag of ', '');

    if (countryName === undefined) {
      throw new Error('Active flag button is missing an accessible country name.');
    }

    return countryName;
  });
}

function getCountryPanelNames(): string[] {
  return within(screen.getByRole('complementary', { name: 'Countries' }))
    .getAllByRole('button')
    .map((button) => button.textContent);
}

function getIncompleteFlagButtons(): HTMLButtonElement[] {
  return getActiveFlagButtons().filter((button) => !button.disabled);
}

async function completeActiveFlags(user: ReturnType<typeof userEvent.setup>) {
  const flagButtons = getIncompleteFlagButtons();

  for (const flagButton of flagButtons) {
    const countryName = flagButton
      .getAttribute('aria-label')
      ?.replace('Match Flag of ', '');

    if (countryName === undefined) {
      throw new Error('Active flag button is missing an accessible country name.');
    }

    await user.click(screen.getByRole('button', { name: countryName }));
    await user.click(flagButton);
  }
}

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
