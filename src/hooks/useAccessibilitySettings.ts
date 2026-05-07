import { useEffect, useState } from 'react';

import type { AccessibilitySettings } from '../game/types';
import {
  defaultAccessibilitySettings,
  fontSizeByScale,
} from '../state/accessibilitySettings';

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    defaultAccessibilitySettings,
  );

  useEffect(() => {
    const previousFontSize = document.documentElement.style.fontSize;

    document.documentElement.style.fontSize = fontSizeByScale[settings.fontScale];

    return () => {
      document.documentElement.style.fontSize = previousFontSize;
    };
  }, [settings.fontScale]);

  function updateSettings(nextSettings: Partial<AccessibilitySettings>) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...nextSettings,
    }));
  }

  return {
    settings,
    updateSettings,
  };
}
