import type { AccessibilitySettings } from '../game/types';

interface AccessibilitySettingsPanelProps {
  onChange: (settings: Partial<AccessibilitySettings>) => void;
  settings: AccessibilitySettings;
}

export function AccessibilitySettingsPanel({
  onChange,
  settings,
}: AccessibilitySettingsPanelProps) {
  return (
    <section
      aria-labelledby="accessibility-settings-title"
      className="rounded border border-fcc-border bg-fcc-surface p-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-base text-fcc-muted">player settings</p>
          <h2 id="accessibility-settings-title" className="text-xl font-bold">
            Accessibility
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 font-mono text-base">
            <span className="text-fcc-muted">Font size</span>
            <select
              className="rounded border border-fcc-border bg-fcc-background px-3 py-2 text-fcc-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onChange={(event) => {
                onChange({
                  fontScale: event.currentTarget
                    .value as AccessibilitySettings['fontScale'],
                });
              }}
              value={settings.fontScale}
            >
              <option value="standard">Standard</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra large</option>
            </select>
          </label>

          <label className="grid gap-1 font-mono text-base">
            <span className="text-fcc-muted">Animations</span>
            <select
              className="rounded border border-fcc-border bg-fcc-background px-3 py-2 text-fcc-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onChange={(event) => {
                onChange({
                  animationSpeed: event.currentTarget
                    .value as AccessibilitySettings['animationSpeed'],
                });
              }}
              value={settings.animationSpeed}
            >
              <option value="standard">Standard</option>
              <option value="slow">Slow</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded border border-fcc-border bg-fcc-background px-3 py-2 font-mono text-base">
            <input
              checked={settings.useColorblindOutlines}
              className="size-5 accent-fcc-cta"
              onChange={(event) => {
                onChange({
                  useColorblindOutlines: event.currentTarget.checked,
                });
              }}
              type="checkbox"
            />
            <span>Flag outlines</span>
          </label>
        </div>
      </div>
    </section>
  );
}
