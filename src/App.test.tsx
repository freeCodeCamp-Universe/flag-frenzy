import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
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
    expect(screen.getByRole('button', { name: 'Level 9 unlocked' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Level 30 locked' })).toBeDisabled();
  });

  it('matches flags to countries by click and shows feedback', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Canada' }));
    await user.click(screen.getByRole('button', { name: 'Match Flag of Canada' }));

    expect(screen.getByLabelText('correct')).toBeInTheDocument();
    expect(screen.getByText('1/4 correct')).toBeInTheDocument();
  });

  it('renders optional hints for supported flags', () => {
    render(<App />);

    expect(
      screen.getByText('Hint: This island nation uses a red circle on a white field.'),
    ).toBeInTheDocument();
  });
});
