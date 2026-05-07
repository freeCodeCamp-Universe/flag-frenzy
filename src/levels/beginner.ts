import type { GameLevel } from '../game/types';

export const beginnerLevel: GameLevel = {
  complexity: 1,
  countries: [
    { id: 'country-canada', name: 'Canada' },
    { id: 'country-japan', name: 'Japan' },
    { id: 'country-brazil', name: 'Brazil' },
    { id: 'country-france', name: 'France' },
  ],
  correctMatches: {
    'flag-canada': 'country-canada',
    'flag-japan': 'country-japan',
    'flag-brazil': 'country-brazil',
    'flag-france': 'country-france',
  },
  flags: [
    {
      alt: 'Flag of Canada',
      id: 'flag-canada',
      src: 'https://flagcdn.com/w320/ca.png',
    },
    {
      alt: 'Flag of Japan',
      id: 'flag-japan',
      src: 'https://flagcdn.com/w320/jp.png',
    },
    {
      alt: 'Flag of Brazil',
      id: 'flag-brazil',
      src: 'https://flagcdn.com/w320/br.png',
    },
    {
      alt: 'Flag of France',
      id: 'flag-france',
      src: 'https://flagcdn.com/w320/fr.png',
    },
  ],
  hints: [
    {
      countryId: 'country-japan',
      text: 'This island nation uses a red circle on a white field.',
    },
  ],
  id: 'beginner-01',
  mode: 'timed',
  optionCount: 4,
  timeLimitSeconds: 45,
};
