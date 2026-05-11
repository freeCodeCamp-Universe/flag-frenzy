import type { AccessibilitySettings } from '../game/types';

export const defaultAccessibilitySettings: AccessibilitySettings = {
  animationSpeed: 'standard',
  fontScale: 'standard',
};

export const fontSizeByScale: Record<AccessibilitySettings['fontScale'], string> = {
  'extra-large': '22px',
  large: '20px',
  standard: '18px',
};
