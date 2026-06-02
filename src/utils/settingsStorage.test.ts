import { describe, expect, it } from 'vitest';

import { createMemoryStorage } from '../test/createMemoryStorage';
import {
  createDefaultSettings,
  loadSettings,
  saveSettings,
  settingsStorageKey,
} from './settingsStorage';

describe('settings storage', () => {
  it('loads default settings when storage is empty', () => {
    expect(loadSettings(createMemoryStorage())).toEqual(createDefaultSettings());
  });

  it('saves and loads settings', () => {
    const storage = createMemoryStorage();
    const settings = {
      colorBlindMode: true,
      musicEnabled: true,
      reducedMotion: true,
      soundEffects: false,
      version: 1 as const,
    };

    saveSettings(settings, storage);

    expect(loadSettings(storage)).toEqual(settings);
  });

  it('sanitizes missing future settings fields', () => {
    const storage = createMemoryStorage();

    storage.setItem(
      settingsStorageKey,
      JSON.stringify({
        soundEffects: false,
        version: 1,
      }),
    );

    expect(loadSettings(storage)).toEqual({
      ...createDefaultSettings(),
      soundEffects: false,
    });
  });

  it('falls back to default settings for malformed JSON', () => {
    const storage = createMemoryStorage();

    storage.setItem(settingsStorageKey, '{bad');

    expect(loadSettings(storage)).toEqual(createDefaultSettings());
  });
});
