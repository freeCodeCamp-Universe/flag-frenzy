import { render, screen } from '@testing-library/react';
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
});
