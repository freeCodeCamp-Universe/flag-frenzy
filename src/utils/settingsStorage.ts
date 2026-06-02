import type { GameSettings } from '../game/types';

export const settingsStorageKey = 'flag-frenzy:settings:v1';

export function createDefaultSettings(): GameSettings {
  return {
    colorBlindMode: false,
    musicEnabled: false,
    reducedMotion: false,
    soundEffects: true,
    version: 1,
  };
}

export function loadSettings(storage: Storage = window.localStorage): GameSettings {
  const rawSettings = storage.getItem(settingsStorageKey);

  if (rawSettings === null) {
    return createDefaultSettings();
  }

  try {
    return sanitizeSettings(JSON.parse(rawSettings));
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(
  settings: GameSettings,
  storage: Storage = window.localStorage,
): void {
  storage.setItem(settingsStorageKey, JSON.stringify(sanitizeSettings(settings)));
}

export function sanitizeSettings(value: unknown): GameSettings {
  const defaultSettings = createDefaultSettings();

  if (typeof value !== 'object' || value === null) {
    return defaultSettings;
  }

  const settings = value as Record<string, unknown>;

  if (settings.version !== 1) {
    return defaultSettings;
  }

  return {
    colorBlindMode:
      typeof settings.colorBlindMode === 'boolean'
        ? settings.colorBlindMode
        : defaultSettings.colorBlindMode,
    musicEnabled:
      typeof settings.musicEnabled === 'boolean'
        ? settings.musicEnabled
        : defaultSettings.musicEnabled,
    reducedMotion:
      typeof settings.reducedMotion === 'boolean'
        ? settings.reducedMotion
        : defaultSettings.reducedMotion,
    soundEffects:
      typeof settings.soundEffects === 'boolean'
        ? settings.soundEffects
        : defaultSettings.soundEffects,
    version: 1,
  };
}
