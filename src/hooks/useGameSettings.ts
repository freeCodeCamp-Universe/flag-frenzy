import { useCallback, useEffect, useState } from 'react';

import type { GameSettings } from '../game/types';
import {
  createDefaultSettings,
  loadSettings,
  saveSettings,
} from '../utils/settingsStorage';

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => createDefaultSettings());
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHasLoadedSettings(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSettings) {
      return;
    }

    saveSettings(settings);
  }, [hasLoadedSettings, settings]);

  const updateSettings = useCallback(
    (settingsUpdate: Partial<Omit<GameSettings, 'version'>>) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        ...settingsUpdate,
        version: 1,
      }));
    },
    [],
  );

  const setSoundEffects = useCallback(
    (soundEffects: boolean) => {
      updateSettings({ soundEffects });
    },
    [updateSettings],
  );

  return {
    setSoundEffects,
    settings,
    updateSettings,
  };
}
