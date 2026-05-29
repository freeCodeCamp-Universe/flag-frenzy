import { motion } from 'framer-motion';

import type { CountryOption } from '../../game/types';

interface CountryBankProps {
  countries: CountryOption[];
  onSelect: (countryId: string) => void;
  selectedCountryId?: string;
  selectedCountryName?: string;
}

export function CountryBank({
  countries,
  onSelect,
  selectedCountryId,
  selectedCountryName,
}: CountryBankProps) {
  return (
    <aside
      aria-labelledby="countries-title"
      className="rounded border border-fcc-border bg-fcc-panel p-3"
    >
      <div className="border-b border-fcc-border pb-3">
        <h3 id="countries-title" className="font-mono text-xl font-bold">
          Countries
        </h3>
        {selectedCountryName === undefined ? null : (
          <p aria-live="polite" className="mt-2 font-mono text-base text-fcc-highlight">
            Now choose the matching flag for {selectedCountryName}.
          </p>
        )}
      </div>

      <ul className="mt-3 grid gap-2" aria-live="polite">
        {countries.map((country) => {
          const isSelected = country.id === selectedCountryId;

          return (
            <li key={country.id}>
              <motion.button
                aria-pressed={isSelected}
                className={[
                  'w-full rounded border px-3 py-3 text-left font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-panel',
                  isSelected
                    ? 'border-fcc-cta bg-fcc-cta text-fcc-background'
                    : 'border-fcc-border bg-fcc-background text-fcc-foreground hover:border-fcc-highlight hover:bg-fcc-surface',
                ].join(' ')}
                draggable
                onClick={() => {
                  onSelect(country.id);
                }}
                onDragStartCapture={(event) => {
                  event.dataTransfer.setData('text/plain', country.id);
                }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                {country.name}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
