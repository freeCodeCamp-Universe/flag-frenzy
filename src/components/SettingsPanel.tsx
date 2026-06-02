import { useSettings } from '../app/FlagFrenzyProvider';

interface SettingsPanelProps {
  compact?: boolean;
}

export function SettingsPanel({ compact = false }: SettingsPanelProps) {
  const { setSoundEffects, settings } = useSettings();
  const soundEffectsState = settings.soundEffects ? 'ON' : 'OFF';

  return (
    <section
      aria-label="Settings"
      className={[
        'rounded border border-fcc-border bg-fcc-surface p-3 text-left',
        compact ? '' : 'mx-auto mt-6 max-w-md',
      ].join(' ')}
    >
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <p className="font-mono text-base text-fcc-muted">
          Sound Effects: {soundEffectsState}
        </p>
        <button
          aria-checked={settings.soundEffects}
          aria-label={`Sound Effects: ${soundEffectsState}`}
          className={[
            'inline-flex min-h-12 min-w-32 items-center justify-center rounded border px-4 py-2 font-mono font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface',
            settings.soundEffects
              ? 'border-fcc-success bg-fcc-success text-fcc-background'
              : 'border-fcc-danger bg-fcc-background text-fcc-danger hover:bg-fcc-panel',
          ].join(' ')}
          onClick={() => {
            setSoundEffects(!settings.soundEffects);
          }}
          role="switch"
          type="button"
        >
          {settings.soundEffects ? 'ON' : 'OFF'}
        </button>
      </div>
    </section>
  );
}
